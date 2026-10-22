"""Retrieve artwork through the selected HA MediaPlayerEntity, without self HTTP.

HA owns authentication, proxying, caching and integration-specific retrieval.
We never forward HA credentials to an entity_picture URL or arbitrary remote host.
"""

import asyncio

from aiohttp import ClientError
from homeassistant.const import Platform
from homeassistant.exceptions import HomeAssistantError

from .const import MAX_IMAGE_BYTES
from .palette import InvalidArtwork, PaletteCache


def media_key(state) -> tuple:
    if state is None:
        return ()
    a = state.attributes
    return tuple(
        a.get(k)
        for k in (
            "media_content_id",
            "media_title",
            "media_artist",
            "media_album_name",
            "entity_picture",
            "entity_picture_local",
            "media_image_hash",
        )
    )


class Artwork:
    def __init__(self, hass) -> None:
        self.hass = hass
        self.cache = PaletteCache()
        # One decode/fetch per entry. Cancellation never creates parallel executor jobs.
        self._lock = asyncio.Lock()

    async def palette(self, entity_id: str, size: int):
        async with self._lock:
            # Core moved DATA_COMPONENT between modules. Both layouts register
            # the EntityComponent under the same media_player domain key.
            component = self.hass.data.get(Platform.MEDIA_PLAYER)
            player = component.get_entity(entity_id) if component else None
            if player is None:
                raise InvalidArtwork("source_entity_not_loaded")
            try:
                async with asyncio.timeout(12):
                    data, content_type = await player.async_get_media_image()
            except (HomeAssistantError, ClientError) as err:
                raise InvalidArtwork("artwork_fetch_failed") from err
            if not data:
                raise InvalidArtwork("artwork_unavailable")
            if len(data) > MAX_IMAGE_BYTES:
                raise InvalidArtwork("artwork_too_large")
            # Shield executor completion while holding the lock, even if a track is replaced.
            job = self.hass.async_add_executor_job(self.cache.get, data, size, content_type)
            cancelled = False
            while True:
                try:
                    result = await asyncio.shield(job)
                    break
                except asyncio.CancelledError:
                    if job.cancelled():
                        raise
                    # Unload may cancel an already-cancelled track fetch again.
                    # Keep the executor job shielded until its real completion.
                    cancelled = True
                except Exception:
                    if cancelled:
                        raise asyncio.CancelledError from None
                    raise
            if cancelled:
                raise asyncio.CancelledError
            return result
