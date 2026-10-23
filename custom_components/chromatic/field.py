"""A blurred spatial color field, sampled along smooth non-repeating paths.

The field retains hundreds of image samples rather than a handful of clusters.
Alpha-normalized Gaussian filtering and a convex cubic B-spline keep edges smooth
without transparent black fringes or interpolation overshoot. Build in an executor.
"""

import math
from dataclasses import dataclass
from functools import cached_property

from PIL import Image

from .color import Lab, clamp, distance, mix, rgb_to_lab

FIELD_SIZE = 20


def position(
    elapsed: float, speed: float, phase: float = 0, seed: float = 0, amount: float = 1
) -> tuple[float, float]:
    """Bounded, differentiable travel; incommensurate periods avoid short loops."""
    t = 2 * math.pi * elapsed / speed
    a = 2 * math.pi * (phase + seed)
    b = 2 * math.pi * (phase * 0.754877666 + seed * 0.618033989)
    point = (
        0.5 + 0.47 * math.sin(t / math.sqrt(17) + a + 0.22 * math.sin(t / math.sqrt(199) + b)),
        0.5 + 0.47 * math.sin(t / math.sqrt(31) + b + 0.24 * math.sin(t / math.sqrt(283) + a)),
    )
    if amount != 1:
        origin = position(0, speed, phase, seed)
        return tuple(origin[i] + (point[i] - origin[i]) * amount for i in range(2))
    return point


def phase_for(group, group_index: int, light_index: int) -> float:
    """Same group = same probe; other controls spread probes over the same map."""
    phase = group_index * 0.61803398875 if group.participate else 0
    if group.control == "independent":
        phase += light_index * 0.61803398875
    elif group.control == "distributed":
        phase += light_index / max(1, len(group.lights))
    return phase


def flow(
    x: float, y: float, elapsed: float, speed: float, seed: float = 0, amount: float = 1
) -> tuple[float, float]:
    """Slowly advect the color map itself, with a stationary and bounded border."""
    t = 2 * math.pi * elapsed / (9 * speed)
    a = 2 * math.pi * seed
    envelope = 0.055 * amount * math.sin(math.pi * x) * math.sin(math.pi * y)
    dx = envelope * (math.sin(t + a + 2 * y) - math.sin(a + 2 * y))
    dy = envelope * (math.sin(t / math.sqrt(2) + a + 2 * x) - math.sin(a + 2 * x))
    return clamp(x + dx), clamp(y + dy)


def _weights(t: float) -> tuple[float, ...]:
    return (
        (1 - t) ** 3 / 6,
        (3 * t**3 - 6 * t * t + 4) / 6,
        (-3 * t**3 + 3 * t * t + 3 * t + 1) / 6,
        t**3 / 6,
    )


@dataclass(frozen=True)
class ColorField:
    width: int
    height: int
    labs: tuple[Lab, ...]
    seed: float = 0

    def sample(self, x: float, y: float, contrast: float = 100) -> Lab:
        x, y = clamp(x) * (self.width - 1), clamp(y) * (self.height - 1)
        ix, iy = math.floor(x), math.floor(y)
        wx, wy = _weights(x - ix), _weights(y - iy)
        result = [0.0, 0.0, 0.0]
        for j in range(4):
            row = max(0, min(self.height - 1, iy + j - 1)) * self.width
            for i in range(4):
                lab = self.labs[row + max(0, min(self.width - 1, ix + i - 1))]
                weight = wx[i] * wy[j]
                for channel in range(3):
                    result[channel] += lab[channel] * weight
        if contrast != 100:
            gain = contrast / 100
            for channel in (1, 2):
                result[channel] = self.center[channel] + gain * (
                    result[channel] - self.center[channel]
                )
        return tuple(result)

    @cached_property
    def center(self) -> Lab:
        return tuple(sum(lab[c] for lab in self.labs) / len(self.labs) for c in range(3))

    @cached_property
    def _encoded(self) -> tuple:
        return tuple(tuple(round(c, 6) for c in lab) for lab in self.labs)

    def to_dict(self) -> dict:
        return {
            "width": self.width,
            "height": self.height,
            "labs": self._encoded,
            "seed": self.seed,
            "center": tuple(round(c, 6) for c in self.center),
        }


@dataclass
class _Detail:
    mass: float
    lab: Lab
    x: float
    y: float
    left: float
    top: float
    right: float
    bottom: float

    def merge(self, other):
        fraction = other.mass / (self.mass + other.mass)
        self.lab = mix(self.lab, other.lab, fraction)
        self.x += (other.x - self.x) * fraction
        self.y += (other.y - self.y) * fraction
        self.mass += other.mass
        self.left, self.top = min(self.left, other.left), min(self.top, other.top)
        self.right, self.bottom = max(self.right, other.right), max(self.bottom, other.bottom)


def _small_details(image: Image.Image) -> tuple[list[_Detail], float]:
    """Find coherent rare accents before downsampling, ignoring isolated noise."""
    width, height = image.size
    colors, visible = {}, {}
    for index, (r, g, b, alpha) in enumerate(image.get_flattened_data()):
        if alpha < 32:
            continue
        rgb = r, g, b
        lab = colors.get(rgb)
        if lab is None:
            colors[rgb] = lab = rgb_to_lab(rgb)
        visible[index] = lab, alpha / 255
    mass = sum(weight for _, weight in visible.values())
    if not mass:
        return [], 0
    background = tuple(
        sum(lab[c] * weight for lab, weight in visible.values()) / mass for c in range(3)
    )
    candidates = {index for index, (lab, _) in visible.items() if distance(lab, background) >= 0.12}
    fraction = sum(visible[index][1] for index in candidates) / mass
    if not 0.0003 <= fraction <= 0.10:
        return [], mass
    components = []
    # Traverse in image order, not set order: identical artwork gives identical maps.
    for first in sorted(candidates):
        if first not in candidates:
            continue
        candidates.remove(first)
        pending, points = [first], []
        while pending:
            index = pending.pop()
            points.append(index)
            x, y = index % width, index // width
            for ny in range(max(0, y - 1), min(height, y + 2)):
                for nx in range(max(0, x - 1), min(width, x + 2)):
                    neighbor = ny * width + nx
                    if neighbor in candidates:
                        candidates.remove(neighbor)
                        pending.append(neighbor)
        weight = sum(visible[index][1] for index in points)
        if len(points) < 3 or weight < 2:
            continue
        lab = tuple(
            sum(visible[index][0][c] * visible[index][1] for index in points) / weight
            for c in range(3)
        )
        xs, ys = [i % width for i in points], [i // width for i in points]
        components.append(
            _Detail(
                weight,
                lab,
                sum((i % width) * visible[i][1] for i in points) / weight / max(1, width - 1),
                sum((i // width) * visible[i][1] for i in points) / weight / max(1, height - 1),
                min(xs) / width,
                min(ys) / height,
                max(xs) / width,
                max(ys) / height,
            )
        )
    components.sort(key=lambda d: d.mass * distance(d.lab, background), reverse=True)
    remaining = components[:32]
    merged = []
    while remaining:
        current = remaining.pop(0)
        changed = True
        while changed:
            changed = False
            for other in remaining[:]:
                dx = max(0, current.left - other.right, other.left - current.right)
                dy = max(0, current.top - other.bottom, other.top - current.bottom)
                if math.hypot(dx, dy) <= 0.04 and distance(current.lab, other.lab) <= 0.10:
                    current.merge(other)
                    remaining.remove(other)
                    changed = True
        merged.append(current)
    merged.sort(key=lambda d: d.mass * distance(d.lab, background), reverse=True)
    return merged[:4], mass


def _preserve_details(labs: tuple[Lab, ...], image: Image.Image) -> tuple[Lab, ...]:
    details, mass = _small_details(image)
    if not details:
        return labs
    samples = []
    for y in range(FIELD_SIZE):
        for x in range(FIELD_SIZE):
            weights = []
            for detail in details:
                rx = min(0.22, 0.12 + 0.35 * (detail.right - detail.left))
                ry = min(0.22, 0.12 + 0.35 * (detail.bottom - detail.top))
                strength = min(0.32, 0.16 + 0.16 * math.sqrt(detail.mass / mass / 0.01))
                radius = ((x / (FIELD_SIZE - 1) - detail.x) / rx) ** 2 + (
                    (y / (FIELD_SIZE - 1) - detail.y) / ry
                ) ** 2
                weights.append(strength * math.exp(-radius / 2))
            samples.append(weights)
    # Rare details gain a visible cloud, while retaining the cover's dominant tone.
    average = sum(min(0.34, sum(weights)) for weights in samples) / len(samples)
    scale = min(1, 0.055 / average)
    result = []
    for lab, weights in zip(labs, samples, strict=True):
        total = sum(weights)
        accent = tuple(
            sum(d.lab[c] * weight for d, weight in zip(details, weights, strict=True)) / total
            for c in range(3)
        )
        result.append(mix(lab, accent, min(0.34, total * scale)))
    return tuple(result)


def build_field(image: Image.Image, digest: str) -> ColorField:
    """Retain image layout, blur premultiplied OKLab and normalize by alpha."""
    rgba = image.convert("RGBA").resize((FIELD_SIZE, FIELD_SIZE), Image.Resampling.BOX)
    cells = []
    for r, g, b, a in rgba.get_flattened_data():
        alpha = a / 255
        cells.append(tuple(c * alpha for c in rgb_to_lab((r, g, b))) + (alpha,))
    total_alpha = sum(cell[3] for cell in cells)
    # Fully transparent images are rejected by extract_palette before this call.
    if not total_alpha:
        visible = [
            (rgb_to_lab((r, g, b)), a)
            for r, g, b, a in image.convert("RGBA").get_flattened_data()
            if a
        ]
        fallback = tuple(
            sum(lab[c] * a for lab, a in visible) / sum(a for _, a in visible) for c in range(3)
        )
        return ColorField(
            FIELD_SIZE, FIELD_SIZE, (fallback,) * FIELD_SIZE**2, int(digest[:8], 16) / 2**32
        )
    fallback = tuple(sum(cell[c] for cell in cells) / total_alpha for c in range(3))
    sigma, radius = 3.2, 10
    kernel = [math.exp(-(d * d) / (2 * sigma * sigma)) for d in range(-radius, radius + 1)]
    scale = sum(kernel)
    kernel = [w / scale for w in kernel]
    for horizontal in (True, False):
        blurred = []
        for y in range(FIELD_SIZE):
            for x in range(FIELD_SIZE):
                values = [0.0] * 4
                for offset, weight in enumerate(kernel, -radius):
                    nx = max(0, min(FIELD_SIZE - 1, x + offset)) if horizontal else x
                    ny = y if horizontal else max(0, min(FIELD_SIZE - 1, y + offset))
                    cell = cells[ny * FIELD_SIZE + nx]
                    for channel in range(4):
                        values[channel] += cell[channel] * weight
                blurred.append(tuple(values))
        cells = blurred
    labs = tuple(
        tuple(cell[c] / cell[3] for c in range(3)) if cell[3] > 1e-8 else fallback for cell in cells
    )
    labs = _preserve_details(labs, image)
    return ColorField(FIELD_SIZE, FIELD_SIZE, labs, int(digest[:8], 16) / 2**32)
