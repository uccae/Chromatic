"""Local web component, authenticated admin WebSocket API and push subscriptions."""

from hashlib import sha256
from pathlib import Path

import probatio as vol
from homeassistant.components import panel_custom, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, SIGNAL_UPDATE


async def ensure_panel(hass, hub):
    if not hub.assets_registered:
        await hass.http.async_register_static_paths(
            [StaticPathConfig("/chromatic_static", str(Path(__file__).parent / "frontend"), False)]
        )
        hub.assets_registered = True
    if not hub.panel_registered:
        script = Path(__file__).parent / "frontend" / "chromatic-panel.js"
        build = sha256(await hass.async_add_executor_job(script.read_bytes)).hexdigest()[:12]
        component = f"chromatic-panel-{build}"
        await panel_custom.async_register_panel(
            hass,
            frontend_url_path=DOMAIN,
            webcomponent_name=component,
            sidebar_title="Chromatic",
            sidebar_icon="mdi:palette",
            module_url=f"/chromatic_static/chromatic-panel.js?build={build}&component={component}",
            embed_iframe=False,
            require_admin=True,
            config_panel_domain=DOMAIN,
        )
        hub.panel_registered = True


def register_websocket(hass):
    for handler in (subscribe, save, set_enabled):
        websocket_api.async_register_command(hass, handler)


@websocket_api.websocket_command({vol.Required("type"): "chromatic/subscribe"})
@websocket_api.require_admin
@callback
def subscribe(hass, connection, msg):
    """One subscription for all entries, coalesced and only sent on material changes."""
    previous = None

    @callback
    def push():
        nonlocal previous
        hub = hass.data.get(DOMAIN)
        data = hub.snapshot() if hub else {"entries": []}
        if data != previous:
            previous = data
            connection.send_event(msg["id"], data)

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATE, push)
    connection.send_result(msg["id"])
    push()


@websocket_api.websocket_command(
    {
        vol.Required("type"): "chromatic/save",
        vol.Required("entry_id"): str,
        vol.Required("revision"): int,
        vol.Required("settings"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def save(hass, connection, msg):
    try:
        hub = hass.data.get(DOMAIN)
        if not hub:
            raise ValueError("Integration not loaded")
        result = await hub.save(msg["entry_id"], msg["settings"], msg["revision"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_settings", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "chromatic/set_enabled",
        vol.Required("entry_id"): str,
        vol.Required("enabled"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def set_enabled(hass, connection, msg):
    """A runtime action independent of an unsaved or stale settings draft."""
    try:
        hub = hass.data.get(DOMAIN)
        if not hub:
            raise ValueError("Integration not loaded")
        result = await hub.save(msg["entry_id"], {"enabled": msg["enabled"]})
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_settings", str(err))
        return
    connection.send_result(msg["id"], result)
