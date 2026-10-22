# Chromatic

Turn album artwork into a living atmosphere with Home Assistant.

Chromatic transforms the current track’s artwork into a softly moving color field. Each light follows its own path through that field, producing a continuous stream of shades. Everything runs locally, without a music service account, a separate server, or YAML configuration.

## Features

- Five lighting modes: Color Field, Static, Subtle Drift, Palette Flow, and Spatial Flow.
- An animated artwork map with light positions and preservation of small color details.
- Individual lights with optional grouping, inherited settings, and per-light overrides.
- Brightness, saturation, contrast, movement, and transition controls.
- Descriptive saturation and contrast levels, an artwork reference mark, and exact multiplier tooltips.
- Playback handling, manual light control, original state restoration, diagnostics, and automation actions.

## Requirements

**Home Assistant Core 2026.10.0 or later.** Automated checks used **Core 2026.10.2 / Python 3.14**. Compatibility with future versions and individual devices depends on their integrations.

Your media player must expose playback state and artwork to Home Assistant. Your color-capable lights must already be connected to Home Assistant.

## Install with HACS

1. Open HACS → menu → **Custom repositories**.
2. Add `https://github.com/uccae/chromatic` with the **Integration** category.
3. Find Chromatic and download it.
4. Restart Home Assistant.

Chromatic is installed as a custom HACS repository.

## Manual installation

1. Download `chromatic-0.1.0.zip` from **Releases**.
2. Extract it into your Home Assistant configuration directory. Check that `/config/custom_components/chromatic/manifest.json` exists.
3. Restart Home Assistant.

Alternatively, copy this repository’s `custom_components/chromatic` folder into your configuration directory’s `custom_components` folder.

## Get started

1. Open **Settings → Devices & services → Add integration → Chromatic**.
2. Open **Chromatic** in the sidebar.
3. Choose your media player and lights. Turn the selected lights on manually for your first session: lights that are off are skipped by default.
4. Play music with available artwork and start Chromatic.

Groups are optional. Start with the recommended atmosphere, then adjust brightness, saturation, and contrast to taste. Apply your changes to save them.

The panel follows Home Assistant’s language setting and supports English and Russian.

## Lighting modes

| Mode | Behavior |
| --- | --- |
| Color Field | Continuous movement through a blurred, slowly evolving artwork map |
| Static | Holds a dominant or accent color until the artwork changes |
| Subtle Drift | Gently shifts between nearby shades |
| Palette Flow | Moves between distinct palette colors |
| Spatial Flow | Distributes color phases across lights and groups |

Saturation ranges from 0 to 2×. Color Field contrast ranges from 0 to 4×. The artwork reference mark represents the original 1× value. Uniform artwork produces a calmer effect: Chromatic does not introduce random colors absent from the image.

## Transitions and update rate

Native transitions are capped at **4 seconds**. **Auto** uses device transitions when the light reports support. Software transitions are enabled separately and generate intermediate color commands. Software transitions are recommended for lights without native transition support.

Start at 1–2 commands per second per light. A single high-rate switch unlocks up to 10 commands per second per light. Actual smoothness and sustainable traffic depend on your lights, network, and integrations. A higher rate does not guarantee a better result.

## Playback and manual control

Movement stops when playback pauses. On stop, Chromatic can restore the original light states if restoration is enabled. Recognized manual changes release the affected light until a new session; the panel can reclaim released lights.

Original states are kept in memory. Restoration after a power failure is not guaranteed. A native transition already accepted by a light cannot always be canceled through Home Assistant.

## Automations

Available actions: `chromatic.set_enabled`, `chromatic.set_mode`, and `chromatic.reset_session`. The configuration entry ID is shown in the panel’s technical settings.

```yaml
actions:
  - action: chromatic.set_enabled
    data:
      entry_id: "YOUR_CONFIGURATION_ENTRY_ID"
      enabled: true
```

## Updating and removal

Update through HACS or replace the integration folder, restart Home Assistant, and refresh the page. Keep the integration entry to preserve your settings.

To remove Chromatic, stop it, delete its entry in **Devices & services**, remove its files, and restart Home Assistant.

## Feedback

Report issues with your Home Assistant version, a description of the problem, and relevant log lines. Remove personal information before sharing logs or diagnostics.

## License

[MIT](LICENSE).
