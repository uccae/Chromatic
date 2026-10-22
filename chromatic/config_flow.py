"""Add Chromatic immediately. Source, lights and atmosphere live in its panel."""

import probatio as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN
from .models import Settings


class ChromaticConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return ChromaticOptionsFlow()

    async def async_step_user(self, user_input=None):
        return self.async_create_entry(title="Chromatic", data=Settings().to_dict())


class ChromaticOptionsFlow(config_entries.OptionsFlow):
    """Compatibility route for HA versions that show the Configure dialog."""

    async def async_step_init(self, user_input=None):
        settings = Settings.from_dict(
            dict(self.config_entry.data) | dict(self.config_entry.options)
        )
        if user_input is not None:
            return self.async_create_entry(title="", data=settings.to_dict())
        return self.async_show_form(step_id="init", data_schema=vol.Schema({}))
