"""Shared constants. This module has no Home Assistant dependencies."""

DOMAIN = "chromatic"
VERSION = "0.1.0"
MODES = ("color_field", "static", "subtle_drift", "palette_flow", "spatial_flow")
ROLES = ("decorative", "main", "universal")
STRATEGIES = ("auto", "hardware", "software", "disabled")
CONTROL_MODES = ("synchronous", "independent", "distributed")
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
SIGNAL_UPDATE = f"{DOMAIN}_update"
COLOR_MODES = {"rgb", "rgbw", "rgbww", "hs", "xy"}

# OKLCH chroma relative to the sRGB gamut at the same lightness and hue.
ROLE_DEFAULTS = {
    "decorative": {"max_saturation": 100.0, "intensity": 100.0, "min_brightness": 5.0},
    "main": {"max_saturation": 35.0, "intensity": 50.0, "min_brightness": 20.0},
}
