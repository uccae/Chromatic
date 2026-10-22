"""sRGB ↔ OKLab/OKLCH, gamut mapping and conservative palette interpolation.

Matrices: Björn Ottosson, https://bottosson.github.io/posts/oklab/.
All gamut mapping reduces chroma at constant OKLab L and hue.
"""

import math
from functools import lru_cache

Lab = tuple[float, float, float]
RGB = tuple[int, int, int]


def clamp(x: float, low: float = 0, high: float = 1) -> float:
    return max(low, min(high, x))


def rgb_to_lab(rgb: RGB) -> Lab:
    r, g, b = (v / 255 for v in rgb)
    r, g, b = (v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in (r, g, b))
    cone_l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (
        0.2104542553 * cone_l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * cone_l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * cone_l + 0.7827717662 * m - 0.8086757660 * s,
    )


def lab_to_linear(lab: Lab) -> tuple[float, float, float]:
    lightness, a, b = lab
    cone_l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return (
        4.0767416621 * cone_l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * cone_l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * cone_l - 0.7034186147 * m + 1.7076147010 * s,
    )


def in_gamut(lab: Lab) -> bool:
    return all(-1e-7 <= x <= 1.0000001 for x in lab_to_linear(lab))


@lru_cache(maxsize=2048)
def max_chroma(lightness: float, hue: float) -> float:
    """Find the outer boundary, including the narrow, non-convex blue cusp.

    Each linear RGB channel is a cubic in C. Split at derivative roots before
    bisection: a single binary search incorrectly clips pure sRGB blue.
    """
    ch, sh = math.cos(hue), math.sin(hue)
    slopes = (
        0.3963377774 * ch + 0.2158037573 * sh,
        -0.1055613458 * ch - 0.0638541728 * sh,
        -0.0894841775 * ch - 1.2914855480 * sh,
    )
    matrices = (
        (4.0767416621, -3.3077115913, 0.2309699292),
        (-1.2684380046, 2.6097574011, -0.3413193965),
        (-0.0041960863, -0.7034186147, 1.7076147010),
    )
    roots = [0.0]
    for row in matrices:
        c0 = lightness**3 * sum(row)
        c1 = 3 * lightness**2 * sum(m * k for m, k in zip(row, slopes, strict=True))
        c2 = 3 * lightness * sum(m * k * k for m, k in zip(row, slopes, strict=True))
        c3 = sum(m * k**3 for m, k in zip(row, slopes, strict=True))
        critical = [0.0, 0.5]
        discriminant = 4 * c2 * c2 - 12 * c3 * c1
        if abs(c3) > 1e-12 and discriminant >= 0:
            critical += [
                x
                for x in (
                    (-2 * c2 - math.sqrt(discriminant)) / (6 * c3),
                    (-2 * c2 + math.sqrt(discriminant)) / (6 * c3),
                )
                if 0 < x < 0.5
            ]
        elif abs(c2) > 1e-12 and 0 < -c1 / (2 * c2) < 0.5:
            critical.append(-c1 / (2 * c2))
        critical.sort()
        for level in (0, 1):

            def value(c, c3=c3, c2=c2, c1=c1, c0=c0, level=level):
                return ((c3 * c + c2) * c + c1) * c + c0 - level

            for low, high in zip(critical, critical[1:], strict=False):
                if value(low) * value(high) > 0:
                    continue
                low_value = value(low)
                for _ in range(30):
                    mid = (low + high) / 2
                    if low_value * value(mid) <= 0:
                        high = mid
                    else:
                        low, low_value = mid, value(mid)
                roots.append((low + high) / 2)
    return max((c for c in roots if in_gamut((lightness, c * ch, c * sh))), default=0)


def limit_saturation(lab: Lab, percent: float) -> Lab:
    lightness, a, b = lab
    lightness = clamp(lightness)
    chroma = math.hypot(a, b)
    if chroma < 1e-7:
        return (lightness, 0, 0)
    allowed = max_chroma(lightness, math.atan2(b, a)) * clamp(percent / 100)
    scale = min(1.0, allowed / chroma)
    result = (lightness, a * scale, b * scale)
    if not in_gamut(result):
        low, high = 0.0, scale
        for _ in range(22):
            mid = (low + high) / 2
            if in_gamut((lightness, a * mid, b * mid)):
                low = mid
            else:
                high = mid
        result = (lightness, a * low, b * low)
    return result


def lab_to_rgb(lab: Lab) -> RGB:
    linear = lab_to_linear(lab if in_gamut(lab) else limit_saturation(lab, 100))
    return tuple(
        round(clamp(12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055) * 255)
        for v in linear
    )


def distance(a: Lab, b: Lab) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b, strict=True)))


def mix(a: Lab, b: Lab, t: float) -> Lab:
    """OKLab line segment, avoiding circular hue paths through unrelated hues."""
    t = clamp(t)
    return tuple(x + (y - x) * t for x, y in zip(a, b, strict=True))


def ease(t: float) -> float:
    t = clamp(t)
    return t * t * (3 - 2 * t)
