"""Standard light services, reversible sessions and conservative external ownership."""

from __future__ import annotations

import asyncio
import time
from collections import deque

from homeassistant.components.light import LightEntityFeature
from homeassistant.core import Context
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util.color import color_hs_to_RGB, color_xy_to_RGB

from .color import lab_to_rgb, rgb_to_lab
from .const import COLOR_MODES
from .transitions import TransitionWorker


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
    def __init__(self, hass, settings, changed) -> None:
        self.hass, self.settings = hass, settings
        self.changed = changed
        self.workers: dict[str, TransitionWorker] = {}
        self.originals: dict = {}
        self.excluded: dict[str, str] = {}
        self.contexts: deque[str] = deque(maxlen=256)
        self.expected_until: dict[str, float] = {}
        self.owned: set[str] = set()

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
        except HomeAssistantError as err:
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
        if not old or old.state in ("unknown", "unavailable"):
            # A reconnect is not manual intervention. Reapply even a static target:
            # a rebooted bulb may have forgotten its last physical color.
            if light in self.workers:
                self.workers[light].last = None
            return False
        if state.context.id in self.contexts or state.context.parent_id in self.contexts:
            return False
        # Ignore metadata-only changes, power reporting and polling refreshes.
        keys = ("brightness", "rgb_color", "hs_color", "xy_color", "color_temp_kelvin", "effect")
        if (
            old
            and old.state == state.state
            and all(old.attributes.get(k) == state.attributes.get(k) for k in keys)
        ):
            return False
        explicit = state.context.user_id is not None or state.context.parent_id is not None
        if explicit or state.state == "off" or time.monotonic() > self.expected_until.get(light, 0):
            self.excluded[light] = "manual_intervention"
            return True
        return False

    async def pause(self) -> None:
        for worker in self.workers.values():
            await worker.cancel()

    async def finish(self, restore: bool) -> None:
        await self.pause()
        if restore:
            for light, original in list(self.originals.items()):
                if light in self.excluded:
                    continue
                state = self.hass.states.get(light)
                if not state or state.state in ("unavailable", "unknown"):
                    continue
                data = {"entity_id": light}
                service = "turn_off" if original.state == "off" else "turn_on"
                if service == "turn_on":
                    attrs = original.attributes
                    if attrs.get("brightness") is not None:
                        data["brightness"] = attrs["brightness"]
                    mode = attrs.get("color_mode")
                    key = {
                        "rgb": "rgb_color",
                        "rgbw": "rgbw_color",
                        "rgbww": "rgbww_color",
                        "xy": "xy_color",
                        "hs": "hs_color",
                        "color_temp": "color_temp_kelvin",
                    }.get(mode)
                    # HA keeps inactive color attributes with a None value. Never
                    # pass those to a service schema (notably color_temp_kelvin).
                    # Prefer the original mode; use another recorded color only
                    # when the mode's own value is missing.
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
                    if attrs.get("effect") and attrs["effect"] != "off":
                        data["effect"] = attrs["effect"]
                try:
                    if light in self.excluded:
                        continue
                    await self.call(light, service, data)
                except RuntimeError, TimeoutError:
                    continue
        self.originals.clear()
        self.owned.clear()
        self.excluded.clear()
        for worker in self.workers.values():
            worker.last = None

    async def close(self) -> None:
        for worker in self.workers.values():
            await worker.close()

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
        }
        if light in self.workers:
            result.update(self.workers[light].diagnostics())
        return result
