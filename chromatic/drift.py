"""Deterministic continuous Ambient Drift; no I/O, timers or random hues."""

import math
from functools import lru_cache

from .color import distance, ease, mix
from .field import flow, phase_for, position
from .palette import Palette
from .profiles import apply_profile, profile


@lru_cache(maxsize=128)
def route(palette: Palette) -> tuple:
    """Nearest weighted walk, with a second deterministic traversal for variation."""
    remaining = list(palette.colors)
    ordered = [remaining.pop(0)]
    while remaining:
        next_color = min(
            remaining, key=lambda c: distance(ordered[-1].lab, c.lab) / (0.4 + math.sqrt(c.weight))
        )
        ordered.append(next_color)
        remaining.remove(next_color)
    return tuple(ordered + ordered[-2:0:-1])


def target(
    palette: Palette,
    settings,
    group,
    light: str,
    elapsed: float,
    group_index: int = 0,
    light_index: int = 0,
) -> tuple:
    """Palette → phase/mode → role → saturation → brightness → per-light caps."""
    p = profile(settings, group, light)
    intensity = settings.intensity / 100 * p["intensity"] / 100
    depth = math.sqrt(intensity)
    colors = route(palette)
    phase = 0.0
    if group.participate and settings.mode == "spatial_flow":
        phase += group_index * 0.61803398875
    if group.control == "independent":
        phase += light_index * 0.61803398875
    elif group.control == "distributed":
        phase += light_index / max(1, len(group.lights)) * len(colors)
    selector = settings.static_color if group.static_color == "inherit" else group.static_color
    anchor = (
        palette.accent
        if selector == "accent" or (settings.mode != "static" and group.role == "decorative")
        else colors[0]
    )
    if settings.mode == "color_field" and palette.color_field:
        field = palette.color_field
        phase = phase_for(group, group_index, light_index)
        x, y = position(elapsed, settings.speed, phase, field.seed, depth)
        x, y = flow(
            x,
            y,
            elapsed if intensity else 0,
            settings.speed,
            field.seed,
            math.sqrt(settings.intensity / 100),
        )
        lab = field.sample(x, y, settings.field_contrast)
    elif settings.mode == "static" or intensity == 0:
        lab = anchor.lab
    elif settings.mode == "subtle_drift":
        nearest = min(
            (c for c in colors if c != anchor),
            key=lambda c: distance(anchor.lab, c.lab),
            default=anchor,
        )
        amount = (1 - math.cos(2 * math.pi * (elapsed / settings.speed + phase))) / 2
        lab = mix(anchor.lab, nearest.lab, depth * 0.55 * amount)
        # Single-hue artwork still breathes within its own hue at constant L.
        if nearest == anchor:
            scale = 1 - depth * 0.18 * amount
            lab = (lab[0], lab[1] * scale, lab[2] * scale)
    else:
        progress = elapsed / settings.speed + phase
        index = int(progress) % len(colors)
        next_index = (index + 1) % len(colors)
        moving = mix(colors[index].lab, colors[next_index].lab, ease(progress % 1))
        lab = mix(anchor.lab, moving, depth)
    brightness = settings.brightness
    if group.role != "main":
        brightness *= 0.25 + 0.75 * palette.lightness
    brightness *= 1 + p["breathing"] / 100 * math.sin(
        2 * math.pi * (elapsed / settings.speed + phase)
    )
    # Apply the chosen color strength once. Group/light limits below remain caps,
    # so an individual boost cannot bypass a shared saturation boundary.
    gain = p["saturation"] / 100
    lab = (lab[0], lab[1] * gain, lab[2] * gain)
    gp = profile(settings, group, "")
    lab, brightness = apply_profile(lab, brightness, gp, group.role)
    return apply_profile(lab, brightness, p, group.role)
