"""Standard downloadable diagnostics without artwork URLs, auth or track metadata."""

from homeassistant.components.diagnostics import async_redact_data


async def async_get_config_entry_diagnostics(hass, entry):
    data = entry.runtime_data.snapshot(private=True)
    return async_redact_data(
        data, {"media_player", "entity_id", "lights", "light_overrides", "light_roles"}
    )
