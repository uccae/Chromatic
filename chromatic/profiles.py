"""Role defaults and explicit group/light overrides, applied after animation."""

from dataclasses import asdict

from .color import Lab, clamp, limit_saturation
from .const import ROLE_DEFAULTS


def profile(settings, group, light: str) -> dict:
    result = {
        "strategy": settings.strategy,
        "allow_software": settings.allow_software,
        "software_hz": settings.software_hz,
        "high_rate_confirmed": settings.high_rate_confirmed,
        "max_saturation": settings.max_saturation,
        "saturation": settings.saturation,
        "intensity": settings.group_intensity,
        "min_brightness": settings.min_brightness,
        "max_brightness": settings.max_brightness,
        "breathing": settings.breathing,
        "min_delta": settings.min_delta,
        "hardware_interval": settings.hardware_interval,
        "hardware_max_duration": settings.hardware_max_duration,
    }
    result.update(ROLE_DEFAULTS.get(group.role, {}))
    for overrides in (group.overrides, group.light_overrides.get(light)):
        if overrides:
            result.update(
                {
                    k: v
                    for k, v in asdict(overrides).items()
                    if v is not None and k != "high_rate_confirmed"
                }
            )
    if light in group.light_overrides:
        group_profile = profile(settings, group, "")
        result["min_brightness"] = max(result["min_brightness"], group_profile["min_brightness"])
        result["max_brightness"] = min(result["max_brightness"], group_profile["max_brightness"])
    return result


def apply_profile(lab: Lab, brightness: float, p: dict, role: str) -> tuple[Lab, float]:
    if role == "main":
        lab = (max(0.7, lab[0]), lab[1], lab[2])
    lab = limit_saturation(lab, p["max_saturation"])
    return lab, clamp(brightness, p["min_brightness"], p["max_brightness"])
