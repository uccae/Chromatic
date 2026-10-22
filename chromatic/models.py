"""Validated persisted settings, stable group identities and conflict detection."""

from __future__ import annotations

import math
import re
from copy import deepcopy
from dataclasses import asdict, dataclass, field, fields
from hashlib import sha256
from typing import Any
from uuid import uuid4

from .const import CONTROL_MODES, MODES, ROLES, STRATEGIES


def number(value: Any, low: float, high: float, name: str) -> float:
    """Reject NaN, bool and coercion surprises at every input boundary."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name}: expected number")
    if not math.isfinite(value) or not low <= value <= high:
        raise ValueError(f"{name}: {low}–{high}")
    return float(value)


def entity_id(value: Any, domain: str) -> str:
    if not isinstance(value, str) or not re.fullmatch(rf"{domain}\.[a-z0-9_]+", value):
        raise ValueError(f"Invalid {domain} entity")
    return value


def choice(value: str, choices: tuple, name: str) -> None:
    if value not in choices:
        raise ValueError(f"Invalid {name}")


def strict(cls, data: dict):
    if not isinstance(data, dict) or set(data) - {f.name for f in fields(cls)}:
        raise ValueError(f"Unknown {cls.__name__} setting")
    return cls(**data)


@dataclass
class Overrides:
    """Nullable values inherit the group, role, then global profile."""

    strategy: str | None = None
    allow_software: bool | None = None
    software_hz: float | None = None
    high_rate_confirmed: bool = False
    max_saturation: float | None = None
    saturation: float | None = None
    intensity: float | None = None
    min_brightness: float | None = None
    max_brightness: float | None = None
    breathing: float | None = None
    min_delta: float | None = None
    hardware_interval: float | None = None
    hardware_max_duration: float | None = None

    @classmethod
    def from_dict(cls, data: dict) -> Overrides:
        data = deepcopy(data)
        if isinstance(data, dict):
            for key in ("hardware_interval", "hardware_max_duration"):
                value = data.get(key)
                if type(value) in (int, float) and value > 4:
                    data[key] = 2 if key == "hardware_interval" and value == 5 else 4
        obj = strict(cls, data)
        obj.validate()
        return obj

    def validate(self) -> None:
        if self.strategy is not None:
            choice(self.strategy, STRATEGIES, "strategy")
        for key in ("high_rate_confirmed", "allow_software"):
            if getattr(self, key) is not None and type(getattr(self, key)) is not bool:
                raise ValueError(f"{key}: expected boolean")
        for key, low, high in (
            ("software_hz", 1, 10),
            ("max_saturation", 0, 100),
            ("saturation", 0, 200),
            ("intensity", 0, 100),
            ("min_brightness", 1, 100),
            ("max_brightness", 1, 100),
            ("breathing", 0, 10),
            ("min_delta", 0.001, 0.1),
            ("hardware_interval", 1, 4),
            ("hardware_max_duration", 0, 4),
        ):
            if (value := getattr(self, key)) is not None:
                number(value, low, high, key)
        if (
            self.min_brightness is not None
            and self.max_brightness is not None
            and self.min_brightness > self.max_brightness
        ):
            raise ValueError("Minimum brightness exceeds maximum")


@dataclass
class Group:
    id: str = field(default_factory=lambda: uuid4().hex)
    name: str = "Light group"
    lights: list[str] = field(default_factory=list)
    role: str = "decorative"
    control: str = "synchronous"
    enabled: bool = True
    modes: list[str] = field(default_factory=lambda: list(MODES))
    priority: int = 0
    order: int = 0
    participate: bool = True
    static_color: str = "inherit"
    overrides: Overrides = field(default_factory=Overrides)
    light_overrides: dict[str, Overrides] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict, *, include_field: bool = False) -> Group:
        data = deepcopy(data)
        # A previously unrestricted group includes the new mode as well. A
        # deliberately limited list keeps its explicit mode selection.
        if (
            include_field
            and isinstance(data, dict)
            and isinstance(data.get("modes"), list)
            and all(isinstance(mode, str) for mode in data["modes"])
            and set(data["modes"]) == set(MODES) - {"color_field"}
        ):
            data["modes"] = list(MODES)
        obj = strict(cls, data)
        obj.overrides = Overrides.from_dict(data.get("overrides", {}))
        if not isinstance(obj.light_overrides, dict):
            raise ValueError("Invalid group light overrides")
        obj.light_overrides = {
            entity_id(k, "light"): Overrides.from_dict(v)
            for k, v in data.get("light_overrides", {}).items()
        }
        obj.validate()
        return obj

    def validate(self) -> None:
        if not isinstance(self.id, str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", self.id):
            raise ValueError("Invalid stable group ID")
        if not isinstance(self.name, str) or not 1 <= len(self.name.strip()) <= 80:
            raise ValueError("Group name must contain 1–80 characters")
        self.name = self.name.strip()
        if not isinstance(self.lights, list) or len(self.lights) > 64:
            raise ValueError("At most 64 lights per group")
        self.lights = [entity_id(x, "light") for x in self.lights]
        if len(set(self.lights)) != len(self.lights):
            raise ValueError("Duplicate light in group")
        choice(self.role, ROLES, "role")
        choice(self.control, CONTROL_MODES, "group control")
        choice(self.static_color, ("inherit", "primary", "accent"), "static color")
        if not isinstance(self.modes, list) or any(mode not in MODES for mode in self.modes):
            raise ValueError("Invalid included modes")
        for key in ("enabled", "participate"):
            if type(getattr(self, key)) is not bool:
                raise ValueError(f"Invalid {key}")
        number(self.priority, -100, 100, "priority")
        number(self.order, -1000, 1000, "order")
        self.overrides.validate()
        if set(self.light_overrides) - set(self.lights):
            raise ValueError("Overrides reference lights outside the group")
        for value in self.light_overrides.values():
            value.validate()


@dataclass
class Settings:
    media_player: str = ""
    enabled: bool = False
    mode: str = "color_field"
    speed: float = 12
    intensity: float = 75
    field_contrast: float = 140
    brightness: float = 65
    saturation: float = 100
    palette_size: int = 4
    breathing: float = 0
    track_transition: float = 2
    strategy: str = "auto"
    allow_software: bool = False
    software_hz: float = 2
    high_rate_confirmed: bool = False
    min_delta: float = 0.002
    hardware_interval: float = 2
    hardware_max_duration: float = 4
    turn_on_lights: bool = False
    restore_on_stop: bool = True
    stop_delay: float = 4
    pause_dim: float = 0
    static_color: str = "primary"
    default_role: str = "decorative"
    max_saturation: float = 100
    group_intensity: float = 100
    min_brightness: float = 5
    max_brightness: float = 100
    lights: list[str] = field(default_factory=list)
    light_roles: dict[str, str] = field(default_factory=dict)
    light_overrides: dict[str, Overrides] = field(default_factory=dict)
    groups: list[Group] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> Settings:
        data = deepcopy(data)
        if isinstance(data, dict):
            if "high_rate_confirmed" not in data:
                # Earlier releases stored this choice per group/light. Preserve an
                # enabled choice once, then use the configuration-wide switch.
                scopes = [data]
                groups = data.get("groups", [])
                if isinstance(groups, list):
                    scopes.extend(g for g in groups if isinstance(g, dict))
                legacy = []
                for scope in scopes:
                    if isinstance(scope.get("overrides"), dict):
                        legacy.append(scope["overrides"])
                    if isinstance(scope.get("light_overrides"), dict):
                        legacy.extend(scope["light_overrides"].values())
                data["high_rate_confirmed"] = any(
                    isinstance(o, dict) and o.get("high_rate_confirmed") is True for o in legacy
                )
            old_cap = data.get("hardware_max_duration")
            legacy = type(old_cap) in (int, float) and old_cap > 4
            if legacy:
                for key, old, new in (
                    ("speed", 35, 12),
                    ("intensity", 25, 75),
                    ("min_delta", 0.008, 0.002),
                ):
                    if data.get(key) == old:
                        data[key] = new
            for key in ("hardware_max_duration", "hardware_interval", "track_transition"):
                value = data.get(key)
                if type(value) in (int, float) and value > 4:
                    data[key] = 2 if key != "hardware_max_duration" and value == 5 else 4
        obj = strict(cls, data)
        if not isinstance(obj.groups, list) or len(obj.groups) > 32:
            raise ValueError("Expected a list of at most 32 groups")
        # Current panel snapshots always contain field_contrast. Extend the old
        # four-mode default only on loading that older format, not on every save:
        # users must be able to deliberately exclude only the new field mode.
        obj.groups = [
            Group.from_dict(x, include_field="field_contrast" not in data) for x in obj.groups
        ]
        if not isinstance(obj.light_overrides, dict):
            raise ValueError("Invalid standalone light overrides")
        obj.light_overrides = {
            entity_id(k, "light"): Overrides.from_dict(v) for k, v in obj.light_overrides.items()
        }
        obj.validate()
        return obj

    def validate(self) -> None:
        if self.media_player != "":
            entity_id(self.media_player, "media_player")
        choice(self.mode, MODES, "mode")
        choice(self.strategy, STRATEGIES, "strategy")
        choice(self.static_color, ("primary", "accent"), "static color")
        choice(self.default_role, ROLES, "default role")
        for key in (
            "enabled",
            "allow_software",
            "turn_on_lights",
            "restore_on_stop",
            "high_rate_confirmed",
        ):
            if type(getattr(self, key)) is not bool:
                raise ValueError(f"Invalid {key}")
        for key, low, high in (
            ("speed", 4, 120),
            ("intensity", 0, 100),
            ("field_contrast", 0, 400),
            ("brightness", 5, 100),
            ("saturation", 0, 200),
            ("breathing", 0, 10),
            ("track_transition", 0, 4),
            ("software_hz", 1, 10 if self.high_rate_confirmed else 5),
            ("min_delta", 0.001, 0.1),
            ("hardware_interval", 1, 4),
            ("hardware_max_duration", 0, 4),
            ("stop_delay", 0, 30),
            ("pause_dim", 0, 80),
            ("max_saturation", 0, 100),
            ("group_intensity", 0, 100),
            ("min_brightness", 1, 100),
            ("max_brightness", 1, 100),
        ):
            number(getattr(self, key), low, high, key)
        if type(self.palette_size) is not int or not 2 <= self.palette_size <= 6:
            raise ValueError("Palette size: 2–6")
        if self.min_brightness > self.max_brightness:
            raise ValueError("Minimum brightness exceeds maximum")
        if (
            not isinstance(self.groups, list)
            or len(self.groups) > 32
            or any(not isinstance(g, Group) for g in self.groups)
            or len({g.id for g in self.groups}) != len(self.groups)
        ):
            raise ValueError("Duplicate group ID or more than 32 groups")
        if not isinstance(self.lights, list) or len(self.lights) > 64:
            raise ValueError("At most 64 standalone lights")
        self.lights = [entity_id(light, "light") for light in self.lights]
        if len(set(self.lights)) != len(self.lights):
            raise ValueError("Duplicate standalone light")
        if not isinstance(self.light_roles, dict) or set(self.light_roles) - set(self.lights):
            raise ValueError("Roles reference unselected standalone lights")
        for role in self.light_roles.values():
            choice(role, ROLES, "light role")
        if set(self.light_overrides) - set(self.lights):
            raise ValueError("Overrides reference unselected standalone lights")
        for overrides in self.light_overrides.values():
            overrides.validate()
        used: set[str] = set(self.lights)
        for group in self.groups:
            group.validate()
            if used.intersection(group.lights):
                raise ValueError("A light can belong to only one selection: standalone or group")
            used.update(group.lights)
        for group in self.scopes:
            # Validate inherited bounds too.
            from .profiles import profile

            for light in group.lights:
                p = profile(self, group, light)
                if p["software_hz"] > 5 and not self.high_rate_confirmed:
                    raise ValueError("Enable the shared high-frequency switch for rates above 5/s")
                if p["min_brightness"] > p["max_brightness"]:
                    raise ValueError("Inherited minimum brightness exceeds maximum")
        if not self.configured:
            self.enabled = False

    @property
    def configured(self) -> bool:
        return bool(self.media_player and self.all_lights)

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def all_lights(self) -> set[str]:
        return set(self.lights) | {light for group in self.groups for light in group.lights}

    @property
    def standalone_scopes(self) -> tuple[Group, ...]:
        """Adapt independent lights to the shared color kernel, without saving groups."""
        return tuple(
            Group(
                id="solo_" + sha256(light.encode()).hexdigest()[:24],
                name=light,
                lights=[light],
                role=self.light_roles.get(light, self.default_role),
                overrides=self.light_overrides.get(light, Overrides()),
            )
            for light in self.lights
        )

    @property
    def scopes(self) -> tuple[Group, ...]:
        return (
            *self.standalone_scopes,
            *sorted(self.groups, key=lambda g: (g.order, -g.priority, g.id)),
        )


def expand_lights(states, lights: set[str]) -> set[str]:
    """Expand HA light groups; reject cycles and ambiguous group/member ownership."""
    result: set[str] = set()

    def visit(light: str, stack: set[str]) -> None:
        if light in stack:
            raise ValueError("Cyclic Home Assistant light group")
        state = states.get(light)
        members = state.attributes.get("entity_id", []) if state else []
        members = members if isinstance(members, list) else []
        children = [x for x in members if isinstance(x, str) and x.startswith("light.")]
        if children:
            for child in children:
                visit(child, stack | {light})
        elif light in result:
            raise ValueError("Overlapping Home Assistant groups or group/member selection")
        else:
            result.add(light)

    for light in sorted(lights):
        visit(light, set())
    return result


def validate_ownership(hass, settings: Settings, entry_id: str | None = None) -> None:
    """Reserve configured lights even while an entry is disabled or unloading."""
    desired = expand_lights(hass.states, settings.all_lights)
    for entry in hass.config_entries.async_entries("chromatic"):
        if entry.entry_id == entry_id:
            continue
        other = Settings.from_dict(dict(entry.data) | dict(entry.options))
        if desired.intersection(expand_lights(hass.states, other.all_lights)):
            raise ValueError("Light already assigned to another Chromatic configuration")
