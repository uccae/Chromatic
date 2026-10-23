"""Chromatic integration. One hub/panel, isolated runtimes and no setting entities."""

from __future__ import annotations

import asyncio

import probatio as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ConfigEntryError, HomeAssistantError
from homeassistant.helpers.service import async_register_admin_service

from .const import DOMAIN, MODES, SIGNAL_UPDATE, VERSION
from .coordinator import ChromaticCoordinator
from .models import Settings, validate_ownership

type ChromaticEntry = ConfigEntry[ChromaticCoordinator]


class ChromaticHub:
    def __init__(self, hass):
        self.hass = hass
        self.entries: dict[str, ChromaticCoordinator] = {}
        self.lock = asyncio.Lock()
        self.panel_registered = False
        self.assets_registered = False

    def snapshot(self):
        return {"version": VERSION, "entries": [co.snapshot() for co in self.entries.values()]}

    async def save(self, entry_id: str, changes: dict, revision: int | None = None):
        async with self.lock:
            co = self.entries.get(entry_id)
            if not co:
                raise ValueError("Configuration not loaded")
            if revision is not None and revision != co.revision:
                raise ValueError("stale_revision")
            settings = Settings.from_dict(co.settings.to_dict() | changes)
            # Stopping must remain possible after a dynamic HA-group conflict.
            if changes != {"enabled": False}:
                validate_ownership(self.hass, settings, entry_id)
            self.hass.config_entries.async_update_entry(co.entry, options=settings.to_dict())
            await co.apply(settings)
            return co.snapshot()


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    from .panel import register_websocket

    hub = hass.data.setdefault(DOMAIN, ChromaticHub(hass))
    register_websocket(hass)

    async def command(call: ServiceCall):
        try:
            if call.service == "set_enabled":
                await hub.save(call.data["entry_id"], {"enabled": call.data["enabled"]})
            elif call.service == "set_mode":
                await hub.save(call.data["entry_id"], {"mode": call.data["mode"]})
            else:
                async with hub.lock:
                    co = hub.entries.get(call.data["entry_id"])
                    if not co:
                        raise ValueError("Configuration not loaded")
                    await co.reset_session()
        except ValueError as err:
            raise HomeAssistantError(str(err)) from err

    schemas = {
        "set_enabled": {vol.Required("enabled"): bool},
        "set_mode": {vol.Required("mode"): vol.In(MODES)},
        "reset_session": {},
    }
    for name, fields in schemas.items():
        async_register_admin_service(
            hass,
            DOMAIN,
            name,
            command,
            schema=vol.Schema({vol.Required("entry_id"): str, **fields}),
        )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ChromaticEntry) -> bool:
    from .panel import ensure_panel

    hub: ChromaticHub = hass.data[DOMAIN]
    async with hub.lock:
        try:
            settings = Settings.from_dict(dict(entry.data) | dict(entry.options))
            validate_ownership(hass, settings, entry.entry_id)
        except ValueError as err:
            raise ConfigEntryError(str(err)) from err
        if settings.to_dict() != dict(entry.data) | dict(entry.options):
            hass.config_entries.async_update_entry(entry, options=settings.to_dict())
        co = ChromaticCoordinator(hass, entry, settings)
        entry.runtime_data = co
        hub.entries[entry.entry_id] = co
        try:
            await ensure_panel(hass, hub)
            await co.start()
        except Exception:
            hub.entries.pop(entry.entry_id, None)
            await co.close(restore=False)
            raise
    entry.async_on_unload(entry.add_update_listener(_options_updated))
    co.changed()
    return True


async def _options_updated(hass: HomeAssistant, entry: ChromaticEntry):
    hub: ChromaticHub = hass.data[DOMAIN]
    async with hub.lock:
        co = hub.entries.get(entry.entry_id)
        if not co:
            return
        settings = Settings.from_dict(dict(entry.data) | dict(entry.options))
        if settings.to_dict() != co.settings.to_dict():
            validate_ownership(hass, settings, entry.entry_id)
            await co.apply(settings)


async def async_unload_entry(hass: HomeAssistant, entry: ChromaticEntry) -> bool:
    from homeassistant.components.frontend import async_remove_panel
    from homeassistant.helpers.dispatcher import async_dispatcher_send

    hub: ChromaticHub = hass.data[DOMAIN]
    async with hub.lock:
        co = hub.entries.pop(entry.entry_id, None)
        if co:
            await co.close()
        if not hub.entries and hub.panel_registered:
            async_remove_panel(hass, DOMAIN)
            hub.panel_registered = False
    async_dispatcher_send(hass, SIGNAL_UPDATE)
    return True
