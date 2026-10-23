"""Standard light services, reversible sessions and conservative external ownership."""

from __future__ import annotations

import asyncio
import logging
import time
from collections import deque

from homeassistant.components.light import LightEntityFeature
from homeassistant.core import Context, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.util.color import color_hs_to_RGB, color_xy_to_RGB

from .color import lab_to_rgb, rgb_to_lab
from .const import COLOR_MODES
from .models import Settings, validate_ownership
from .transitions import TransitionWorker

_LOGGER = logging.getLogger(__name__)
RESTORE_WINDOW = 120


def current_color(state):
    if not state:
        return None
    a = state.attributes
    rgb = a.get("rgb_color")
    if not rgb and a.get("hs_color"):
        rgb = color_hs_to_RGB(*a["hs_color"])
    if not rgb and a.get("xy_color"):
        rgb = color_xy_to_RGB(*a["xy_color"])
    if not rgb:
        rgb = (a.get("rgbw_color") or a.get("rgbww_color") or (255, 255, 255))[:3]
    brightness = a.get("brightness")
    return rgb_to_lab(tuple(rgb)), (165 if brightness is None else brightness) / 255 * 100


class LightManager:
    def __init__(self, hass, settings, changed, entry_id: str | None = None) -> None:
        self.hass, self.settings = hass, settings
        self.changed = changed
        self.entry_id = entry_id
        self.workers: dict[str, TransitionWorker] = {}
        self.originals: dict = {}
        self.excluded: dict[str, str] = {}
        self.contexts: deque[str] = deque(maxlen=256)
        self.expected_until: dict[str, float] = {}
        self.owned: set[str] = set()
        self.pending_restore: dict[str, dict] = {}
        self.restore_failures: dict[str, str] = {}
        self._restore_lock = asyncio.Lock()
        self._restore_timer = None
        self._restore_task: asyncio.Task | None = None
        self._closed = False

    def supported(self, light: str) -> bool:
        state = self.hass.states.get(light)
        return bool(
            state and set(state.attributes.get("supported_color_modes") or ()) & COLOR_MODES
        )

    def supports_transition(self, light: str) -> bool:
        state = self.hass.states.get(light)
        return bool(
            state
            and (state.attributes.get("supported_features") or 0) & LightEntityFeature.TRANSITION
        )

    def eligible(self, light: str) -> bool:
        state = self.hass.states.get(light)
        return bool(
            state
            and state.state not in ("unavailable", "unknown")
            and (state.state == "on" or self.settings.turn_on_lights)
            and light not in self.excluded
            and self.supported(light)
        )

    def worker(self, light: str) -> TransitionWorker:
        if light not in self.workers:

            async def send(lab, brightness, transition):
                if not self.eligible(light):
                    raise RuntimeError("Light unavailable or released")
                if light not in self.originals:
                    self.originals[light] = self.hass.states.get(light)
                data = {
                    "entity_id": light,
                    "rgb_color": lab_to_rgb(lab),
                    "brightness": max(1, round(brightness / 100 * 255)),
                }
                if transition is not None:
                    data["transition"] = transition
                await self.call(light, "turn_on", data, transition or 0)

            self.workers[light] = TransitionWorker(
                send, lambda: current_color(self.hass.states.get(light)), self.changed
            )
        return self.workers[light]

    async def call(self, light: str, service: str, data: dict, duration: float = 0):
        context = Context()
        self.contexts.append(context.id)
        self.expected_until[light] = time.monotonic() + duration + 2
        self.owned.add(light)
        try:
            async with asyncio.timeout(8):
                await self.hass.services.async_call(
                    "light", service, data, blocking=True, context=context
                )
        except Exception as err:
            # Avoid leaking a device URL or token contained in service errors.
            raise RuntimeError("Light service failed") from err

    def external_change(self, event) -> bool:
        light = event.data["entity_id"]
        if light not in self.owned or light in self.excluded:
            return False
        state = event.data.get("new_state")
        old = event.data.get("old_state")
        if not state or state.state in ("unknown", "unavailable"):
            return False
        if state.context.id in self.contexts or state.context.parent_id in self.contexts:
            return False
        explicit = state.context.user_id is not None or state.context.parent_id is not None
        if (not old or old.state in ("unknown", "unavailable")) and not explicit:
            # A reconnect is not manual intervention. Reapply even a static target:
            # a rebooted bulb may have forgotten its last physical color.
            if light in self.workers:
                self.workers[light].last = None
            if light in self.pending_restore:
                self.pending_restore[light]["retry_at"] = 0
                self._schedule_restore()
            return False
        # Ignore metadata-only changes, power reporting and polling refreshes.
        keys = (
            "brightness",
            "color_mode",
            "rgb_color",
            "rgbw_color",
            "rgbww_color",
            "hs_color",
            "xy_color",
            "color_temp_kelvin",
            "effect",
        )
        if (
            old
            and old.state == state.state
            and all(old.attributes.get(k) == state.attributes.get(k) for k in keys)
        ):
            return False
        if explicit or state.state == "off" or time.monotonic() > self.expected_until.get(light, 0):
            self.excluded[light] = "manual_intervention"
            if light in self.pending_restore:
                self._forget(light, release=False)
                self._schedule_restore()
            return True
        return False

    async def pause(self, lights: set[str] | None = None) -> None:
        for light, worker in self.workers.items():
            if lights is None or light in lights:
                await worker.cancel()

    async def activate(self, lights: set[str]) -> None:
        """A new session inherits an unresolved original, never its modified state."""
        async with self._restore_lock:
            for light in lights:
                self.pending_restore.pop(light, None)
                self.restore_failures.pop(light, None)
            self._schedule_restore()

    def _forget(self, light: str, *, release: bool = True) -> None:
        self.originals.pop(light, None)
        self.pending_restore.pop(light, None)
        self.owned.discard(light)
        self.expected_until.pop(light, None)
        if release:
            self.excluded.pop(light, None)
        if light in self.workers:
            self.workers[light].last = None

    @staticmethod
    def _restore_data(light, original):
        data = {"entity_id": light}
        service = "turn_off" if original.state == "off" else "turn_on"
        if service == "turn_off":
            return service, data
        attrs = original.attributes
        if attrs.get("brightness") is not None:
            data["brightness"] = attrs["brightness"]
        # Effect and color are mutually exclusive in several HA drivers, including
        # Govee Local. Restore the active effect without an inactive RGB value.
        if attrs.get("effect") and str(attrs["effect"]).lower() not in ("off", "none"):
            data["effect"] = attrs["effect"]
        elif attrs.get("color_mode") == "white":
            data["white"] = attrs.get("brightness") or 255
        else:
            key = {
                "rgb": "rgb_color",
                "rgbw": "rgbw_color",
                "rgbww": "rgbww_color",
                "xy": "xy_color",
                "hs": "hs_color",
                "color_temp": "color_temp_kelvin",
            }.get(attrs.get("color_mode"))
            for color_key in (
                key,
                "rgb_color",
                "hs_color",
                "xy_color",
                "rgbw_color",
                "rgbww_color",
            ):
                if color_key and attrs.get(color_key) is not None:
                    data[color_key] = attrs[color_key]
                    break
        return service, data

    async def finish(self, restore: bool, lights: set[str] | None = None) -> None:
        await self.pause(lights)
        selected = set(self.originals) if lights is None else lights
        for light in selected:
            if not restore or light in self.excluded:
                self._forget(light)
            elif light in self.originals:
                self.pending_restore.setdefault(
                    light,
                    {"expires": time.monotonic() + RESTORE_WINDOW, "retry_at": 0, "attempts": 0},
                )
        await self.retry_restores(selected)
        if lights is None:
            self.excluded.clear()
        for light, worker in self.workers.items():
            if lights is None or light in lights:
                worker.last = None

    async def retry_restores(self, lights: set[str] | None = None) -> None:
        """Bounded retries while loaded; explicit external control always wins."""
        async with self._restore_lock:
            for light, pending in list(self.pending_restore.items()):
                if self._closed or (lights is not None and light not in lights):
                    continue
                if light not in self.pending_restore or light not in self.originals:
                    continue
                now = time.monotonic()
                if light in self.excluded:
                    self._forget(light)
                    continue
                if now >= pending["expires"]:
                    self.restore_failures[light] = "restore_expired"
                    # Bound retained diagnostics across repeated reconfiguration.
                    if len(self.restore_failures) > 128:
                        self.restore_failures.pop(next(iter(self.restore_failures)))
                    self._forget(light)
                    _LOGGER.warning(
                        "Original light state could not be restored within %s seconds",
                        RESTORE_WINDOW,
                    )
                    continue
                if now < pending["retry_at"]:
                    continue
                if self.entry_id is not None:
                    try:
                        validate_ownership(self.hass, Settings(lights=[light]), self.entry_id)
                    except ValueError:
                        self.restore_failures[light] = "restore_reassigned"
                        self._forget(light)
                        continue
                state = self.hass.states.get(light)
                pending["reason"] = "light_unavailable"
                if state and state.state not in ("unavailable", "unknown"):
                    service, data = self._restore_data(light, self.originals[light])
                    try:
                        await self.call(light, service, data)
                    except (RuntimeError, TimeoutError):
                        pending["reason"] = "restore_failed"
                    else:
                        self.restore_failures.pop(light, None)
                        if light in self.pending_restore:
                            self._forget(light)
                        continue
                    if light not in self.pending_restore:
                        continue
                delay = (2, 5, 15, 30, 60)[min(pending["attempts"], 4)]
                pending["attempts"] += 1
                pending["retry_at"] = time.monotonic() + delay
            self._schedule_restore()
            self.changed()

    def _schedule_restore(self) -> None:
        if self._restore_timer:
            self._restore_timer()
            self._restore_timer = None
        if self._closed or not self.pending_restore:
            return
        when = min(min(p["retry_at"], p["expires"]) for p in self.pending_restore.values())

        @callback
        def retry(_now):
            self._restore_timer = None
            if self._restore_lock.locked():
                self._restore_timer = async_call_later(self.hass, 1, retry)
                return
            self._restore_task = self.hass.async_create_background_task(
                self.retry_restores(), "chromatic-restore"
            )

        self._restore_timer = async_call_later(self.hass, max(0, when - time.monotonic()), retry)

    async def close(self) -> None:
        self._closed = True
        if self._restore_timer:
            self._restore_timer()
            self._restore_timer = None
        if self._restore_task:
            self._restore_task.cancel()
            await asyncio.gather(self._restore_task, return_exceptions=True)
        for worker in self.workers.values():
            await worker.close()
        if self.pending_restore:
            _LOGGER.warning(
                "Chromatic unloaded with %s unrestored light state(s)", len(self.pending_restore)
            )

    def diagnostics(self, light: str) -> dict:
        state = self.hass.states.get(light)
        reason = self.excluded.get(light)
        if not state or state.state in ("unavailable", "unknown"):
            reason = "light_unavailable"
        elif not self.supported(light):
            reason = "unsupported_color_mode"
        elif state.state == "off" and not self.settings.turn_on_lights:
            reason = "off_not_authorized"
        result = {
            "entity_id": light,
            "available": bool(state and state.state not in ("unavailable", "unknown")),
            "excluded": reason,
            "transition_advertised": self.supports_transition(light),
            "restore_pending": light in self.pending_restore,
            "restore_error": self.pending_restore.get(light, {}).get("reason")
            or self.restore_failures.get(light),
        }
        if light in self.workers:
            result.update(self.workers[light].diagnostics())
        return result
