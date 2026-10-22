"""Playback lifecycle, stale artwork rejection and independent light timelines."""

from __future__ import annotations

import asyncio
import time
from collections import deque
from dataclasses import asdict

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from .artwork import Artwork, media_key
from .const import DOMAIN, SIGNAL_UPDATE
from .drift import target
from .lights import LightManager
from .models import Settings, validate_ownership
from .palette import InvalidArtwork
from .profiles import profile


class ChromaticCoordinator:
    def __init__(self, hass, entry, settings: Settings) -> None:
        self.hass, self.entry, self.settings = hass, entry, settings
        self.artwork = Artwork(hass)
        self.lights = LightManager(hass, settings, self.changed)
        self.palette = None
        self.status = "disabled" if not settings.enabled else "waiting"
        self.messages: deque[dict] = deque(maxlen=40)
        self.generation = 0
        self.revision = 0
        self._key: tuple | None = None
        self._task: asyncio.Task | None = None
        self._animations: list[asyncio.Task] = []
        self._jobs: set[asyncio.Task] = set()
        self._lock = asyncio.Lock()
        self._unsubs = []
        self._stop_timer = None
        self._retry_timer = None
        self._publish_timer = None
        self._retry_count = 0
        self._closed = False
        self._session = False
        self._started = time.monotonic()
        self._frozen_elapsed = 0.0

    async def start(self):
        self._listen()
        self._unsubs.append(
            self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, self._shutdown_event)
        )
        self.notify()

    def _listen(self):
        @callback
        def changed(event):
            if event.data["entity_id"] == self.settings.media_player:
                old, new = event.data.get("old_state"), event.data.get("new_state")
                if not old or not new or old.state != new.state or media_key(old) != media_key(new):
                    self._retry_count = 0
                    self.notify()
            else:
                old, new = event.data.get("old_state"), event.data.get("new_state")
                if (
                    old
                    and new
                    and old.attributes.get("entity_id") != new.attributes.get("entity_id")
                ):
                    # HA-group membership can change after configuration validation.
                    hub = self.hass.data.get(DOMAIN)
                    for co in hub.entries.values() if hub else (self,):
                        co.notify()
                if self.lights.external_change(event):
                    worker = self.lights.workers.get(event.data["entity_id"])
                    if worker and worker.task:
                        worker.task.cancel()
                self.changed()

        entities = [*sorted(self.settings.all_lights)]
        if self.settings.media_player:
            entities.append(self.settings.media_player)
        if entities:
            self._unsubs.append(async_track_state_change_event(self.hass, entities, changed))

    def _background(self, coroutine, name):
        task = self.hass.async_create_background_task(coroutine, name)
        self._jobs.add(task)
        task.add_done_callback(self._jobs.discard)
        return task

    @callback
    def changed(self):
        """Coalesce notifications to ≤1/s even during software transitions."""
        if self._closed or self._publish_timer:
            return

        @callback
        def publish(_now):
            self._publish_timer = None
            async_dispatcher_send(self.hass, SIGNAL_UPDATE)

        self._publish_timer = async_call_later(self.hass, 1, publish)

    def message(self, code: str):
        if not self.messages or self.messages[-1]["code"] != code:
            self.messages.append({"code": code})
        self.changed()

    @callback
    def notify(self):
        if self._closed:
            return
        self.generation += 1
        for name in ("_stop_timer", "_retry_timer"):
            if timer := getattr(self, name):
                timer()
                setattr(self, name, None)
        if self._task and not self._task.done():
            self._task.cancel()
        self._task = self._background(self._handle(self.generation), "chromatic-playback")

    async def _stop_animation(self):
        if self._animations:
            self._frozen_elapsed = time.monotonic() - self._started
        for task in self._animations:
            task.cancel()
        await asyncio.gather(*self._animations, return_exceptions=True)
        self._animations.clear()
        await self.lights.pause()

    async def _handle(self, generation):
        async with self._lock:
            if self._closed or generation != self.generation:
                return
            await self._stop_animation()
            if not self.settings.configured:
                self.status = "needs_setup"
                self.changed()
                return
            try:
                validate_ownership(self.hass, self.settings, self.entry.entry_id)
            except ValueError:
                self.status = "control_conflict"
                self.lights.excluded.update(
                    {light: "control_conflict" for light in self.settings.all_lights}
                )
                self.message("control_conflict")
                return
            for light in list(self.lights.excluded):
                if self.lights.excluded[light] == "control_conflict":
                    self.lights.excluded.pop(light)
            state = self.hass.states.get(self.settings.media_player)
            playback = state.state if state else "unavailable"
            if not self.settings.enabled:
                await self.lights.finish(self.settings.restore_on_stop)
                self._session = False
                self.status = "disabled"
            elif playback == "paused":
                self.status = "paused"
                if self.settings.pause_dim and self.palette:
                    await self._dim()
            elif playback != "playing":
                self.status = (
                    "source_unavailable" if playback in ("unknown", "unavailable") else "waiting"
                )
                if self._session:

                    @callback
                    def stop(_now):
                        self._stop_timer = None
                        self._background(self._finish_session(generation), "chromatic-stop")

                    self._stop_timer = async_call_later(self.hass, self.settings.stop_delay, stop)
            else:
                self.status = "fetching_artwork"
                self.changed()
                key = media_key(state)
                if key != self._key or self.palette is None:
                    try:
                        self.status = "analyzing_palette"
                        palette = await self.artwork.palette(
                            self.settings.media_player, self.settings.palette_size
                        )
                    except (InvalidArtwork, TimeoutError, OSError, ValueError, RuntimeError) as err:
                        if generation == self.generation:
                            self.status = "artwork_unavailable"
                            safe_codes = {
                                "source_entity_not_loaded",
                                "artwork_unavailable",
                                "artwork_too_large",
                                "artwork_fetch_failed",
                                "artwork_timeout",
                            }
                            code = (
                                str(err) if isinstance(err, InvalidArtwork) else "artwork_timeout"
                            )
                            self.message(code if code in safe_codes else "image_processing_error")
                            if self._retry_count < 3:
                                delay = (2, 5, 15)[self._retry_count]
                                self._retry_count += 1
                                self._retry_timer = async_call_later(
                                    self.hass, delay, lambda _: self.notify()
                                )
                        return
                    if self._closed or generation != self.generation:
                        return
                    self.palette, self._key = palette, key
                if not self._session:
                    self._frozen_elapsed = 0.0
                    self._session = True
                self._started = time.monotonic() - self._frozen_elapsed
                self.status = "syncing"
                groups = self.settings.scopes
                for gi, group in enumerate(groups):
                    if not group.enabled or self.settings.mode not in group.modes:
                        continue
                    for li, light in enumerate(group.lights):
                        self._animations.append(
                            self._background(
                                self._animate(generation, group, light, gi, li),
                                f"chromatic-ambient-{light}",
                            )
                        )
            self.changed()

    async def _animate(self, generation, group, light, gi, li):
        p = profile(self.settings, group, light)
        duration = min(self.settings.track_transition, p["hardware_max_duration"], 4)
        interval = max(1, min(4, p["hardware_interval"]), duration)
        palette, settings = self.palette, self.settings
        live_field = settings.mode == "color_field" and palette.color_field is not None

        def sample():
            return target(palette, settings, group, light, time.monotonic() - self._started, gi, li)

        first = True
        while not self._closed and generation == self.generation:
            if self.lights.eligible(light):
                worker = self.lights.worker(light)
                elapsed = (
                    time.monotonic() - self._started + (0 if first and not live_field else duration)
                )
                goal = target(self.palette, self.settings, group, light, elapsed, gi, li)
                await worker.move(
                    goal,
                    duration,
                    p,
                    self.lights.supports_transition(light),
                    sampler=sample if live_field else None,
                    stream_for=interval if live_field else 0,
                    blend=first,
                )
                if self.settings.mode == "static" or self.settings.intensity == 0:
                    if worker.task:
                        await worker.task
                    # Retry failed static commands with backoff; recover unavailable lamps.
                    if worker.errors == 0:
                        await asyncio.sleep(interval)
                        if self.lights.eligible(light):
                            continue
            first = False
            await asyncio.sleep(interval)

    async def _dim(self):
        from .lights import current_color

        for group in self.settings.scopes:
            for light in group.lights:
                current = current_color(self.hass.states.get(light))
                if light not in self.lights.owned or not self.lights.eligible(light) or not current:
                    continue
                p = profile(self.settings, group, light)
                brightness = max(
                    p["min_brightness"], current[1] * (1 - self.settings.pause_dim / 100)
                )
                await self.lights.worker(light).move(
                    (current[0], brightness),
                    self.settings.track_transition,
                    p,
                    self.lights.supports_transition(light),
                )

    async def _finish_session(self, generation):
        async with self._lock:
            if generation != self.generation or self._closed:
                return
            await self._stop_animation()
            await self.lights.finish(self.settings.restore_on_stop)
            self._session = False
            self.changed()

    async def apply(self, settings: Settings):
        """Apply persisted UI/options settings; harmless renames preserve the session."""
        old = self.settings.to_dict()
        self.revision += 1
        for group in old["groups"]:
            group.pop("name")
        compare = settings.to_dict()
        for group in compare["groups"]:
            group.pop("name")
        if old == compare:
            self.settings = settings
            self.lights.settings = settings
            self.message("group_renamed")
            return
        self.generation += 1
        if self._task:
            self._task.cancel()
            await asyncio.gather(self._task, return_exceptions=True)
        async with self._lock:
            await self._stop_animation()
            if (
                settings.media_player != self.settings.media_player
                or settings.all_lights != self.settings.all_lights
            ):
                await self.lights.finish(self.settings.restore_on_stop)
                await self.lights.close()
                self.lights = LightManager(self.hass, settings, self.changed)
                self._session = False
            if (
                settings.palette_size != self.settings.palette_size
                or settings.media_player != self.settings.media_player
            ):
                self._key = None
            self.settings = settings
            self.lights.settings = settings
            for unsub in self._unsubs:
                unsub()
            self._unsubs.clear()
            self._listen()
            self._unsubs.append(
                self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, self._shutdown_event)
            )
        self.notify()

    async def reset_session(self):
        """Finish synchronously before restart, so rapid service calls cannot skip release."""
        self.generation += 1
        if self._task:
            self._task.cancel()
            await asyncio.gather(self._task, return_exceptions=True)
        async with self._lock:
            await self._stop_animation()
            await self.lights.finish(self.settings.restore_on_stop)
            self._session = False
        self.notify()

    @callback
    def _shutdown_event(self, _event):
        self._background(self.close(restore=False), "chromatic-shutdown")

    async def close(self, restore: bool = True):
        self._closed = True
        self.generation += 1
        for name in ("_stop_timer", "_retry_timer", "_publish_timer"):
            if timer := getattr(self, name):
                timer()
                setattr(self, name, None)
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._task:
            self._task.cancel()
            await asyncio.gather(self._task, return_exceptions=True)
        await self._stop_animation()
        await self.lights.finish(restore and self.settings.restore_on_stop)
        await self.lights.close()
        current = asyncio.current_task()
        pending = [job for job in self._jobs if job is not current and not job.done()]
        for job in pending:
            job.cancel()
        await asyncio.gather(*pending, return_exceptions=True)

    def snapshot(self, private: bool = False) -> dict:
        state = self.hass.states.get(self.settings.media_player)
        attrs = state.attributes if state else {}
        groups = []
        for group in self.settings.groups:
            lights = [self.lights.diagnostics(light) for light in group.lights]
            available = sum(light["available"] for light in lights)
            groups.append(
                {
                    **asdict(group),
                    "effective_profile": profile(self.settings, group, ""),
                    "lights_status": lights,
                    "available": available,
                    "status": "group_disabled"
                    if not group.enabled
                    else "group_excluded_mode"
                    if self.settings.mode not in group.modes
                    else "group_unavailable"
                    if available == 0
                    else "group_partial"
                    if available < len(lights)
                    else "available",
                }
            )
        data = {
            "entry_id": self.entry.entry_id,
            "title": self.entry.title,
            "revision": self.revision,
            "status": self.status,
            "settings": self.settings.to_dict(),
            "lights_status": [
                {
                    **self.lights.diagnostics(scope.lights[0]),
                    "role": scope.role,
                    "effective_profile": profile(self.settings, scope, scope.lights[0]),
                }
                for scope in self.settings.standalone_scopes
            ],
            "groups": groups,
            "palette": self.palette.to_dict(include_field=not private) if self.palette else None,
            "messages": list(self.messages),
            "source_available": bool(state and state.state not in ("unknown", "unavailable")),
            "configured": self.settings.configured,
        }
        if not private:
            data["motion"] = {
                "elapsed": round(
                    time.monotonic() - self._started
                    if self.status == "syncing"
                    else self._frozen_elapsed,
                    3,
                ),
                "running": self.status == "syncing",
            }
            # Only a local HA proxy path is exposed to the browser. Never a private remote URL.
            picture = attrs.get("entity_picture", "")
            data["media"] = {
                "title": attrs.get("media_title"),
                "artist": attrs.get("media_artist"),
                "picture": picture
                if isinstance(picture, str) and picture.startswith("/api/media_player_proxy/")
                else None,
            }
        return data
