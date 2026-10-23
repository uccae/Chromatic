"""Bounded deterministic weighted OKLab clustering; call from an executor."""

import math
import warnings
from collections import Counter, OrderedDict
from dataclasses import dataclass, field
from hashlib import sha256
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from .color import RGB, Lab, distance, lab_to_rgb, rgb_to_lab
from .const import MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS
from .field import ColorField, build_field


class InvalidArtwork(ValueError):
    """An image cannot be safely decoded or contains no visible pixels."""


@dataclass(frozen=True)
class Swatch:
    lab: Lab
    weight: float

    @property
    def rgb(self) -> RGB:
        return lab_to_rgb(self.lab)


@dataclass(frozen=True)
class Palette:
    colors: tuple[Swatch, ...]
    lightness: float
    digest: str
    color_field: ColorField | None = field(default=None, compare=False, hash=False, repr=False)

    @property
    def accent(self) -> Swatch:
        return max(self.colors, key=lambda c: math.hypot(c.lab[1], c.lab[2]) * c.weight**0.25)

    def to_dict(self, *, include_field: bool = True) -> dict:
        return {
            "colors": [{"rgb": c.rgb, "weight": round(c.weight, 4)} for c in self.colors],
            "lightness": round(self.lightness, 3),
            "field": self.color_field.to_dict() if include_field and self.color_field else None,
        }


def extract_palette(data: bytes, size: int = 4, content_type: str | None = None) -> Palette:
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise InvalidArtwork("Image is empty or exceeds 8 MiB")
    if size not in range(2, 7):
        raise InvalidArtwork("Palette size: 2–6")
    if content_type and content_type.split(";", 1)[0].lower() not in (
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/octet-stream",
    ):
        raise InvalidArtwork("Unsupported image content type")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as image:
                if image.format not in ("PNG", "JPEG", "WEBP", "GIF"):
                    raise InvalidArtwork("Unsupported image format")
                if image.width * image.height > MAX_IMAGE_PIXELS:
                    raise InvalidArtwork("Image exceeds 16 megapixels")
                image.thumbnail((256, 256))
                field_source = image.convert("RGBA")
                rgba = field_source.copy()
                rgba.thumbnail((96, 96))
                pixels = list(rgba.get_flattened_data())
    except (
        OSError,
        UnidentifiedImageError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ) as err:
        raise InvalidArtwork("Invalid or oversized image") from err
    histogram: Counter = Counter()
    for r, g, b, a in pixels:
        if a:
            # A small histogram bounds k-means work and weights partial transparency.
            histogram[(r // 8 * 8 + 4, g // 8 * 8 + 4, b // 8 * 8 + 4)] += a / 255
    if not histogram:
        raise InvalidArtwork("Image is fully transparent")
    points = [(rgb_to_lab(rgb), weight) for rgb, weight in sorted(histogram.items())]
    total = sum(w for _, w in points)
    lightness = sum(c[0] * w for c, w in points) / total
    # Farthest weighted initialization, no random seed or random palette colors.
    centers = [max(points, key=lambda p: p[1])[0]]
    for _ in range(min(size + 2, len(points)) - 1):
        candidate = max(
            points, key=lambda p: min(distance(p[0], c) ** 2 for c in centers) * math.sqrt(p[1])
        )[0]
        if min(distance(candidate, c) for c in centers) < 0.025:
            break
        centers.append(candidate)
    buckets = []
    for _ in range(16):
        buckets = [[] for _ in centers]
        for lab, weight in points:
            nearest = min(range(len(centers)), key=lambda i: distance(lab, centers[i]))
            buckets[nearest].append((lab, weight))
        updated = [
            tuple(sum(c[j] * w for c, w in bucket) / sum(w for _, w in bucket) for j in range(3))
            if bucket
            else centers[i]
            for i, bucket in enumerate(buckets)
        ]
        change = max(distance(a, b) for a, b in zip(centers, updated, strict=True))
        centers = updated
        if change < 0.0005:
            break
    swatches = [
        Swatch(center, sum(w for _, w in bucket) / total)
        for center, bucket in zip(centers, buckets, strict=True)
        if bucket
    ]
    # Almost black backgrounds carry scene luminance, but must not drown out red accents.
    useful = [s for s in swatches if s.lab[0] > 0.12 and s.weight >= 0.003]
    if useful:
        swatches = useful
    swatches.sort(key=lambda s: s.weight**0.65 * (0.12 + math.hypot(*s.lab[1:])), reverse=True)
    merged: list[Swatch] = []
    for swatch in swatches:
        if all(distance(swatch.lab, c.lab) > 0.045 for c in merged):
            merged.append(swatch)
        if len(merged) == size:
            break
    weight_sum = sum(c.weight for c in merged)
    digest = sha256(data).hexdigest()
    return Palette(
        tuple(Swatch(c.lab, c.weight / weight_sum) for c in merged),
        lightness,
        digest,
        build_field(field_source, digest),
    )


class PaletteCache:
    """Small LRU keyed by decoded source bytes and algorithm settings, executor-owned."""

    def __init__(self, capacity: int = 32) -> None:
        self.capacity = capacity
        self._items: OrderedDict = OrderedDict()

    def get(self, data: bytes, size: int, content_type: str | None) -> Palette:
        key = (sha256(data).digest(), size, content_type)
        if key in self._items:
            self._items.move_to_end(key)
            return self._items[key]
        palette = extract_palette(data, size, content_type)
        self._items[key] = palette
        if len(self._items) > self.capacity:
            self._items.popitem(last=False)
        return palette
