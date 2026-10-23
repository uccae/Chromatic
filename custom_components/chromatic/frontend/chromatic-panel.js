/* Chromatic 0.1.1 — local HA custom panel, no build step or external dependencies. */
const STRINGS = {
  en: {
    overview: "Overview", playback: "Playback", groups: "Light groups", modes: "Modes",
    transitions: "Transitions", diagnostics: "Diagnostics", settings: "Settings",
    version: "Version", enabled: "Synchronization",
    enable: "Enable Chromatic", disable: "Stop Chromatic", save: "Save changes",
    discard: "Discard", unsaved: "Unsaved changes", saved: "Settings saved",
    empty: "Add Chromatic in Settings → Devices & services → Add integration.",
    media_player: "Media player", mode: "Lighting mode", speed: "Color cycle · seconds",
    intensity: "Effect intensity · %", brightness: "Brightness · %", palette_size: "Palette size",
    breathing: "Brightness breathing · %", track_transition: "Track transition · seconds",
    strategy: "Transition strategy", allow_software: "Allow software fallback in Auto",
    software_hz: "Software updates · per second", min_delta: "Minimum OKLab color change",
    hardware_interval: "Target update interval · seconds", hardware_max_duration: "Hardware transition cap · seconds",
    turn_on_lights: "Allow turning on lights that were off", restore_on_stop: "Restore lights when stopped",
    stop_delay: "Stop debounce · seconds", pause_dim: "Optional pause dimming · %",
    static_color: "Static color", default_role: "Role for new groups",
    max_saturation: "Maximum saturation · %", group_intensity: "Default group intensity · %",
    min_brightness: "Minimum brightness · %", max_brightness: "Maximum brightness · %",
    name: "Group name", role: "Lighting role", control: "Group control", priority: "Palette priority",
    order: "Order", participate: "Participate in spatial palette distribution",
    newGroup: "New group", delete: "Delete group", addLights: "Available color lights",
    noLights: "No lights selected", inherit: "Inherit", lightOverrides: "Individual light overrides",
    target: "Target", groupProfile: "Group defaults", includedModes: "Included lighting modes",
    primary: "Primary", accent: "Accent", auto: "Auto", hardware: "Hardware transition",
    software: "Software transition", disabled: "Disabled", decorative: "Decorative",
    main: "Main / functional", universal: "Universal", synchronous: "As one source",
    independent: "Independent phases", distributed: "Fixed palette distribution",
    static: "Static", subtle_drift: "Subtle Drift", palette_flow: "Palette Flow", spatial_flow: "Spatial Flow",
    staticHelp: "Hold a primary or accent color. Track changes use the chosen transition.",
    subtle_driftHelp: "Slow, small movements within neighboring cover colors. The default calm atmosphere.",
    palette_flowHelp: "A weighted, reproducible walk through the cover palette, without random hues.",
    spatial_flowHelp: "Offset phases spread the palette across groups and lights in their saved order.",
    transitionHelp: "Auto uses an advertised hardware transition. Without support it applies color directly, unless you explicitly allow software fallback. Advertised support is not a hardware quality test.",
    roleHelp: "Main light starts at 35% saturation, 50% intensity and at least 20% brightness. Decorative light keeps richer color. Saturation is relative OKLCH chroma at constant lightness.",
    manualHelp: "A manually changed light is released until the next session. Stop and enable Chromatic to start a new session.",
    preview: "Current cover palette", noPalette: "Waiting for artwork", available: "Available",
    source_available: "Source available", unavailable: "Unavailable", claimed: "Assigned to another group/configuration",
    declared: "Transition advertised", actual: "Applied strategy", reason: "Reason", commands: "Commands",
    errors: "Service errors", hz: "Effective rate", excluded: "Released / skipped", reset: "New session",
    entry: "Configuration", technical: "Technical details", noTrack: "No track metadata",
    confirmDelete: "Delete selected group? Save changes to apply.", stale_revision: "Settings changed elsewhere. Discard the draft and try again.",
    retryConnection: "Retry connection", waiting_for_lights: "Waiting for eligible lights", restorePending: "Restoring lights when they reconnect (up to 2 minutes):", restoreExpired: "Some lights could not be restored:",
    waiting: "Waiting for playback", fetching_artwork: "Fetching artwork", analyzing_palette: "Analyzing palette",
    syncing: "Synchronization active", paused: "Paused", artwork_unavailable: "Artwork unavailable",
    source_unavailable: "Source unavailable", group_unavailable: "No available lights", group_partial: "Partly available",
    group_renamed: "Group renamed; identity preserved", light_unavailable: "Light unavailable",
    unsupported_color_mode: "No compatible color mode", off_not_authorized: "Off; turn-on not authorized",
    manual_intervention: "Released after external control", transition_disabled: "Transitions disabled",
    hardware_advertised_not_verified: "Hardware transition advertised; physical behavior unverified",
    software_explicit: "Software transition explicitly selected", hardware_unstable: "Hardware transition failed; backoff active",
    hardware_not_advertised: "Hardware transition not advertised", auto_software_forbidden: "Hardware not advertised; software fallback forbidden",
    auto_software_fallback: "Software fallback explicitly allowed", hardware_unstable_software_fallback: "Hardware errors; authorized software fallback",
    hardware_unstable_fallback_forbidden: "Hardware errors; software fallback forbidden", reloadHint: "Basic recovery options are also available in the integration's Configure dialog.",
    groupEnabled: "Include this group", roleLimits: "Role and color limits", lightOrder: "Light order",
    control_conflict: "Overlapping light ownership; synchronization paused",
    source_entity_not_loaded: "The media player entity is not loaded; check its source integration",
    artwork_too_large: "Artwork exceeds the size limit", artwork_fetch_failed: "HA could not retrieve artwork",
    image_processing_error: "Image is invalid or cannot be processed", artwork_timeout: "Artwork request timed out",
    group_disabled: "Group excluded", group_excluded_mode: "Excluded from this lighting mode",
    unsavedSwitch: "Save or discard changes before switching configurations.", true: "Allowed", false: "Forbidden",
  },
  ru: {
    overview: "Обзор", playback: "Воспроизведение", groups: "Группы света", modes: "Режимы",
    transitions: "Переходы", diagnostics: "Диагностика", settings: "Настройки",
    version: "Версия", enabled: "Синхронизация",
    enable: "Включить Chromatic", disable: "Остановить Chromatic", save: "Сохранить изменения",
    discard: "Отменить", unsaved: "Есть несохранённые изменения", saved: "Настройки сохранены",
    empty: "Добавьте Chromatic: Настройки → Устройства и службы → Добавить интеграцию.",
    media_player: "Медиаплеер", mode: "Режим освещения", speed: "Цветовой цикл · секунды",
    intensity: "Интенсивность эффекта · %", brightness: "Яркость · %", palette_size: "Размер палитры",
    breathing: "Дыхание яркости · %", track_transition: "Переход при смене трека · секунды",
    strategy: "Стратегия перехода", allow_software: "Разрешить программный fallback в Auto",
    software_hz: "Программные обновления · в секунду", min_delta: "Минимальное изменение цвета OKLab",
    hardware_interval: "Интервал новых целей · секунды", hardware_max_duration: "Предел аппаратного перехода · секунды",
    turn_on_lights: "Разрешить включать выключенные лампы", restore_on_stop: "Восстанавливать свет после остановки",
    stop_delay: "Задержка остановки · секунды", pause_dim: "Затемнение при паузе · %",
    static_color: "Статичный цвет", default_role: "Роль новых групп", max_saturation: "Максимальная насыщенность · %",
    group_intensity: "Интенсивность новых групп · %", min_brightness: "Минимальная яркость · %",
    max_brightness: "Максимальная яркость · %",
    name: "Название группы", role: "Роль освещения", control: "Управление группой", priority: "Приоритет палитры",
    order: "Порядок", participate: "Участвует в пространственном распределении палитры",
    newGroup: "Новая группа", delete: "Удалить группу", addLights: "Доступные цветные светильники",
    noLights: "Светильники не выбраны", inherit: "Наследовать", lightOverrides: "Индивидуальные настройки ламп",
    target: "Цель", groupProfile: "Настройки группы", includedModes: "Участие в режимах",
    primary: "Основной", accent: "Акцентный", auto: "Авто", hardware: "Аппаратный переход",
    software: "Программный переход", disabled: "Отключено", decorative: "Декоративная",
    main: "Основная / функциональная", universal: "Универсальная", synchronous: "Как единый источник",
    independent: "Независимые фазы", distributed: "Фиксированное распределение палитры",
    static: "Static", subtle_drift: "Subtle Drift", palette_flow: "Palette Flow", spatial_flow: "Spatial Flow",
    staticHelp: "Постоянный основной или акцентный цвет. Новый трек применяется с выбранным переходом.",
    subtle_driftHelp: "Медленное движение между близкими оттенками обложки. Спокойный режим по умолчанию.",
    palette_flowHelp: "Воспроизводимая последовательность цветов с учётом весов и расстояний, без случайных оттенков.",
    spatial_flowHelp: "Разные фазы распространяют палитру по группам и лампам в сохранённом порядке.",
    transitionHelp: "Auto использует заявленный аппаратный переход. Если поддержки нет, цвет применяется сразу; программный fallback требует вашего разрешения. Заявленная поддержка не подтверждает качество работы устройства.",
    roleHelp: "Основной свет по умолчанию: насыщенность до 35%, интенсивность 50%, яркость от 20%. Декоративный свет сохраняет выразительность. Насыщенность — относительная хрома OKLCH при постоянной светлоте.",
    manualHelp: "Лампа, изменённая вручную, освобождается до новой сессии. Остановите и снова включите Chromatic для новой сессии.",
    preview: "Текущая палитра обложки", noPalette: "Ожидание обложки", available: "Доступно",
    source_available: "Источник доступен", unavailable: "Недоступно", claimed: "Назначено другой группе или конфигурации",
    declared: "Переход заявлен", actual: "Применённая стратегия", reason: "Причина", commands: "Команды",
    errors: "Ошибки служб", hz: "Фактическая частота", excluded: "Исключён / пропущен", reset: "Новая сессия",
    entry: "Конфигурация", technical: "Технические данные", noTrack: "Нет данных о треке",
    confirmDelete: "Удалить выбранную группу? Для применения сохраните изменения.", stale_revision: "Настройки изменены в другом окне. Отмените черновик и повторите изменение.",
    retryConnection: "Повторить подключение", waiting_for_lights: "Ожидание доступных для управления ламп", restorePending: "Ожидание восстановления ламп после подключения (до 2 минут):", restoreExpired: "Не удалось восстановить светильники:",
    waiting: "Ожидание воспроизведения", fetching_artwork: "Получение обложки", analyzing_palette: "Анализ палитры",
    syncing: "Синхронизация активна", paused: "Пауза", artwork_unavailable: "Обложка недоступна",
    source_unavailable: "Источник недоступен", group_unavailable: "Нет доступных светильников", group_partial: "Частично доступно",
    group_renamed: "Группа переименована с сохранением ID", light_unavailable: "Светильник недоступен",
    unsupported_color_mode: "Нет совместимого цветового режима", off_not_authorized: "Выключен; включение не разрешено",
    manual_intervention: "Исключён после внешнего управления", transition_disabled: "Переходы отключены",
    hardware_advertised_not_verified: "Аппаратный переход заявлен; физическое поведение не проверено",
    software_explicit: "Программный переход выбран явно", hardware_unstable: "Ошибка аппаратного перехода; действует задержка",
    hardware_not_advertised: "Аппаратный переход не заявлен", auto_software_forbidden: "Переход не заявлен; программный fallback запрещён",
    auto_software_fallback: "Программный fallback разрешён пользователем", hardware_unstable_software_fallback: "Аппаратные ошибки; разрешённый программный fallback",
    hardware_unstable_fallback_forbidden: "Аппаратные ошибки; программный fallback запрещён", reloadHint: "Базовые параметры для восстановления доступны также в диалоге настройки интеграции.",
    groupEnabled: "Управлять этой группой", roleLimits: "Роль и ограничения цвета", lightOrder: "Порядок светильников",
    control_conflict: "Конфликт управления светильниками; синхронизация приостановлена",
    source_entity_not_loaded: "Объект медиаплеера не загружен; проверьте интеграцию источника",
    artwork_too_large: "Обложка превышает допустимый размер", artwork_fetch_failed: "HA не удалось получить обложку",
    image_processing_error: "Изображение повреждено или не поддерживается", artwork_timeout: "Истёк тайм-аут получения обложки",
    group_disabled: "Группа исключена", group_excluded_mode: "Не участвует в текущем режиме",
    unsavedSwitch: "Сохраните или отмените изменения перед сменой конфигурации.", true: "Разрешено", false: "Запрещено",
  },
};
const MODES = ["color_field", "static", "subtle_drift", "palette_flow", "spatial_flow"];
const STRATEGIES = ["auto", "hardware", "software", "disabled"];
const ROLES = ["decorative", "main", "universal"];
const CONTROLS = ["synchronous", "independent", "distributed"];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone = (v) => JSON.parse(JSON.stringify(v));
const ASSETS = Object.fromEntries(Object.entries({mark:'chromatic-mark.png',chevron:'chevron-down.svg',check:'check.svg',statusDot:'status-dot.svg'}).map(([key,file])=>[key,new URL(`./assets/${file}`,import.meta.url).href]));
const CSS = `
  :host{
    --chromatic-background:#f5f6f9;--chromatic-surface:#fff;--chromatic-subtle:#eff2f7;
    --chromatic-text:#20242e;--chromatic-muted:#6b7282;--chromatic-border:#e4e8ef;
    --chromatic-accent:#0088ff;--chromatic-action:#006edc;--chromatic-selected:#edf5ff;
    --chromatic-green:#2e8065;--chromatic-green-bg:#e7f3ed;--chromatic-track:#dee4ec;
    --chromatic-error:#c13f4b;--chromatic-error-bg:#fff1f3;--chromatic-on-accent:#fff;
    --chromatic-radius-card:24px;--chromatic-radius-tile:16px;--chromatic-radius-input:14px;
    --chromatic-shadow-card:0 6px 28px #1f2b4009;--chromatic-shadow-float:0 4px 14px #1f2b4012;
    display:block;min-height:100vh;background:var(--chromatic-background);color:var(--chromatic-text);
    font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15px;line-height:1.47;color-scheme:light;
  }
  :host([data-theme=dark]){
    --chromatic-background:#000;--chromatic-surface:#1c1c1c;--chromatic-subtle:#2c2c2c;
    --chromatic-text:#f5f5f5;--chromatic-muted:#a1a1a1;--chromatic-border:#3a3a3a;
    --chromatic-accent:#f0f0f0;--chromatic-action:#f2f2f2;--chromatic-selected:#2b2b2b;
    --chromatic-green:#c7c7c7;--chromatic-green-bg:#2b2b2b;--chromatic-track:#484848;
    --chromatic-error:#dedede;--chromatic-error-bg:#343434;--chromatic-on-accent:#101010;
    --chromatic-shadow-card:none;color-scheme:dark;
  }
  :host([data-theme=dark]) .mark,:host([data-theme=dark]) select{filter:grayscale(1)}
  :host([data-theme=dark]) .badge:before{background:var(--chromatic-green);border-radius:50%}
  *{box-sizing:border-box}button,input,select{font:inherit;color:inherit}button,input,select{max-width:100%}
  button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border:0;border-radius:999px;background:var(--chromatic-subtle);font-weight:500;line-height:20px;cursor:pointer;transition:background .16s,box-shadow .16s}
  button:hover{background:color-mix(in srgb,var(--chromatic-subtle),var(--chromatic-text) 5%)}
  button:disabled{opacity:.4;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--chromatic-accent);outline-offset:3px}
  select,input[type=text]{width:100%;min-height:46px;padding:10px 14px;border:0;border-radius:var(--chromatic-radius-input);background:var(--chromatic-subtle);color:var(--chromatic-text);font-size:15px;font-weight:500;line-height:20px}
  select{appearance:none;padding-right:38px;background-image:url("${ASSETS.chevron}");background-repeat:no-repeat;background-size:12px 12px;background-position:right 14px center;cursor:pointer}
  option{color:var(--chromatic-text);background:var(--chromatic-surface)}
  input[type=checkbox]{appearance:none;position:relative;flex:0 0 18px;width:18px;height:18px;margin:0;border:1px solid var(--chromatic-muted);border-radius:4px;background:var(--chromatic-surface);cursor:pointer}
  input[type=checkbox]:checked{border-color:var(--chromatic-accent);background:var(--chromatic-accent)}
  input[type=checkbox]:checked:after{content:"";position:absolute;inset:-1px;background:var(--chromatic-on-accent);mask:url("${ASSETS.check}") center/18px 18px no-repeat}
  .check.toggle input{flex:0 0 40px;width:40px;height:24px;border:0;border-radius:999px;background:var(--chromatic-track)}
  .check.toggle input:before{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:var(--chromatic-surface);transition:translate .16s}
  .check.toggle input:checked{background:var(--chromatic-accent)}.check.toggle input:checked:before{translate:16px 0;background:var(--chromatic-on-accent)}.check.toggle input:after{display:none}
  input:disabled,select:disabled{cursor:default}input[type=checkbox]:disabled{opacity:.4}
  .shell{max-width:1080px;margin:auto;padding:32px 28px 80px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.brand{display:flex;align-items:center;gap:12px;min-width:0}.top-meta{display:flex;align-items:center;justify-content:flex-end;gap:12px;min-width:0;max-width:100%;margin-left:auto}#entry-picker{min-width:0;max-width:240px}#entry-picker:empty{display:none}.version{flex:0 0 auto;font-size:12px;line-height:18px;color:var(--chromatic-muted);padding:5px 10px;background:var(--chromatic-subtle);border-radius:999px;font-variant-numeric:tabular-nums;white-space:nowrap}
  .mark{flex:0 0 38px;width:38px;height:38px;background:url("${ASSETS.mark}") center/38px 38px no-repeat}
  h1{font-size:28px;font-weight:600;line-height:34px;letter-spacing:-.7px;margin:0}h2{font-size:20px;line-height:26px;font-weight:600;letter-spacing:-.3px;margin:0 0 16px}h3{font-size:16px;line-height:22px;font-weight:600;letter-spacing:-.15px;margin:24px 0 12px}
  p{line-height:1.47;color:var(--chromatic-muted);margin:8px 0 16px}.muted,small{color:var(--chromatic-muted)}small{font-size:13px;line-height:19px}.intro{max-width:680px;font-size:13px;line-height:19px}.setup .intro{font-size:16px;line-height:24px}.note{font-size:13px;line-height:19px;margin:10px 0 0}
  #restoration-status{overflow-wrap:anywhere}
  .primary-nav{display:flex;gap:4px;width:468px;max-width:100%;padding:4px;margin:24px 0;border-radius:16px;background:var(--chromatic-subtle)}
  [role=tab]{white-space:nowrap;min-height:40px;font-size:14px;font-weight:500;border-radius:14px;background:none;color:var(--chromatic-muted)}
  .primary-nav [role=tab]{flex:1;min-width:0;padding:10px 12px}.primary-nav [aria-selected=true],.settings-nav [aria-current=page]{color:var(--chromatic-text);background:var(--chromatic-surface);box-shadow:var(--chromatic-shadow-float)}
  .settings-nav{display:flex;gap:12px;margin:0 0 20px}.settings-nav button{padding:10px 24px;background:none;color:var(--chromatic-muted);font-size:14px;min-height:40px;border-radius:14px}
  .card{min-width:0;border:0;background:var(--chromatic-surface);border-radius:var(--chromatic-radius-card);padding:24px;margin:0 0 20px;box-shadow:var(--chromatic-shadow-card)}.card:last-child{margin-bottom:0}
  .grid,.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 22px}.fields{margin:0 0 24px}.fields>.field{margin:0}.fields .wide{grid-column:1/-1}
  .hero{display:grid;grid-template-columns:176px minmax(0,1fr);gap:40px;align-items:center;padding:32px}.hero-info{display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0}.hero .actions{padding-top:8px}
  #cover{position:relative;width:176px;height:176px;isolation:isolate}.cover{display:block;position:relative;z-index:1;width:100%;height:100%;border-radius:18px;object-fit:cover;background:var(--chromatic-subtle);box-shadow:0 12px 26px #1f2b4026}
  .cover-glow{position:absolute;pointer-events:none;object-fit:cover;width:108%;height:108%;left:-4%;top:10%;opacity:.28;filter:blur(19.36px);border-radius:20px}.cover-glow.near{width:101%;height:101%;left:-.5%;top:7%;filter:blur(11.44px)}
  .empty-cover{display:grid;place-items:center;color:var(--chromatic-muted);font-size:48px;box-shadow:none}.track{font-size:30px;line-height:36px;letter-spacing:-.6px;margin:0;overflow-wrap:anywhere}.hero #artist{font-size:15px;line-height:22px;margin:0;overflow-wrap:anywhere}
  .badge{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:28px;padding:5px 10px;border-radius:999px;background:var(--chromatic-green-bg);color:var(--chromatic-green);font-size:12px;font-weight:500;line-height:18px}
  .badge:before{content:"";width:5px;height:5px;flex:0 0 5px;background:url("${ASSETS.statusDot}") center/5px 5px no-repeat}
  .source-card{display:grid;grid-template-columns:minmax(0,600fr) minmax(0,352fr);gap:24px}.source-card .field{margin:0}.source-card label.field,.source-heading{font-size:13px;line-height:19px;color:var(--chromatic-muted)}.source-heading{margin:0 0 8px}.count{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:46px}.count strong{font-size:15px;font-weight:500}
  label.field,.field{display:flex;flex-direction:column;gap:0;font-size:13px;margin:0 0 22px;min-width:0}label.field{gap:8px}.field label,.field select,.field input{min-width:0}.field-title{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:15px;line-height:22px}.field-title output{font-size:16px;font-variant-numeric:tabular-nums;line-height:22px;white-space:nowrap}.field small{line-height:19px}.field>small{margin-top:2.5px}
  input[type=range]{appearance:none;width:100%;height:26px;margin:2px 0 0;padding:0;background:transparent;border:0;cursor:pointer}
  input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:linear-gradient(to right,var(--chromatic-accent) var(--range-percent,0%),var(--chromatic-track) var(--range-percent,0%))}
  input[type=range]::-webkit-slider-thumb{appearance:none;height:16px;width:16px;margin-top:-6px;border:2px solid var(--chromatic-surface);border-radius:50%;background:var(--chromatic-accent);box-shadow:var(--chromatic-shadow-float)}
  input[type=range]::-moz-range-track{height:4px;border-radius:2px;background:var(--chromatic-track)}input[type=range]::-moz-range-progress{height:4px;border-radius:2px;background:var(--chromatic-accent)}input[type=range]::-moz-range-thumb{height:12px;width:12px;border:2px solid var(--chromatic-surface);border-radius:50%;background:var(--chromatic-accent);box-shadow:var(--chromatic-shadow-float)}
  input[type=range]:disabled{opacity:.4;cursor:default}.limits{position:relative;display:flex;justify-content:space-between;gap:12px;margin-top:3.5px;color:var(--chromatic-muted);font-size:12px;font-weight:500;line-height:16px}.limits span:last-child{text-align:right}.limits .natural{position:absolute;translate:-50% 0;text-align:center;white-space:nowrap}.limits .natural:before{content:"";position:absolute;width:1px;height:4px;background:var(--chromatic-muted);left:50%;top:-5px}
  .check{display:flex;align-items:center;gap:10px;margin:14px 0;font-size:14px;line-height:20px}.check.mini{justify-content:flex-end;font-size:12px;margin:4px 0}.check.mini input{width:16px;height:16px;flex-basis:16px}
  .mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:20px 0 24px}.mode-card,.role-card{display:block;text-align:left;min-width:0;padding:16px;border:1px solid var(--chromatic-border);border-radius:var(--chromatic-radius-tile);background:var(--chromatic-surface)}
  .mode-card[data-mode=color_field]{grid-column:span 2}.mode-card strong,.role-card strong{display:block;margin:0 0 6px;font-size:16px;font-weight:600;line-height:22px;letter-spacing:-.15px}.mode-card p,.role-card small{display:block;margin:0;font-size:13px;font-weight:400;line-height:19px}
  .mode-card.active,.role-card.active,.group-tile.active{border-color:var(--chromatic-accent);background:var(--chromatic-selected)}.mode-card:hover,.role-card:hover{background:var(--chromatic-subtle)}
  .palette{display:flex;gap:6px;height:46px;margin:16px 0;border-radius:14px;overflow:hidden}.swatch{min-width:0;flex:1}
  .map-heading{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.map-heading h2{margin:0}.color-map{position:relative;border-radius:16px;overflow:hidden;isolation:isolate;aspect-ratio:2.4;background:var(--chromatic-subtle)}.color-map canvas{display:block;width:100%;height:100%;position:absolute;inset:0}.field-probes{position:absolute;inset:0}
  .field-probe{position:absolute;display:grid;place-items:center;width:26px;height:26px;transform:translate(-50%,-50%);border:1.5px solid #fffffff2;border-radius:50%;color:#fff;font-size:12px;font-weight:500;background:#ffffff2e;text-shadow:0 1px 4px #0006;box-shadow:var(--chromatic-shadow-float);will-change:left,top}
  .field-legend{display:flex;gap:8px 18px;flex-wrap:wrap;margin-top:12px;font-size:12px;line-height:20px;color:var(--chromatic-muted)}.field-legend>span{display:flex;align-items:flex-start;gap:5px;min-width:0;max-width:100%}.field-legend .legend-name{min-width:0;overflow-wrap:anywhere}.field-legend b{display:grid;place-items:center;flex:0 0 20px;border:1px solid var(--chromatic-border);width:20px;height:20px;border-radius:50%;font-weight:500;font-variant-numeric:tabular-nums;line-height:1}
  .light-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0 24px}.light-choice{display:flex;align-items:center;gap:10px;min-width:0;min-height:54px;padding:14px;border:1px solid var(--chromatic-border);border-radius:16px;background:var(--chromatic-surface)}
  .light-choice:has(input:checked){border-color:var(--chromatic-accent);background:var(--chromatic-selected)}.light-choice:has(input:disabled){opacity:.4}.light-choice label{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}.light-label{flex:1;min-width:0;font-weight:500;overflow-wrap:anywhere}.light-label small{display:block;font-size:11px;font-weight:400;line-height:16px}.light-choice button{flex-shrink:0}.light-choice select{min-width:0}
  .roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0 22px}.roles.standalone-roles .role-card{min-height:100px}.role-question{font-size:13px;margin:28px 0 16px}.solo-settings{padding-top:12px}.solo-settings .toolbar{margin:8px 0 24px}.solo-settings h3{margin:0}
  .lights-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:18px}.group-list{display:flex;flex-direction:column;gap:10px;align-self:start;position:sticky;top:16px}.group-tile{display:flex;flex-direction:column;align-items:flex-start;gap:5px;text-align:left;border:1px solid var(--chromatic-border);border-radius:16px;background:var(--chromatic-surface);padding:16px}.group-tile strong{font-size:16px;font-weight:600}.group-tile small{font-size:12px;font-weight:400}
  .row{display:flex;align-items:center;gap:8px;margin:0}.row .grow{flex:1;min-width:0;overflow-wrap:anywhere}.light-row{padding:12px 0;border-bottom:1px solid var(--chromatic-border)}.row button.small{padding:6px 12px}.light-row small{display:block;font-size:11px}
  .toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:20px 0}.toolbar h2,.toolbar h3{margin:0}.optional-groups{display:flex;align-items:center;justify-content:space-between;gap:24px}.optional-groups h3{margin:0 0 6px}.optional-groups p{margin:0;font-size:13px}.optional-groups button{flex-shrink:0}
  .more{border-top:1px solid var(--chromatic-border);padding-top:18px;margin-top:20px}.more summary{cursor:pointer;font-size:15px;font-weight:500;color:var(--chromatic-text);padding:4px 0 12px;min-height:36px}.more>div{margin-top:12px}.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.actions .note{flex:1 1 100%}.actions.more{padding-top:16px}
  .primary{padding:12px 20px;background:var(--chromatic-action);color:var(--chromatic-on-accent)}.primary:hover{background:color-mix(in srgb,var(--chromatic-action),#000 8%)}.quiet{padding:10px 6px;border:0;background:none;color:var(--chromatic-action)}.quiet:hover{background:var(--chromatic-selected)}button.small{min-height:34px;padding:7px 14px;font-size:14px}.danger{color:var(--chromatic-error)}
  .footer{position:fixed;bottom:max(20px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;gap:12px;max-width:calc(100vw - 28px);padding:8px 10px 8px 24px;border-radius:999px;background:var(--chromatic-surface);box-shadow:0 4px 14px #1f2b4026;z-index:5}.footer span{font-size:13px;margin-right:8px;white-space:nowrap}.footer button{white-space:nowrap}
  .success{position:fixed;bottom:max(20px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);max-width:calc(100vw - 28px);padding:12px 20px;border-radius:999px;background:var(--chromatic-green-bg);color:var(--chromatic-green);box-shadow:var(--chromatic-shadow-float);font-size:14px;z-index:6;animation:notice-in .2s ease-out}
  .message{padding:14px;border-radius:10px;margin:0 0 20px;font-size:13px;overflow-wrap:anywhere}.error{color:var(--chromatic-error);background:var(--chromatic-error-bg)}
  .scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px;line-height:19px}td,th{text-align:left;padding:12px 8px;border-bottom:1px solid var(--chromatic-border);vertical-align:top}th{color:var(--chromatic-muted);font-weight:400}td:last-child,th:last-child{text-align:right}.diagnostic-name{min-width:110px}.diagnostic-short,.mobile-copy{display:none}
  code{font-family:"SFMono-Regular",Consolas,monospace;font-size:11px;line-height:16px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere}.color-map[hidden],[hidden]{display:none!important}
  @keyframes notice-in{from{opacity:0;translate:0 6px}to{opacity:1;translate:0 0}}
  @media(max-width:700px){
    .shell{padding:32px 14px 80px}h1{font-size:24px;line-height:30px;letter-spacing:-.5px}.top{gap:16px}.brand{gap:12px}.primary-nav{width:100%;margin:24px 0}.primary-nav [role=tab]{padding:10px 6px}.settings-nav{gap:8px}.settings-nav button{padding:10px 20px}
    .card{padding:24px}.grid,.fields{grid-template-columns:1fr}.hero{display:flex;flex-direction:column;gap:20px;padding:28px 24px;text-align:center}.hero-info{align-items:center;gap:10px;width:100%}.hero .actions{justify-content:center;gap:8px}.hero .quiet{font-size:14px}.track{font-size:23px;line-height:29px;letter-spacing:-.4px}#cover{width:128px;height:128px}.cover-glow{filter:blur(14.08px)}.cover-glow.near{filter:blur(8.32px)}
    .source-card{grid-template-columns:1fr;gap:24px}.count{min-height:44px}.mode-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mode-card{height:100%}.roles{grid-template-columns:repeat(2,minmax(0,1fr))}.roles.standalone-roles{grid-template-columns:1fr}.roles.standalone-roles .role-card{min-height:0}
    .light-picker{grid-template-columns:1fr}.light-choice:has(select){flex-wrap:wrap}.light-choice select{flex:1 1 100%}.lights-layout{grid-template-columns:1fr}.group-list{position:static;flex-direction:row;overflow:auto;flex-wrap:nowrap;padding-bottom:4px}.group-tile{min-width:150px}.light-row{flex-wrap:wrap}.light-row .grow{flex-basis:100%;margin-bottom:4px}.optional-groups{align-items:flex-start;flex-direction:column;gap:16px}.toolbar{flex-wrap:wrap}.solo-settings .toolbar{flex-wrap:nowrap;gap:8px}.solo-settings h3{overflow-wrap:anywhere}
    .footer{gap:8px;padding:8px}.footer span{display:none}.footer button{font-size:14px}.success{text-align:center}.map-heading{gap:10px}.badge{line-height:18px}.desktop-copy{display:none}.mobile-copy{display:inline}
    .diagnostics .scroll{overflow:visible}.diagnostics table,.diagnostics tbody{display:block}.diagnostics thead{display:none}.diagnostics tbody{display:grid;gap:12px}.diagnostics tr{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;padding:14px;border-radius:16px;background:var(--chromatic-subtle)}.diagnostics td{display:block;padding:0;border:0;min-width:0}.diagnostics .diagnostic-name{font-size:15px;font-weight:500;min-width:0;overflow-wrap:anywhere}.diagnostics .diagnostic-strategy{grid-column:1/-1;grid-row:2;color:var(--chromatic-muted)}.diagnostics .diagnostic-reason{grid-column:1/-1;grid-row:3;font-size:12px;color:var(--chromatic-muted)}.diagnostics .diagnostic-commands{grid-column:2;grid-row:1;font-size:12px;white-space:nowrap;color:var(--chromatic-muted)}.diagnostics .diagnostic-commands:after{content:" " attr(data-unit)}.diagnostics .diagnostic-technical{display:none}.diagnostic-short{display:inline}.diagnostics tr[data-problem=true]{background:var(--chromatic-error-bg)}.diagnostics tr[data-problem=true] .diagnostic-strategy,.diagnostics tr[data-problem=true] .diagnostic-reason{color:var(--chromatic-error)}
  }
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
  @media(forced-colors:active){input[type=checkbox],input[type=range],select{appearance:auto}.mode-card.active,.role-card.active,.light-choice:has(input:checked){outline:2px solid Highlight}.mark{forced-color-adjust:none}}
`;

Object.assign(STRINGS.en, {
  overview:'Atmosphere', groups:'Lights', advanced:'More settings', diagnostics:'Diagnostics',
  setupTitle:'Choose music and lights. That’s it.', setupHelp:'Select a player already connected to Home Assistant and at least one color light, then start Chromatic.',
  choosePlayer:'Choose a media player', chooseLights:'Which lights should follow the music?', start:'Start Chromatic', stop:'Stop',
  brightness:'Brightness', speed:'Time between palette colors', intensity:'Color movement', track_transition:'Fade duration',
  motionHelp:'0% holds one color. 100% gives the widest movement in the selected mode. This changes color movement, not brightness.',
  speedHelp:'A shorter cycle changes colors more often. Lamp fades are always limited to 4 seconds.',
  fadeHelp:'How long a lamp takes to reach its next color: 0 applies it immediately; 4 gives the softest fade.',
  basicHelp:'The cover defines the colors. A nearly monochrome cover naturally produces gentler changes.',
  staticHelp:'Keep one color from the cover.', subtle_driftHelp:'Gently move between neighboring cover shades.',
  palette_flowHelp:'Clearly visible, smooth travel through the cover colors.', spatial_flowHelp:'Spread different cover colors across the room.',
  static:'One color', subtle_drift:'Gentle movement', palette_flow:'Palette flow', spatial_flow:'Across the room',
  allLights:'Your lights', lightsIntro:'Select lights to use independently. Groups are optional, for lights that need shared behavior.',
  splitGroups:'Separate lights into groups', newGroup:'Add group', groupName:'Group name', groupHelp:'Lights in a group share the same color limits and behavior.',
  roleHelp:'Choose how these lights are used. A role applies sensible color and brightness limits.',
  decorative:'Decorative', main:'Everyday light', universal:'Use general settings',
  decorativeHelp:'Strips, shelves and accent lamps. Richer cover colors.', mainHelp:'Ceiling and work lights. Softer colors and comfortable brightness.', universalHelp:'Follow the general color and brightness settings.',
  synchronous:'Same color', distributed:'Different palette colors', independent:'Different timing',
  synchronousHelp:'Every lamp receives the same cover color.', distributedHelp:'The saved light order spreads palette colors between lamps.', independentHelp:'Each lamp moves through the palette with its own timing.',
  control:'How these lights work together', groupEnabled:'Include these lights', groupAdvanced:'Fine-tune this group',
  inherit:'Use group / general settings', useCustom:'Override', configureLight:'Fine-tune', inherits:'Uses general settings',
  defaults:'Recommended atmosphere', defaultsHelp:'Restore a visible, calm flow: 12-second cycle, 75% movement and 2-second fades.',
  behavior:'When playback changes', fineTuning:'Technical limits', transitionHelp:'Auto uses a lamp’s native fade when advertised. Software fades require your permission. Every native fade is capped at 4 seconds.',
  advancedHelp:'The defaults work for a first run. Change these only if a particular lamp needs different behavior.',
  needs_setup:'Choose a player and lights', save:'Apply changes', saved:'Changes applied', settings:'More settings',
  ready:'Ready to start', lightCount:'Selected lights', openLights:'Change lights', noLights:'Choose at least one light',
  software_hz:'Software commands per second', min_delta:'Minimum color difference', hardware_interval:'Time between lamp targets', hardware_max_duration:'Maximum native fade',
  seconds:'s', percent:'%', faster:'faster', slower:'slower', groupIntensity:'Movement in this group',
  reset:'Resume released lights', resetHelp:'Bring manually changed lights back into this session.',
  loading:'Connecting to Chromatic…', details:'Details', paused:'Paused · holding the light',
  color_field:'Living gradient', color_fieldHelp:'Travel through a blurred map of the cover. New shades emerge continuously along each light’s path.',
  fieldTitle:'The cover’s color map', fieldMissing:'The map will appear when the player provides a cover.', fieldPreview:'Preview', fieldActive:'Following the map', fieldPaused:'Paused',
  fieldSpeed:'Travel pace', fieldSpeedHelp:'Fewer seconds means faster travel. The path keeps moving between shades, without stopping at individual colors.',
  fieldMotionHelp:'0% holds one color. 100% follows the full range of shades in the map. Brightness is controlled separately.',
  field_contrast:'Color contrast', fieldContrastHelp:'100% keeps the original color differences. Higher values separate the colored clouds; lower values blend them. Brightness stays the same.',
  field_synchronous:'Same path', field_distributed:'Different map areas', field_independent:'Different paths',
  field_synchronousHelp:'These lights follow one point together.', field_distributedHelp:'The saved light order spaces the lights along the map.', field_independentHelp:'Each light takes its own smoothly shifted path.',
  defaultsHelp:'A living gradient: 140% color contrast, 12-second travel pace, 75% color movement and 2-second fades.',
  soloTitle:'Lights without groups', soloHelp:'These lights use the general atmosphere and their own paths. You can fine-tune each one.',
  withoutGroup:'Without a group', optionalGroups:'Groups · optional', ungroup:'Ungroup', ungroupHelp:'The lights stay selected. Their color and brightness limits are kept.', groupMembers:'Lights in this group', groupMembersHelp:'Unchecking a light returns it to the independent list.', close:'Done',
});
Object.assign(STRINGS.ru, {
  overview:'Атмосфера', groups:'Светильники', advanced:'Дополнительно', diagnostics:'Диагностика',
  setupTitle:'Выберите музыку и свет — готово', setupHelp:'Укажите медиаплеер, уже подключённый к Home Assistant, и хотя бы одну цветную лампу. Затем запустите Chromatic.',
  choosePlayer:'Выберите медиаплеер', chooseLights:'Какие светильники меняются под музыку?', start:'Запустить Chromatic', stop:'Остановить',
  brightness:'Яркость', speed:'Время между цветами палитры', intensity:'Размах смены цветов', track_transition:'Плавность перехода',
  motionHelp:'0% — один цвет. 100% — максимальный размах в выбранном режиме. Этот ползунок меняет движение цвета, а не яркость.',
  speedHelp:'Меньше секунд — цвета меняются чаще. Плавный переход самой лампы всегда ограничен 4 секундами.',
  fadeHelp:'За сколько секунд лампа достигает следующего цвета. 0 — сразу, 4 — самый мягкий переход.',
  basicHelp:'Цвета берутся из обложки. У почти однотонной обложки изменения естественно будут мягче.',
  staticHelp:'Постоянный цвет из обложки.', subtle_driftHelp:'Мягкое движение между близкими оттенками.',
  palette_flowHelp:'Заметные плавные переливы между цветами обложки.', spatial_flowHelp:'Разные цвета обложки распространяются по комнате.',
  static:'Один цвет', subtle_drift:'Мягкое движение', palette_flow:'Переливы палитры', spatial_flow:'По комнате',
  allLights:'Ваш свет', lightsIntro:'Отметьте светильники — они будут работать самостоятельно. Группы необязательны и нужны только для общих правил.',
  splitGroups:'Разделить свет на группы', newGroup:'Добавить группу', groupName:'Название группы', groupHelp:'У ламп одной группы общие ограничения цвета и поведение.',
  roleHelp:'Выберите назначение света — подходящие ограничения применятся автоматически.',
  decorative:'Декоративный', main:'Повседневный свет', universal:'Общие настройки',
  decorativeHelp:'Ленты, полки, акцентные лампы. Более насыщенные цвета.', mainHelp:'Потолочный и рабочий свет. Мягкие оттенки и комфортная яркость.', universalHelp:'Общие настройки цвета и яркости без отдельного профиля.',
  synchronous:'Одинаковый цвет', distributed:'Разные цвета палитры', independent:'Разное движение',
  synchronousHelp:'Все лампы получают один и тот же цвет обложки.', distributedHelp:'Цвета палитры распределяются по сохранённому порядку ламп.', independentHelp:'Каждая лампа движется по палитре со своей фазой.',
  control:'Как лампы работают вместе', groupEnabled:'Участвует в синхронизации', groupAdvanced:'Точная настройка группы',
  inherit:'По настройкам группы / общим', useCustom:'Изменить', configureLight:'Настроить', inherits:'По общим настройкам',
  defaults:'Рекомендуемая атмосфера', defaultsHelp:'Заметный спокойный эффект: цикл 12 секунд, размах 75%, плавность 2 секунды.',
  behavior:'Поведение при воспроизведении', fineTuning:'Технические ограничения', transitionHelp:'Авто использует плавность самой лампы, если она заявлена. Программные переходы включаются с вашего разрешения. Аппаратный переход всегда не дольше 4 секунд.',
  advancedHelp:'Для первого запуска достаточно настроек по умолчанию. Здесь можно подстроить поведение отдельных ламп.',
  needs_setup:'Выберите медиаплеер и светильники', save:'Применить изменения', saved:'Изменения применены', settings:'Дополнительно',
  ready:'Всё готово к запуску', lightCount:'Выбрано светильников', openLights:'Изменить светильники', noLights:'Выберите хотя бы один светильник',
  software_hz:'Программных команд в секунду', min_delta:'Минимальная разница цвета', hardware_interval:'Интервал новых цветовых целей', hardware_max_duration:'Максимум аппаратного перехода',
  seconds:'с', percent:'%', faster:'быстрее', slower:'медленнее', groupIntensity:'Движение в этой группе',
  reset:'Вернуть исключённые лампы', resetHelp:'Снова включить в сессию лампы, изменённые вручную.',
  loading:'Подключение к Chromatic…', details:'Подробности', paused:'Пауза · свет сохраняется',
  color_field:'Живой градиент', color_fieldHelp:'Движение по размытой карте обложки. Новые оттенки непрерывно рождаются на пути каждой лампы.',
  fieldTitle:'Цветовая карта обложки', fieldMissing:'Карта появится, когда медиаплеер передаст обложку.', fieldPreview:'Предпросмотр', fieldActive:'Свет движется по карте', fieldPaused:'Пауза',
  fieldSpeed:'Темп движения по карте', fieldSpeedHelp:'Меньше секунд — быстрее движение. Путь непрерывный, без остановок на отдельных цветах.',
  fieldMotionHelp:'0% — один цвет. 100% — весь размах оттенков карты. Яркость задаётся отдельно.',
  field_contrast:'Контраст цветов', fieldContrastHelp:'100% — исходные различия цветов. Выше — цветные облака заметнее, ниже — сильнее смешиваются. Яркость сохраняется.',
  field_synchronous:'Один маршрут', field_distributed:'Разные участки карты', field_independent:'Разные пути',
  field_synchronousHelp:'Лампы вместе следуют за одной точкой.', field_distributedHelp:'Лампы распределяются по карте в сохранённом порядке.', field_independentHelp:'У каждой лампы свой плавно смещённый путь.',
  defaultsHelp:'Живой градиент: контраст 140%, темп 12 секунд, размах 75%, плавность 2 секунды.',
  soloTitle:'Светильники без групп', soloHelp:'Общая атмосфера и собственный маршрут каждой лампы. При желании можно настроить каждую отдельно.',
  withoutGroup:'Без группы', optionalGroups:'Группы · необязательно', ungroup:'Разгруппировать', ungroupHelp:'Лампы останутся выбранными. Ограничения цвета и яркости сохранятся.', groupMembers:'Состав группы', groupMembersHelp:'Снятая отметка вернёт лампу в список без группы.', close:'Готово',
});

// Copy and hierarchy shared with the approved Soft UI design.
Object.assign(STRINGS.en, {
  settings:'Settings', navigation:'Chromatic sections',
  settingsNavigation:'Settings sections', settingsBehavior:'Behavior',
  setupTitle:'Start with music', setupHelp:'Choose a player and color lights. You can change your settings at any time.',
  chooseLights:'Choose lights', mode:'How the light changes', intensity:'Color variety', track_transition:'Fade',
  reset:'Resume lights', sourceTitle:'Music source', lightCount:'Lights', selectedLights:'selected', openLights:'Change',
  syncing:'Following the music', fieldTitle:'Color map', fieldSpeed:'Travel pace', fieldSpeedHelp:'Fewer seconds means faster travel across the map.',
  fieldMotionHelp:'From a quiet shade to the cover’s full palette. This changes color, not brightness.',
  fieldContrastHelp:'Lower blends the colors. Higher makes the colors more distinct.', fadeHelp:'0 s — instant. 4 s — the smoothest fade.',
  color_fieldHelp:'Lights travel smoothly across the color map.', staticHelp:'One shade from the cover.',
  subtle_driftHelp:'Barely noticeable changes in shade.', palette_flowHelp:'Smooth transitions between the cover’s colors.',
  spatial_flowHelp:'Different shades in different parts of the room.',
  yourLights:'Your lights', standaloneHelp:'Each lamp follows its own path across the color map.',
  lightSettings:'Settings', roleQuestion:'What kind of light would you like?', fineTuning:'Fine-tuning',
  decorativeHelp:'More color for strips, shelves and accent lamps.', mainHelp:'Soft shades and comfortable brightness.',
  universalHelp:'Follow the atmosphere’s general settings.',
  groupsTitle:'Groups', groupsOptional:'Groups are optional', groupsOptionalHelp:'Bring lights together when they need shared settings.',
  newGroup:'Create group', groupAdvanced:'Fine-tune this group',
  statusSync:'Synchronization active', technicalLimits:'Technical limits', deviceStatus:'Device status', deviceStatusHelp:'Device availability and how your lights are controlled.',
  commandsUnit:'commands', lampFade:'Lamp’s native fade', softwareFade:'Software fade', directColor:'Direct color',
  fadeAdvertised:'Fade support is advertised by the device.', light_unavailable_short:'No connection to the lamp',
  high_rate_confirmed:'Higher frequency for all lights', highRateHelp:'One switch allows up to 10 commands per second for every selected light. Turning it off caps their configured rates at 5/s.',
  rateHelp:'The chosen frequency applies to each light. There is no shared command ceiling. Individual lamp settings can override the general frequency.',
  saturation:'Saturation', saturationHelp:'Make the cover colors softer or richer. Brightness is controlled separately.',
  noColor:'No color', mutedColor:'Muted', naturalColor:'Natural', richColor:'Rich', vividColor:'Vivid',
  softContrast:'Soft', originalContrast:'Original', expressiveContrast:'Expressive', strongContrast:'Strong', maximumContrast:'Maximum',
  colorLow:'No color', colorHigh:'Rich', contrastLow:'Soft', contrastHigh:'Strong', originalLevel:'Cover',
  max_saturation:'Saturation limit',
  defaultsHelp:'A living gradient with natural saturation, expressive contrast, a 12-second travel pace, 75% color movement and 2-second fades.',
});
Object.assign(STRINGS.ru, {
  settings:'Настройки', navigation:'Разделы Chromatic',
  settingsNavigation:'Разделы настроек', settingsBehavior:'Поведение',
  setupTitle:'Начнём с музыки', setupHelp:'Выберите медиаплеер и цветные лампы. Настройки можно изменить в любой момент.',
  chooseLights:'Выберите светильники', mode:'Как меняется свет', intensity:'Разнообразие цветов', track_transition:'Плавность',
  reset:'Вернуть лампы', sourceTitle:'Источник музыки', lightCount:'Светильники', selectedLights:'выбрано', openLights:'Изменить',
  syncing:'Свет следует музыке', fieldTitle:'Цветовая карта', fieldSpeed:'Темп движения', fieldSpeedHelp:'Меньше секунд — быстрее путь по карте.',
  fieldMotionHelp:'От спокойного оттенка до всей палитры обложки.',
  fieldContrastHelp:'Ниже — мягче смешение. Выше — выразительнее цвета.', fadeHelp:'0 с — мгновенно. 4 с — максимально плавно.',
  color_fieldHelp:'Лампы плавно движутся по цветовой карте.', staticHelp:'Один оттенок из обложки.',
  subtle_driftHelp:'Едва заметные изменения оттенка.', palette_flowHelp:'Плавные переходы между цветами обложки.',
  spatial_flowHelp:'Разные оттенки в разных частях комнаты.',
  yourLights:'Ваши светильники', standaloneHelp:'Каждая лампа следует своим маршрутом по цветовой карте.',
  lightSettings:'Настройки', roleQuestion:'Какой свет вам нужен?', fineTuning:'Тонкая настройка',
  decorativeHelp:'Больше цвета для лент, полок и акцентных ламп.', mainHelp:'Мягкие оттенки и комфортная яркость.',
  universalHelp:'Следовать настройкам всей атмосферы.',
  groupsTitle:'Группы', groupsOptional:'Группы — по желанию', groupsOptionalHelp:'Объединяйте свет, когда нужны общие настройки.',
  newGroup:'Создать группу', groupAdvanced:'Тонкая настройка группы',
  statusSync:'Синхронизация активна', technicalLimits:'Технические ограничения', deviceStatus:'Состояние устройств', deviceStatusHelp:'Состояние устройств и способы управления светом.',
  commandsUnit:'команд', lampFade:'Переход самой лампы', softwareFade:'Программный переход', directColor:'Применение цвета',
  fadeAdvertised:'Поддержка плавности заявлена устройством.', light_unavailable_short:'Нет связи с лампой',
  high_rate_confirmed:'Повышенная частота для всех светильников', highRateHelp:'Один переключатель разрешает до 10 команд в секунду каждой выбранной лампе. При выключении заданные частоты ограничиваются 5/с.',
  rateHelp:'Выбранная частота относится к каждой лампе. Общего потолка команд нет. В настройках отдельной лампы можно задать свою частоту.',
  saturation:'Насыщенность', saturationHelp:'Сделайте цвета обложки мягче или сочнее. Яркость задаётся отдельно.',
  noColor:'Без цвета', mutedColor:'Приглушённо', naturalColor:'Естественно', richColor:'Насыщенно', vividColor:'Очень насыщенно',
  softContrast:'Мягкий', originalContrast:'Исходный', expressiveContrast:'Выразительный', strongContrast:'Сильный', maximumContrast:'Максимальный',
  colorLow:'Без цвета', colorHigh:'Насыщенно', contrastLow:'Мягко', contrastHigh:'Сильно', originalLevel:'Обложка',
  max_saturation:'Предел насыщенности',
  defaultsHelp:'Живой градиент: естественная насыщенность, выразительный контраст, темп 12 секунд, размах 75%, плавность 2 секунды.',
});

// Match field.py: the preview uses the same grid, spline and trajectory as HA.
const fieldPosition = (elapsed,speed,phase=0,seed=0,amount=1) => {
  const t=2*Math.PI*elapsed/speed,a=2*Math.PI*(phase+seed),b=2*Math.PI*(phase*.754877666+seed*.618033989);
  const point=[.5+.47*Math.sin(t/Math.sqrt(17)+a+.22*Math.sin(t/Math.sqrt(199)+b)),.5+.47*Math.sin(t/Math.sqrt(31)+b+.24*Math.sin(t/Math.sqrt(283)+a))];
  if(amount!==1){const origin=fieldPosition(0,speed,phase,seed);return point.map((v,i)=>origin[i]+(v-origin[i])*amount);}
  return point;
};
const flowPoint = (x,y,elapsed,speed,seed=0,amount=1) => {
  const t=2*Math.PI*elapsed/(9*speed),a=2*Math.PI*seed,envelope=.055*amount*Math.sin(Math.PI*x)*Math.sin(Math.PI*y);
  return [Math.max(0,Math.min(1,x+envelope*(Math.sin(t+a+2*y)-Math.sin(a+2*y)))),Math.max(0,Math.min(1,y+envelope*(Math.sin(t/Math.sqrt(2)+a+2*x)-Math.sin(a+2*x))))];
};
const splineWeights = t => [(1-t)**3/6,(3*t**3-6*t*t+4)/6,(-3*t**3+3*t*t+3*t+1)/6,t**3/6];
const sampleField = (field,x,y) => {
  x=Math.max(0,Math.min(1,x))*(field.width-1);y=Math.max(0,Math.min(1,y))*(field.height-1);
  const ix=Math.floor(x),iy=Math.floor(y),wx=splineWeights(x-ix),wy=splineWeights(y-iy),lab=[0,0,0];
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){
    const value=field.labs[Math.max(0,Math.min(field.height-1,iy+j-1))*field.width+Math.max(0,Math.min(field.width-1,ix+i-1))],weight=wx[i]*wy[j];
    for(let c=0;c<3;c++)lab[c]+=value[c]*weight;
  }
  return lab;
};
const fieldLinear = ([l,a,b]) => {
  const x=(l+.3963377774*a+.2158037573*b)**3,y=(l-.1055613458*a-.0638541728*b)**3,z=(l-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*x-3.3077115913*y+.2309699292*z,-1.2684380046*x+2.6097574011*y-.3413193965*z,-.0041960863*x-.7034186147*y+1.707614701*z];
};
const fieldInGamut = lab => fieldLinear(lab).every(v=>v>=-1e-7&&v<=1.0000001);
const fieldGamut = ([l,a,b]) => {
  // Same constant-lightness, constant-hue boundary search as color.py, including
  // the non-convex blue cusp. RGB channel clipping would change the shown hue.
  const chroma=Math.hypot(a,b);if(chroma<1e-7)return [l,0,0];
  const ch=a/chroma,sh=b/chroma,slopes=[.3963377774*ch+.2158037573*sh,-.1055613458*ch-.0638541728*sh,-.0894841775*ch-1.291485548*sh];
  const roots=[0],matrices=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]];
  for(const row of matrices){
    const c0=l**3*row.reduce((s,m)=>s+m,0),c1=3*l*l*row.reduce((s,m,i)=>s+m*slopes[i],0),c2=3*l*row.reduce((s,m,i)=>s+m*slopes[i]**2,0),c3=row.reduce((s,m,i)=>s+m*slopes[i]**3,0),critical=[0,.5],discriminant=4*c2*c2-12*c3*c1;
    if(Math.abs(c3)>1e-12&&discriminant>=0)critical.push(...[(-2*c2-Math.sqrt(discriminant))/(6*c3),(-2*c2+Math.sqrt(discriminant))/(6*c3)].filter(v=>v>0&&v<.5));
    else if(Math.abs(c2)>1e-12&&-c1/(2*c2)>0&&-c1/(2*c2)<.5)critical.push(-c1/(2*c2));
    critical.sort((x,y)=>x-y);
    for(const level of [0,1]){
      const value=c=>((c3*c+c2)*c+c1)*c+c0-level;
      for(let i=0;i<critical.length-1;i++){
        let low=critical[i],high=critical[i+1],lowValue=value(low);if(lowValue*value(high)>0)continue;
        for(let step=0;step<30;step++){const mid=(low+high)/2,v=value(mid);if(lowValue*v<=0)high=mid;else{low=mid;lowValue=v;}}
        roots.push((low+high)/2);
      }
    }
  }
  const allowed=Math.max(0,...roots.filter(c=>fieldInGamut([l,c*ch,c*sh]))),scale=Math.min(1,allowed/chroma),result=[l,a*scale,b*scale];
  if(fieldInGamut(result))return result;
  let low=0,high=scale;
  for(let step=0;step<22;step++){const mid=(low+high)/2;if(fieldInGamut([l,a*mid,b*mid]))low=mid;else high=mid;}
  return [l,a*low,b*low];
};
const fieldRGB = lab => {
  return fieldLinear(fieldInGamut(lab)?lab:fieldGamut(lab)).map(v=>Math.round(255*Math.max(0,Math.min(1,v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055))));
};
const rgbLab = rgb => {
  const [r,g,b]=rgb.map(v=>{v=Math.max(0,Math.min(255,Number(v)))/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
};
const makeID = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2,'0')).join('');

class ChromaticPanel extends HTMLElement {
  constructor() {
    super();this.attachShadow({mode:'open'});
    this._data={entries:[]};this._tab='overview';this._epoch=0;this._dirty=false;this._saving=false;
    this._notice='';this._error='';this._sections=new Map();this._settingsTab='advanced';
    this.shadowRoot.addEventListener('click',e=>this._click(e));
    this.shadowRoot.addEventListener('keydown',e=>{
      const tab=e.target.closest('[role=tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();const tabs=[...tab.parentElement.querySelectorAll('[role=tab]')],index=tabs.indexOf(tab);
      const next=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length],id=next.id;
      next.click();this.shadowRoot.getElementById(id)?.focus();
    });
    this.shadowRoot.addEventListener('change',e=>this._change(e));
    this.shadowRoot.addEventListener('input',e=>{if(e.target.matches('input:not([type=checkbox])'))this._change(e,true);});
    this.shadowRoot.addEventListener('toggle',e=>{if(e.target.dataset.section)this._sections.set(`${this._tab}:${e.target.dataset.section}`,e.target.open);},true);
    this.shadowRoot.addEventListener('focusout',()=>queueMicrotask(()=>{
      if(this._pendingExternal&&!this._dirty&&!this._editing()){this._pendingExternal=false;this._loadDraft();this._render();}else{this._live();}
    }));
  }
  set hass(value){const changed=this._hass?.connection!==value.connection;const language=this._hass?.language!==value.language;this._hass=value;this.dataset.theme=value.themes?.darkMode?'dark':'light';if(changed&&this.isConnected)this._connect();else if(language&&!this._dirty)this._render();}
  connectedCallback(){this._render();if(this._hass)this._connect();}
  disconnectedCallback(){this._epoch++;this._unsubscribe?.();this._unsubscribe=null;clearTimeout(this._noticeTimer);this._stopFieldPreview();this._notice='';}
  t(key){return STRINGS[this._hass?.language?.startsWith('ru')?'ru':'en'][key]||key;}
  get selected(){return this._data.entries.find(e=>e.entry_id===this._entry);}
  get group(){return this._draft?.groups.find(g=>g.id===this._group);}
  _editing(){return this.shadowRoot.activeElement?.matches('input,select,textarea');}
  async _connect(){
    this._unsubscribe?.();this._unsubscribe=null;if(this._connectionError)this._error='';this._connectionError=false;const epoch=++this._epoch;
    try{
      const unsubscribe=await this._hass.connection.subscribeMessage(data=>{
        if(epoch!==this._epoch)return;
        this._data=data;this._received=true;if(this._connectionError){this._connectionError=false;this._error='';}
        if(!this.selected){this._entry=data.entries[0]?.entry_id;this._dirty=false;this._draft=null;}
        if(!this._draft){this._loadDraft();this._render();return;}
        if(!this._dirty&&JSON.stringify(this._draft)!==JSON.stringify(this.selected?.settings)){
          if(this._editing()){this._pendingExternal=true;}else{this._loadDraft();this._render();return;}
        }
        if(!this._dirty&&JSON.stringify(this._draft)===JSON.stringify(this.selected?.settings))this._revision=this.selected.revision;
        // Playback/diagnostics pushes never replace the form or close a native select.
        this._live();
      },{type:'chromatic/subscribe'});
      if(epoch!==this._epoch)unsubscribe();else this._unsubscribe=unsubscribe;
    }catch(err){if(epoch===this._epoch){this._connectionError=true;this._error=err.message||String(err);this._renderNotice();}}
  }
  _loadDraft(){if(!this.selected)return;this._draft=clone(this.selected.settings);this._draft.lights??=[];this._draft.light_roles??={};this._draft.light_overrides??={};this._draft.field_contrast??=140;this._draft.saturation??=100;this._draft.high_rate_confirmed??=false;this._revision=this.selected.revision;if(!this._draft.groups.some(g=>g.id===this._group))this._group=this._draft.groups[0]?.id;}
  _mark(){const fresh=!this._dirty;this._dirty=true;this._notice='';clearTimeout(this._noticeTimer);if(fresh)this._footer();this._renderNotice();this._updateStart();}
  _showNotice(message){clearTimeout(this._noticeTimer);this._notice=message;this._renderNotice();this._noticeTimer=setTimeout(()=>{this._notice='';this._renderNotice();},3000);}
  _renderNotice(){const el=this.shadowRoot.getElementById('notice');if(el)el.innerHTML=this._error?`<div class="message error" role="alert">${esc(this._error)}${this._connectionError?` <button data-action="retry-connection">${esc(this.t('retryConnection'))}</button>`:''}</div>`:this._notice?`<div class="success" role="status">${esc(this._notice)}</div>`:'';}
  _details(name,title,body){return `<details class="more" data-section="${esc(name)}" ${this._sections.get(`${this._tab}:${name}`)?'open':''}><summary>${esc(title)}</summary><div>${body}</div></details>`;}
  _value(path){const parts=this._parts(path);return parts.reduce((v,k)=>v?.[k],this._draft);}
  _parts(path){const parts=path.split('.'),i=parts.indexOf('light_overrides');if(i>=0)parts.splice(i+1,2,parts[i+1]+'.'+parts[i+2]);return parts;}
  _setPath(path,value){const parts=this._parts(path);let object=this._draft;for(const key of parts.slice(0,-1))object=object[key]??={};object[parts.at(-1)]=value;}
  _hasLevels(key){return key==='saturation'||key==='field_contrast';}
  _controlValue(key,value,unit='%'){
    if(key==='saturation')return this.t(value===0?'noColor':value<75?'mutedColor':value<125?'naturalColor':value<175?'richColor':'vividColor');
    if(key==='field_contrast')return this.t(value<75?'softContrast':value<125?'originalContrast':value<200?'expressiveContrast':value<300?'strongContrast':'maximumContrast');
    return `${value} ${unit}`;
  }
  _controlExact(value){return new Intl.NumberFormat(this._hass?.language?.startsWith('ru')?'ru':'en',{maximumFractionDigits:2}).format(value/100)+'×';}
  _field(key,value,kind='number',options={}){
    const path=options.path||key,label=options.label||this.t(key),help=options.help||'';
    if(kind==='boolean')return `<label class="check${options.toggle?' toggle':''}"><input type="checkbox" ${options.toggle?'role="switch"':''} data-path="${esc(path)}" ${value?'checked':''}>${esc(label)}</label>`;
    if(Array.isArray(kind))return `<label class="field">${esc(label)}<select data-path="${esc(path)}">${options.nullable?`<option value="">${esc(this.t('inherit'))}</option>`:''}${kind.map(v=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(options.labels?.[v]||(options.raw?v:this.t(v)))}</option>`).join('')}</select>${help?`<small>${esc(help)}</small>`:''}</label>`;
    if(kind==='text')return `<label class="field">${esc(label)}<input type="text" maxlength="80" data-path="${esc(path)}" value="${esc(value)}"></label>`;
    const min=options.min??0,max=options.max??100,unit=options.unit??'%',custom=value!=null,effective=value??options.fallback??min;
    const levels=this._hasLevels(key),formatted=this._controlValue(key,effective,unit),exact=levels?this._controlExact(effective):formatted;
    return `<div class="field"><label class="field-title" for="${esc(path)}"><span>${esc(label)}</span><output data-output="${esc(path)}" title="${esc(exact)}">${esc(formatted)}</output></label>${options.nullable?`<label class="check mini"><input type="checkbox" data-custom="${esc(path)}" ${custom?'checked':''}>${esc(this.t('useCustom'))}</label>`:''}<input type="range" id="${esc(path)}" data-path="${esc(path)}" data-unit="${esc(unit)}" data-fallback="${options.fallback??min}" min="${min}" max="${max}" step="${options.step??1}" value="${effective}" title="${esc(exact)}" ${levels?`aria-valuetext="${esc(formatted+' · '+exact)}"`:''} style="--range-percent:${100*(effective-min)/(max-min)}%" ${options.nullable&&!custom?'disabled':''}><div class="limits"><span>${levels?esc(this.t(key==='saturation'?'colorLow':'contrastLow')):min+' '+esc(unit)+(key==='speed'?` · ${esc(this.t('faster'))}`:'')}</span><span>${levels?esc(this.t(key==='saturation'?'colorHigh':'contrastHigh')):max+' '+esc(unit)+(key==='speed'?` · ${esc(this.t('slower'))}`:'')}</span>${levels?`<span class="natural" style="left:${100*(100-min)/(max-min)}%" aria-hidden="true">${esc(this.t('originalLevel'))}</span>`:''}</div>${help?`<small>${esc(help)}</small>`:''}</div>`;
  }
  _global(key,kind='number',options={}){return this._field(key,this._draft[key],kind,options);}
  _profile(group,light=''){
    const s=this._draft,p={strategy:s.strategy,allow_software:s.allow_software,software_hz:s.software_hz,high_rate_confirmed:!!s.high_rate_confirmed,max_saturation:s.max_saturation,saturation:s.saturation,intensity:s.group_intensity,min_brightness:s.min_brightness,max_brightness:s.max_brightness,breathing:s.breathing,min_delta:s.min_delta,hardware_interval:s.hardware_interval,hardware_max_duration:s.hardware_max_duration};
    if(group.role==='decorative')Object.assign(p,{max_saturation:100,intensity:100,min_brightness:5});
    if(group.role==='main')Object.assign(p,{max_saturation:35,intensity:50,min_brightness:20});
    for(const override of [group.overrides,group.light_overrides[light]])if(override)for(const [k,v]of Object.entries(override))if(v!=null&&k!=='high_rate_confirmed')p[k]=v;
    if(light&&group.light_overrides[light]){const gp=this._profile(group);p.min_brightness=Math.max(p.min_brightness,gp.min_brightness);p.max_brightness=Math.min(p.max_brightness,gp.max_brightness);}
    return p;
  }
  _newGroup(name=this.t('allLights')){return {id:makeID(),name,lights:[],role:this._draft.default_role||'decorative',control:'synchronous',enabled:true,modes:[...MODES],priority:0,order:this._draft.groups.length,participate:true,static_color:'inherit',overrides:{},light_overrides:{}};}
  _soloScope(light){return {id:'solo:'+light,name:this._hass.states[light]?.attributes.friendly_name||light,lights:[light],role:this._draft.light_roles[light]||this._draft.default_role,overrides:this._draft.light_overrides[light]||{},light_overrides:{},control:'synchronous',participate:true,enabled:true,modes:MODES};}
  _inherited(path){
    const parts=this._parts(path),key=parts.at(-1);
    if(parts[0]==='light_overrides')return this._profile(this._soloScope(parts[1]),parts[1])[key];
    const group=this._draft.groups[Number(parts[1])];
    return this._profile(group,parts[2]==='light_overrides'?parts[3]:'')[key];
  }
  _allSelected(settings=this._draft){return [...(settings.lights||[]),...settings.groups.flatMap(g=>g.lights)];}
  _dropSolo(light){this._draft.lights=this._draft.lights.filter(l=>l!==light);delete this._draft.light_roles[light];delete this._draft.light_overrides[light];}
  _releaseLight(g,light){
    const gp=this._profile(g),profile=this._profile(g,light);
    profile.max_saturation=Math.min(profile.max_saturation,gp.max_saturation);
    if(!this._draft.lights.includes(light))this._draft.lights.push(light);
    this._draft.light_roles[light]=g.role;this._draft.light_overrides[light]=profile;
    g.lights=g.lights.filter(l=>l!==light);delete g.light_overrides[light];
  }
  _joinGroup(light,g){
    const overrides=this._draft.light_overrides[light];this._dropSolo(light);
    if(!g.lights.includes(light))g.lights.push(light);
    if(overrides)g.light_overrides[light]=overrides;
  }
  _render(){
    this._stopFieldPreview();
    const s=this.selected,inSettings=['advanced','diagnostics'].includes(this._tab),primary=inSettings?'settings':this._tab;
    this.shadowRoot.innerHTML=`<style>${CSS}</style><main class="shell"><div class="top"><div class="brand"><span class="mark" aria-hidden="true"></span><h1>Chromatic</h1></div><div class="top-meta"><div id="entry-picker"></div><span class="version" id="version" hidden></span></div></div><div id="notice"></div><p id="restoration-status" class="note" role="status" hidden></p>${s?`<nav class="primary-nav" role="tablist" aria-label="${esc(this.t('navigation'))}">${['overview','groups','settings'].map(tab=>`<button id="nav-${tab}" role="tab" aria-selected="${tab===primary}" aria-controls="content" tabindex="${tab===primary?0:-1}" data-tab="${tab==='settings'?this._settingsTab:tab}">${esc(this.t(tab))}</button>`).join('')}</nav><div id="content" role="tabpanel" aria-labelledby="nav-${primary}">${inSettings?this._settingsNavigation():''}${this._content()}</div>`:`<p class="card">${esc(this.t(this._hass&&!this._received?'loading':'empty'))}</p>`}<div id="footer"></div></main>`;
    this._live();this._footer();this._renderNotice();
  }
  _settingsNavigation(){return `<nav class="settings-nav" aria-label="${esc(this.t('settingsNavigation'))}">${['advanced','diagnostics'].map(tab=>`<button aria-current="${this._tab===tab?'page':'false'}" data-tab="${tab}">${esc(this.t(tab==='advanced'?'settingsBehavior':tab))}</button>`).join('')}</nav>`;}
  _content(){if(this._tab==='groups')return this._groups();if(this._tab==='advanced')return this._advanced();if(this._tab==='diagnostics')return this._diagnostics();return this._overview();}
  _mediaSelect(label='media_player'){const players=Object.keys(this._hass.states).filter(id=>id.startsWith('media_player.'));if(this._draft.media_player&&!players.includes(this._draft.media_player))players.push(this._draft.media_player);return `<label class="field">${esc(this.t(label))}<select data-path="media_player"><option value="" ${!this._draft.media_player?'selected':''}>${esc(this.t('choosePlayer'))}</option>${players.map(id=>`<option value="${esc(id)}" ${id===this._draft.media_player?'selected':''}>${esc(this._hass.states[id]?.attributes.friendly_name||id)}</option>`).join('')}</select></label>`;}
  _lightPicker(group,inlineSettings=false){
    const selected=group?group.lights:this._draft.lights;
    const lights=Object.entries(this._hass.states).filter(([id,s])=>id.startsWith('light.')&&s.attributes.supported_color_modes?.some(m=>['rgb','rgbw','rgbww','hs','xy'].includes(m)));
    for(const id of selected)if(!lights.some(([l])=>l===id))lights.push([id,{attributes:{friendly_name:id}}]);
    const claimed=new Set(this._data.entries.flatMap(e=>e.entry_id===this._entry?[]:this._allSelected(e.settings)));
    this._draft.groups.filter(g=>g.id!==group?.id).forEach(g=>g.lights.forEach(l=>claimed.add(l)));
    return `<div class="light-picker">${lights.map(([id,s])=>`<div class="light-choice"><label><input type="checkbox" ${group?'data-light':'data-solo-light'}="${esc(id)}" ${selected.includes(id)?'checked':''} ${claimed.has(id)?'disabled':''}><span class="light-label">${esc(s.attributes.friendly_name||id)}${claimed.has(id)?`<small>${esc(this.t('claimed'))}</small>`:''}</span></label>${inlineSettings&&selected.includes(id)?`<button class="small" data-solo-settings="${esc(id)}" aria-expanded="${this._soloLight===id}" aria-controls="solo-settings">${esc(this.t('configureLight'))}</button>${this._draft.groups.length?`<select data-solo-group="${esc(id)}" aria-label="${esc(this.t('optionalGroups'))}"><option value="">${esc(this.t('withoutGroup'))}</option>${this._draft.groups.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}</select>`:''}`:''}</div>`).join('')||`<p>${esc(this.t('noLights'))}</p>`}</div>`;
  }
  _standalone(){
    const d=this._draft;
    return `<section class="card standalone"><h2>${esc(this.t(d.groups.length?'soloTitle':'yourLights'))}</h2><p class="note">${esc(this.t(d.groups.length?'soloHelp':'standaloneHelp'))}</p>${this._lightPicker(null,true)}${d.lights.includes(this._soloLight)?this._soloSettings():''}</section>`;
  }
  _soloSettings(){
    const light=this._soloLight,g=this._soloScope(light),path=`light_overrides.${light}`,o=this._draft.light_overrides[light]||{};
    const fields=`<div class="fields">${this._overrideFields(o,path,this._profile(g,light),false)}</div>${this._field('allow_software',o.allow_software==null?'inherit':String(o.allow_software),['inherit','true','false'],{path:path+'.allow_software'})}<p class="note">${esc(this.t('rateHelp'))}</p>`;
    return `<div class="solo-settings" id="solo-settings"><div class="toolbar"><h3>${esc(this.t('lightSettings'))}: ${esc(g.name)}</h3><button class="quiet" data-action="close-solo">${esc(this.t('close'))}</button></div><p class="role-question">${esc(this.t('roleQuestion'))}</p><div class="roles standalone-roles">${ROLES.map(role=>`<button class="role-card ${g.role===role?'active':''}" aria-pressed="${g.role===role}" data-solo-role="${role}"><strong>${esc(this.t(role))}</strong><small>${esc(this.t(role+'Help'))}</small></button>`).join('')}</div>${this._field('saturation',o.saturation,'number',{path:path+'.saturation',min:0,max:200,step:5,nullable:true,fallback:this._profile(g,light).saturation,help:this.t('saturationHelp')})}${this._details('soloAdvanced',this.t('fineTuning'),fields)}</div>`;
  }
  _modeCards(){return `<div class="mode-grid">${MODES.map(mode=>`<button class="mode-card ${this._draft.mode===mode?'active':''}" aria-pressed="${this._draft.mode===mode}" data-mode="${mode}"><strong>${esc(this.t(mode))}</strong><p>${esc(this.t(mode+'Help'))}</p></button>`).join('')}</div>`;}
  _overview(){
    const d=this._draft,count=this._allSelected().length,setup=!this.selected.configured;
    if(setup)return `<section class="card setup"><h2>${esc(this.t('setupTitle'))}</h2><p class="intro">${esc(this.t('setupHelp'))}</p>${this._mediaSelect()}<h3>${esc(this.t('chooseLights'))}</h3>${this._lightPicker(null)}<button class="primary" data-action="toggle" ${!d.media_player||!count?'disabled':''}>${esc(this.t('start'))}</button></section>`;
    const isField=d.mode==='color_field';
    const running=this.selected.settings.enabled;
    const hero=`<section class="card hero"><div id="cover"></div><div class="hero-info"><span class="badge" id="status"></span><h2 class="track" id="track"></h2><p id="artist"></p><div class="actions"><button class="primary" data-action="toggle" ${!running&&(!d.media_player||!count)?'disabled':''}>${esc(this.t(running?'stop':'start'))}</button>${running?`<button class="quiet" data-action="reset">${esc(this.t('reset'))}</button>`:''}</div></div></section>`;
    const source=`<section class="card source-card">${this._mediaSelect('sourceTitle')}<div><p class="source-heading">${esc(this.t('lightCount'))}</p><div class="count"><strong>${count} ${esc(this.t('selectedLights'))}</strong><button class="quiet" data-tab="groups">${esc(this.t('openLights'))}</button></div></div></section>`;
    const controls=`<section class="card"><h2>${esc(this.t('mode'))}</h2>${this._modeCards()}<div class="fields">${this._global('brightness','number',{min:5,max:100})}${this._global('saturation','number',{min:0,max:200,step:5,help:this.t('saturationHelp')})}${this._global('intensity','number',{min:0,max:100,help:this.t(isField?'fieldMotionHelp':'motionHelp')})}${isField?this._global('field_contrast','number',{min:0,max:400,step:5,help:this.t('fieldContrastHelp')}):''}${this._global('speed','number',{min:4,max:120,unit:this.t('seconds'),label:this.t(isField?'fieldSpeed':'speed'),help:this.t(isField?'fieldSpeedHelp':'speedHelp')})}${this._global('track_transition','number',{min:0,max:4,step:.5,unit:this.t('seconds'),help:this.t('fadeHelp')})}</div>${d.mode==='static'?this._global('static_color',['primary','accent']):''}<button class="quiet" data-action="defaults">${esc(this.t('defaults'))}</button></section>`;
    return hero+source+(isField?this._fieldCard()+controls:controls+`<section class="card"><h2>${esc(this.t('preview'))}</h2><div id="palette" class="palette"></div><p class="note">${esc(this.t('basicHelp'))}</p></section>`);
  }
  _fieldCard(){return `<section class="card"><div class="map-heading"><h2>${esc(this.t('fieldTitle'))}</h2><span class="badge" id="field-status"></span></div><p id="field-empty">${esc(this.t('fieldMissing'))}</p><div class="color-map" id="field-map" hidden role="img" aria-label="${esc(this.t('fieldTitle'))}"><canvas id="field-canvas" width="192" height="80"></canvas><div class="field-probes" id="field-probes"></div></div><div class="field-legend" id="field-legend"></div></section>`;}
  _stopFieldPreview(){cancelAnimationFrame(this._fieldFrameID);this._fieldFrameID=null;}
  _paintField(canvas,field,elapsed){
    const context=canvas.getContext('2d'),width=canvas.width,height=canvas.height,contrast=this._draft.field_contrast,saturation=this._draft.saturation/100,key=JSON.stringify([field,contrast,saturation]);
    if(this._fieldTextureKey!==key){
      this._fieldTextureKey=key;this._fieldTexture=context.createImageData(width,height);
      const center=field.center||[0,1,2].map(c=>field.labs.reduce((sum,lab)=>sum+lab[c],0)/field.labs.length),gain=contrast/100;
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const lab=sampleField(field,x/(width-1),y/(height-1));
        for(const c of [1,2])lab[c]=(center[c]+gain*(lab[c]-center[c]))*saturation;
        this._fieldTexture.data.set([...fieldRGB(lab),255],4*(y*width+x));
      }
    }
    const amount=Math.sqrt(this._draft.intensity/100);if(!amount)elapsed=0;
    const signature=JSON.stringify([key,elapsed,this._draft.speed,amount]);
    if(canvas.dataset.paint===signature)return;
    canvas.dataset.paint=signature;
    const pixels=context.createImageData(width,height),source=this._fieldTexture.data;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const [u,v]=flowPoint(x/(width-1),y/(height-1),elapsed,this._draft.speed,field.seed,amount),sx=u*(width-1),sy=v*(height-1),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
      const a=4*(iy*width+ix),b=4*(iy*width+Math.min(width-1,ix+1)),c=4*(Math.min(height-1,iy+1)*width+ix),d=4*(Math.min(height-1,iy+1)*width+Math.min(width-1,ix+1)),out=4*(y*width+x);
      for(let channel=0;channel<3;channel++)pixels.data[out+channel]=(1-fy)*((1-fx)*source[a+channel]+fx*source[b+channel])+fy*((1-fx)*source[c+channel]+fx*source[d+channel]);
      pixels.data[out+3]=255;
    }
    context.putImageData(pixels,0,0);
  }
  _physicalLights(selected){
    const leaves=new Set(),seen=new Set();
    const visit=light=>{if(seen.has(light))return;seen.add(light);const members=this._hass.states[light]?.attributes.entity_id,children=Array.isArray(members)?members.filter(x=>typeof x==='string'&&x.startsWith('light.')):[];if(children.length)children.forEach(visit);else leaves.add(light);};
    selected.forEach(visit);return [...leaves].sort();
  }
  _physicalScope(group){
    const lights=[],overrides={};for(const selected of group.lights){const members=this._physicalLights([selected]);lights.push(...members);if(group.light_overrides[selected])members.forEach(light=>overrides[light]=group.light_overrides[selected]);}
    return {...group,lights,light_overrides:overrides};
  }
  _fieldProbes(){
    const probes=[],groups=[...this._draft.lights.map(l=>this._soloScope(l)),...[...this._draft.groups].sort((a,b)=>a.order-b.order||b.priority-a.priority||(a.id<b.id?-1:a.id>b.id?1:0))];
    groups.map(g=>this._physicalScope(g)).forEach((g,gi)=>{if(!g.enabled||!g.modes.includes('color_field'))return;g.lights.forEach((light,li)=>{
      if(g.control==='synchronous'&&li)return;
      let phase=g.participate?gi*.61803398875:0;
      if(g.control==='independent')phase+=li*.61803398875;
      if(g.control==='distributed')phase+=li/Math.max(1,g.lights.length);
      probes.push({group:g,light,phase,name:this._draft.lights.includes(light)?g.name:g.control==='synchronous'?`${g.name} · ${g.lights.length}`:this._hass.states[light]?.attributes.friendly_name||light});
    });});
    return probes;
  }
  _syncFieldPreview(){
    if(!this.isConnected){this._stopFieldPreview();return;}
    const map=this.shadowRoot.getElementById('field-map');if(!map){this._stopFieldPreview();return;}
    const field=this.selected.palette?.field,valid=field&&field.width>0&&field.height>0&&field.labs?.length===field.width*field.height;
    map.hidden=!valid;this.shadowRoot.getElementById('field-empty').hidden=!!valid;
    if(!valid){this._stopFieldPreview();return;}
    const key=JSON.stringify(field);
    if(this._fieldKey!==key){this._fieldKey=key;this._previewOrigin=performance.now();}
    const canvas=this.shadowRoot.getElementById('field-canvas');
    const allProbes=this._fieldProbes(),probes=allProbes.slice(0,12),signature=JSON.stringify(probes.map(p=>[p.group.id,p.light,p.phase,p.name]));
    if(map.dataset.probes!==signature){
      map.dataset.probes=signature;
      this.shadowRoot.getElementById('field-probes').innerHTML=probes.map((p,i)=>`<span class="field-probe" data-probe="${i}" title="${esc(p.name)}">${i+1}</span>`).join('');
      this.shadowRoot.getElementById('field-legend').innerHTML=probes.map((p,i)=>`<span><b>${i+1}</b><span class="legend-name">${esc(p.name)}</span></span>`).join('')+(allProbes.length>12?`<span>+ ${allProbes.length-12}</span>`:'');
    }
    if(this._motionSnapshot!==this.selected.motion){this._motionSnapshot=this.selected.motion;this._motionReceived=performance.now();}
    let lastPaint=-Infinity;
    const draw=(now,force=false)=>{
      const s=this.selected,motion=s.motion,active=s.settings.enabled&&s.settings.mode==='color_field';
      const elapsed=active&&motion?motion.elapsed+(motion.running?(now-this._motionReceived)/1000:0):(now-this._previewOrigin)/1000;
      if(force||now-lastPaint>=200){this._paintField(canvas,field,elapsed);lastPaint=now;}
      this._setText('field-status',this.t(this._draft.intensity===0?'static':active?(motion?.running||s.status==='syncing'?'fieldActive':s.status==='paused'?'fieldPaused':s.status):'fieldPreview'));
      probes.forEach((p,i)=>{
        const depth=Math.sqrt(this._draft.intensity/100*this._profile(p.group,p.light).intensity/100),[x,y]=fieldPosition(elapsed,this._draft.speed,p.phase,field.seed,depth),el=this.shadowRoot.querySelector(`[data-probe="${i}"]`);
        if(el){el.style.left=`${100*x}%`;el.style.top=`${100*y}%`;el.dataset.x=String(x);el.dataset.y=String(y);}
      });
    };
    // Fresh pushes use a fresh clock/probe list without starting another loop.
    this._drawFieldFrame=draw;draw(performance.now(),true);
    if(!this._fieldFrameID&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      let last=0;const tick=now=>{if(!this.isConnected||!map.isConnected){this._fieldFrameID=null;return;}if(now-last>=33){this._drawFieldFrame(now);last=now;}this._fieldFrameID=requestAnimationFrame(tick);};
      this._fieldFrameID=requestAnimationFrame(tick);
    }
  }
  _groups(){
    const groups=this._draft.groups,g=this.group;
    const toolbar=this._standalone()+(groups.length?`<p class="intro">${esc(this.t('lightsIntro'))}</p><div class="toolbar"><h2>${esc(this.t('groupsTitle'))}</h2><button data-action="new-group">+ ${esc(this.t('newGroup'))}</button></div>`:`<section class="card optional-groups"><div><h3>${esc(this.t('groupsOptional'))}</h3><p>${esc(this.t('groupsOptionalHelp'))}</p></div><button data-action="new-group">+ ${esc(this.t('newGroup'))}</button></section>`);
    if(!g)return toolbar;
    const i=groups.indexOf(g),base=`groups.${i}`,p=this._profile(g),f=(k,type,opts={})=>this._field(k,g[k],type,{...opts,path:`${base}.${k}`});
    const sidebar=groups.length>1?`<aside class="group-list">${groups.map(x=>`<button class="group-tile ${x.id===g.id?'active':''}" data-group="${esc(x.id)}"><strong>${esc(x.name)}</strong><small>${x.lights.length} · ${esc(this.t(x.role))}</small></button>`).join('')}</aside>`:'';
    const chosen=g.lights.includes(this._overrideLight)?this._overrideLight:'',overridePath=chosen?`${base}.light_overrides.${chosen}`:`${base}.overrides`,o=chosen?g.light_overrides[chosen]||{}:g.overrides;
    const extra=`<label class="field">${esc(this.t('target'))}<select data-action="override-target"><option value="">${esc(this.t('groupProfile'))}</option>${g.lights.map(l=>`<option value="${esc(l)}" ${l===chosen?'selected':''}>${esc(this._hass.states[l]?.attributes.friendly_name||l)}</option>`).join('')}</select></label><div class="fields">${this._overrideFields(o,overridePath,this._profile(g,chosen),!!chosen)}</div>${this._field('allow_software',o.allow_software==null?'inherit':String(o.allow_software),['inherit','true','false'],{path:`${overridePath}.allow_software`})}<p class="note">${esc(this.t('rateHelp'))}</p>${f('priority','number',{min:-100,max:100,unit:''})}${f('participate','boolean')}<h3>${esc(this.t('includedModes'))}</h3><div class="actions">${MODES.map(m=>`<label class="check"><input type="checkbox" data-include="${m}" ${g.modes.includes(m)?'checked':''}>${esc(this.t(m))}</label>`).join('')}</div>${f('static_color',['inherit','primary','accent'])}`;
    return toolbar+`<div class="${sidebar?'lights-layout':''}">${sidebar}<div><section class="card">${f('name','text',{label:this.t('groupName')})}<p class="note">${esc(this.t('groupHelp'))}</p><h3>${esc(this.t('groupMembers'))}</h3><p class="note">${esc(this.t('groupMembersHelp'))}</p>${this._lightPicker(g)}<h3>${esc(this.t('role'))}</h3><p class="note">${esc(this.t('roleHelp'))}</p><div class="roles">${ROLES.map(role=>`<button class="role-card ${role===g.role?'active':''}" data-role="${role}"><strong>${esc(this.t(role))}</strong><small>${esc(this.t(role+'Help'))}</small></button>`).join('')}</div>${this._field('saturation',g.overrides.saturation,'number',{path:`${base}.overrides.saturation`,min:0,max:200,step:5,nullable:true,fallback:p.saturation,help:this.t('saturationHelp')})}${f('control',CONTROLS,{help:this.t((this._draft.mode==='color_field'?'field_':'')+g.control+'Help'),labels:this._draft.mode==='color_field'?Object.fromEntries(CONTROLS.map(c=>[c,this.t('field_'+c)])):undefined})}${f('enabled','boolean',{label:this.t('groupEnabled')})}${g.lights.length>1?`<h3>${esc(this.t('lightOrder'))}</h3>`:''}${g.lights.map((l,n)=>`<div class="row light-row"><span class="grow">${esc(this._hass.states[l]?.attributes.friendly_name||l)}</span><button class="small" data-light-up="${n}" ${n===0?'disabled':''} aria-label="↑">↑</button><button class="small" data-light-down="${n}" ${n===g.lights.length-1?'disabled':''} aria-label="↓">↓</button><button class="small" data-light-settings="${esc(l)}">${esc(this.t('configureLight'))}</button></div>`).join('')}${this._details('groupAdvanced',this.t('groupAdvanced'),extra)}<div class="actions more"><button data-action="group-up" ${i===0?'disabled':''}>↑ ${esc(this.t('order'))}</button><button data-action="group-down" ${i===groups.length-1?'disabled':''}>↓</button><button data-action="delete-group">${esc(this.t('ungroup'))}</button><p class="note">${esc(this.t('ungroupHelp'))}</p></div></section></div></div>`;
  }
  _overrideFields(o,path,p,includeSaturation=false){
    const entries=[['strategy',STRATEGIES],['software_hz','number',1,this._draft.high_rate_confirmed?10:5,.5,'/s'],...(includeSaturation?[['saturation','number',0,200,5,'%']]:[]),['max_saturation','number',0,100,1,'%'],['intensity','number',0,100,1,'%'],['min_brightness','number',1,100,1,'%'],['max_brightness','number',1,100,1,'%'],['breathing','number',0,10,1,'%'],['min_delta','number',.001,.1,.001,''],['hardware_interval','number',1,4,.5,this.t('seconds')],['hardware_max_duration','number',0,4,.5,this.t('seconds')]];
    return entries.map(([k,type,min,max,step,unit])=>this._field(k,o[k],type,{path:`${path}.${k}`,nullable:true,fallback:p[k],min,max,step,unit,label:k==='intensity'?this.t('groupIntensity'):this.t(k)})).join('');
  }
  _advanced(){return `<section class="card"><h2>${esc(this.t('advanced'))}</h2><p>${esc(this.t('advancedHelp'))}</p>${this._global('strategy',STRATEGIES,{help:this.t('transitionHelp')})}${this._global('allow_software','boolean')}${this._global('high_rate_confirmed','boolean',{toggle:true})}<p class="note">${esc(this.t('highRateHelp'))}</p>${this._details('software',this.t('software'),`<p>${esc(this.t('rateHelp'))}</p>${this._global('software_hz','number',{min:1,max:this._draft.high_rate_confirmed?10:5,step:.5,unit:'/s'})}`)}${this._details('behavior',this.t('behavior'),`${this._global('turn_on_lights','boolean')}${this._global('restore_on_stop','boolean')}<div class="fields">${this._global('stop_delay','number',{min:0,max:30,unit:this.t('seconds')})}${this._global('pause_dim','number',{min:0,max:80})}${this._global('breathing','number',{min:0,max:10})}</div>`)}${this._details('technical',this.t('technicalLimits'),`<div class="fields">${this._global('palette_size','number',{min:2,max:6,unit:''})}${this._global('min_delta','number',{min:.001,max:.1,step:.001,unit:''})}${this._global('hardware_interval','number',{min:1,max:4,step:.5,unit:this.t('seconds')})}${this._global('hardware_max_duration','number',{min:0,max:4,step:.5,unit:this.t('seconds')})}${this._global('max_saturation','number',{min:0,max:100})}${this._global('group_intensity','number',{min:0,max:100})}${this._global('min_brightness','number',{min:1,max:100})}${this._global('max_brightness','number',{min:1,max:100})}</div><code>${esc(this.t('entry'))}: ${esc(this._entry)}</code>`)}<button class="quiet" data-action="defaults">${esc(this.t('defaults'))}</button><p class="note">${esc(this.t('defaultsHelp'))}</p></section>`;}
  _diagnosticTable(lights){return `<div class="scroll"><table><thead><tr><th>${esc(this.t('target'))}</th><th>${esc(this.t('actual'))}</th><th>${esc(this.t('reason'))}</th><th>${esc(this.t('commands'))}</th></tr></thead><tbody>${lights.map(l=>`<tr data-diagnostic="${esc(l.entity_id)}"><td class="diagnostic-name">${esc(this._hass.states[l.entity_id]?.attributes.friendly_name||l.entity_id)}</td><td class="diagnostic-strategy"><span class="diagnostic-technical" data-live="strategy"></span><span class="diagnostic-short" data-live="short-strategy"></span></td><td class="diagnostic-reason"><span class="diagnostic-technical" data-live="reason"></span><span class="diagnostic-short" data-live="short-reason"></span></td><td class="diagnostic-commands" data-unit="${esc(this.t('commandsUnit'))}" data-live="commands"></td></tr>`).join('')}</tbody></table></div>`;}
  _diagnostics(){return `<div class="diagnostics"><section class="card"><h2><span class="desktop-copy">${esc(this.t('diagnostics'))}</span><span class="mobile-copy">${esc(this.t('deviceStatus'))}</span></h2><span class="badge" id="status"></span><p><span class="desktop-copy">${esc(this.t('transitionHelp'))}</span><span class="mobile-copy">${esc(this.t('deviceStatusHelp'))}</span></p></section>${this.selected.lights_status?.length?`<section class="card"><h2>${esc(this.t('soloTitle'))}</h2>${this._diagnosticTable(this.selected.lights_status)}</section>`:''}${this.selected.groups.map(g=>`<section class="card"><h2>${esc(g.name)}</h2><p>${esc(this.t(g.role))} · <span data-group-status="${esc(g.id)}">${esc(this.t(g.status))}</span></p>${g.effective_profile?`<p class="note">${esc(this.t('max_saturation'))}: ${g.effective_profile.max_saturation}% · ${esc(this.t('brightness'))}: ${g.effective_profile.min_brightness}–${g.effective_profile.max_brightness}%</p>`:''}${this._diagnosticTable(g.lights_status)}${this._details('data-'+g.id,this.t('details'),`<pre><code>${esc(JSON.stringify(g,null,2))}</code></pre>`)}</section>`).join('')}<section class="card" id="messages"></section></div>`;}
  _setText(id,text){const el=this.shadowRoot.getElementById(id);if(el&&el.textContent!==text)el.textContent=text;}
  _palettePreview(){
    const palette=this.shadowRoot.getElementById('palette'),colors=this.selected?.palette?.colors||[],gain=(this._draft?.saturation??100)/100,signature=JSON.stringify([colors,gain]);
    if(!palette||palette.dataset.signature===signature)return;
    palette.dataset.signature=signature;
    palette.innerHTML=colors.map(c=>{
      const [l,a,b]=rgbLab(c.rgb),rgb=gain===1?c.rgb:fieldRGB([l,a*gain,b*gain]);
      return `<div class="swatch" style="background:rgb(${rgb.map(v=>Math.max(0,Math.min(255,Number(v)))).join(',')});flex:${Math.max(.15,c.weight)}" title="${rgb.map(v=>Number(v).toString(16).padStart(2,'0')).join('').toUpperCase()}"></div>`;
    }).join('')||`<p>${esc(this.t('noPalette'))}</p>`;
  }
  _live(){
    const s=this.selected,version=this._data.version||s?.version||'',badge=this.shadowRoot.getElementById('version');
    if(badge){badge.hidden=!version;this._setText('version',version);badge.setAttribute('aria-label',this.t('version')+' '+version);}
    if(!s)return;
    const entries=this.shadowRoot.getElementById('entry-picker'),entrySignature=JSON.stringify([this._entry,this._data.entries.map(e=>[e.entry_id,e.title])]);
    if(entries&&entries.dataset.signature!==entrySignature&&(!entries.querySelector('select')||this.shadowRoot.activeElement!==entries.querySelector('select'))){entries.dataset.signature=entrySignature;entries.innerHTML=this._data.entries.length>1?`<select data-action="entry" aria-label="${esc(this.t('entry'))}">${this._data.entries.map(e=>`<option value="${esc(e.entry_id)}" ${e.entry_id===this._entry?'selected':''}>${esc(e.title)}</option>`).join('')}</select>`:'';}

    this._setText('status',this.t(s.status==='syncing'&&this._tab==='diagnostics'?'statusSync':s.status));this._setText('track',s.media?.title||this.t('noTrack'));this._setText('artist',s.media?.artist||s.settings.media_player||'');
    const cover=this.shadowRoot.getElementById('cover'),picture=s.media?.picture||'';
    if(cover&&cover.dataset.picture!==picture){cover.dataset.picture=picture;cover.innerHTML=picture?`<img class="cover-glow" alt="" aria-hidden="true" src="${esc(picture)}"><img class="cover-glow near" alt="" aria-hidden="true" src="${esc(picture)}"><img class="cover" alt="" src="${esc(picture)}">`:'<div class="cover empty-cover" aria-hidden="true">♫</div>';}
    this._palettePreview();
    for(const g of s.groups){const label=this.shadowRoot.querySelector(`[data-group-status="${g.id}"]`);if(label)label.textContent=this.t(g.status);}
    for(const l of [...(s.lights_status||[]),...s.groups.flatMap(g=>g.lights_status)]){const row=this.shadowRoot.querySelector(`[data-diagnostic="${l.entity_id}"]`);if(row){
      const reason=l.excluded||l.reason||'waiting',reasonText=this.t(reason);
      row.dataset.problem=String(!!l.excluded||l.available===false);
      row.querySelector('[data-live=strategy]').textContent=this.t(l.strategy||'waiting');row.querySelector('[data-live=reason]').textContent=reasonText;
      row.querySelector('[data-live=short-strategy]').textContent=this.t(reason==='light_unavailable'?'light_unavailable_short':l.excluded?reason:({hardware:'lampFade',software:'softwareFade',disabled:'directColor'}[l.strategy]||l.strategy||'waiting'));
      row.querySelector('[data-live=short-reason]').textContent=l.excluded?'':reason==='hardware_advertised_not_verified'?this.t('fadeAdvertised'):reasonText;
      row.querySelector('[data-live=commands]').textContent=String(l.commands||0);
    }}
    const messages=this.shadowRoot.getElementById('messages');if(messages)messages.textContent=s.messages.map(m=>this.t(m.code)).join(' · ')||'—';
    const restoration=this.shadowRoot.getElementById('restoration-status'),pending=(s.restoration||[]).filter(x=>x.pending),expired=(s.restoration||[]).filter(x=>!x.pending);
    if(restoration){const describe=items=>items.length+' · '+items.slice(0,3).map(x=>{const name=String(this._hass.states[x.entity_id]?.attributes.friendly_name||x.entity_id);return name.length>80?name.slice(0,80)+'…':name;}).join(', ')+(items.length>3?' (+'+(items.length-3)+')':'');restoration.hidden=!pending.length&&!expired.length;this._setText('restoration-status',[pending.length?this.t('restorePending')+' '+describe(pending):'',expired.length?this.t('restoreExpired')+' '+describe(expired):''].filter(Boolean).join(' · '));}
    this._syncFieldPreview();this._renderNotice();this._updateStart();
  }
  _updateStart(){const el=this.shadowRoot.querySelector('[data-action=toggle]');if(el){const running=!!this.selected?.settings.enabled;el.disabled=this._saving||(!running&&(!this._draft.media_player||!this._allSelected().length));el.textContent=this.t(running?'stop':'start');}}
  _rangeFill(input){input.style.setProperty('--range-percent',`${100*(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))}%`);}
  _syncRange(input){
    const key=input.dataset.path.split('.').at(-1),value=Number(input.value),formatted=this._controlValue(key,value,input.dataset.unit),exact=this._hasLevels(key)?this._controlExact(value):formatted,output=this.shadowRoot.querySelector(`[data-output="${input.dataset.path}"]`);
    if(output){output.textContent=formatted;output.title=exact;}
    input.title=exact;if(this._hasLevels(key))input.setAttribute('aria-valuetext',formatted+' · '+exact);
    this._rangeFill(input);
  }
  _setHighRate(enabled){
    const d=this._draft,profiles=[d,...Object.values(d.light_overrides),...d.groups.flatMap(g=>[g.overrides,...Object.values(g.light_overrides)])];
    for(const p of profiles){if(p!==d)p.high_rate_confirmed=false;if(!enabled&&p.software_hz>5)p.software_hz=5;}
  }
  _footer(){const el=this.shadowRoot.getElementById('footer');if(el)el.innerHTML=this._dirty&&!(this._tab==='overview'&&!this.selected?.configured)?`<div class="footer"><span>${esc(this.t('unsaved'))}</span><button data-action="discard">${esc(this.t('discard'))}</button><button class="primary" data-action="save" ${this._saving?'disabled':''}>${esc(this.t('save'))}</button></div>`:'';}
  _change(event,typing=false){
    const el=event.target,path=el.dataset.path;
    if(path){let value=el.type==='checkbox'?el.checked:el.type==='range'?(el.value===''?null:Number(el.value)):el.value;if(path.endsWith('.allow_software'))value=value==='true'?true:value==='false'?false:null;if(value===''&&path.endsWith('.strategy'))value=null;this._setPath(path,value);if(el.type==='range')this._syncRange(el);if(path==='high_rate_confirmed'){this._setHighRate(value);this._mark();this._render();return;}this._mark();if(['field_contrast','saturation','intensity','speed'].includes(path))this._syncFieldPreview();if(path==='saturation')this._palettePreview();if(!typing&&path.endsWith('.control'))this._render();return;}
    if(typing)return;
    if(el.dataset.custom){const path=el.dataset.custom,input=this.shadowRoot.querySelector(`input[type=range][data-path="${path}"]`);input.disabled=!el.checked;this._setPath(path,el.checked?Number(input.value):null);if(!el.checked)input.value=this._inherited(path)??input.dataset.fallback;this._syncRange(input);this._mark();return;}
    if(el.dataset.action==='entry'){if(this._dirty){el.value=this._entry;this._error=this.t('unsavedSwitch');this._renderNotice();return;}this._entry=el.value;this._loadDraft();this._render();return;}
    if(el.dataset.action==='override-target'){this._overrideLight=el.value;this._render();return;}
    if(el.dataset.soloLight){const light=el.dataset.soloLight;if(el.checked&&!this._draft.lights.includes(light))this._draft.lights.push(light);else if(!el.checked)this._dropSolo(light);this._mark();if(this._tab==='groups')this._render();return;}
    if(el.dataset.soloGroup&&el.value){const g=this._draft.groups.find(g=>g.id===el.value);if(g)this._joinGroup(el.dataset.soloGroup,g);this._mark();this._render();return;}
    if(el.dataset.light&&this.group){if(el.checked)this._joinGroup(el.dataset.light,this.group);else this._releaseLight(this.group,el.dataset.light);this._mark();this._render();return;}
    if(el.dataset.include&&this.group){this.group.modes=el.checked?[...this.group.modes,el.dataset.include]:this.group.modes.filter(m=>m!==el.dataset.include);this._mark();}
  }
  _click(event){
    const el=event.target.closest('button');if(!el||el.disabled)return;
    if(el.dataset.tab){this._tab=el.dataset.tab;if(['advanced','diagnostics'].includes(this._tab))this._settingsTab=this._tab;this._render();return;}
    if(el.dataset.group){this._group=el.dataset.group;this._overrideLight='';this._render();return;}
    if(el.dataset.mode){this._draft.mode=el.dataset.mode;this._mark();this._render();return;}
    if(el.dataset.role&&this.group){this.group.role=el.dataset.role;for(const key of ['max_saturation','intensity','min_brightness'])this.group.overrides[key]=null;this._mark();this._render();return;}
    if(el.dataset.soloSettings){this._soloLight=el.dataset.soloSettings;this._render();return;}
    if(el.dataset.soloRole&&this._soloLight){this._draft.light_roles[this._soloLight]=el.dataset.soloRole;const o=this._draft.light_overrides[this._soloLight];if(o)for(const key of ['max_saturation','intensity','min_brightness'])o[key]=null;this._mark();this._render();return;}
    if(el.dataset.action==='close-solo'){this._soloLight='';this._render();return;}
    if(el.dataset.lightSettings){this._overrideLight=el.dataset.lightSettings;this._sections.set(`${this._tab}:groupAdvanced`,true);this._render();return;}
    const action=el.dataset.action;
    if(action==='save'){this._save();return;}
    if(action==='discard'){this._dirty=false;this._error='';this._pendingExternal=false;this._loadDraft();this._render();return;}
    if(action==='toggle'){if(this.selected?.settings.enabled)this._stop();else{this._draft.enabled=true;this._mark();this._save();}return;}
    if(action==='retry-connection'){this._error='';this._renderNotice();this._connect();return;}
    if(action==='reset'){this._reset();return;}
    if(action==='defaults'){Object.assign(this._draft,{mode:'color_field',speed:12,intensity:75,field_contrast:140,saturation:100,track_transition:2,hardware_max_duration:4,hardware_interval:2,min_delta:.002});this._mark();this._render();return;}
    const g=this.group;
    if(action==='new-group'){const group=this._newGroup(this.t('newGroup'));this._draft.groups.push(group);this._group=group.id;this._overrideLight='';}
    else if(action==='delete-group'&&g){for(const light of [...g.lights])this._releaseLight(g,light);this._draft.groups=this._draft.groups.filter(x=>x.id!==g.id);this._group=this._draft.groups[0]?.id;}
    else if((action==='group-up'||action==='group-down')&&g){const i=this._draft.groups.indexOf(g),j=i+(action==='group-up'?-1:1);[this._draft.groups[i],this._draft.groups[j]]=[this._draft.groups[j],this._draft.groups[i]];}
    else if(g&&(el.dataset.lightUp!==undefined||el.dataset.lightDown!==undefined)){const up=el.dataset.lightUp!==undefined,i=Number(up?el.dataset.lightUp:el.dataset.lightDown),j=i+(up?-1:1);[g.lights[i],g.lights[j]]=[g.lights[j],g.lights[i]];}
    else return;
    this._draft.groups.forEach((x,i)=>x.order=i);this._mark();this._render();
  }
  async _stop(){
    if(this._saving)return;const epoch=this._epoch,entry=this._entry,base=clone(this.selected.settings),revision=this.selected.revision;this._saving=true;this._error='';this._updateStart();
    try{const result=await this._hass.callWS({type:'chromatic/set_enabled',entry_id:entry,enabled:false});if(epoch!==this._epoch||entry!==this._entry)return;const i=this._data.entries.findIndex(e=>e.entry_id===entry);this._data.entries[i]=result;const canRebase=this._revision===revision&&JSON.stringify({...base,enabled:false})===JSON.stringify(result.settings);if(this._dirty){this._draft.enabled=false;if(canRebase)this._revision=result.revision;}else this._loadDraft();}
    catch(err){if(epoch===this._epoch&&entry===this._entry)this._error=err.message||String(err);}
    finally{this._saving=false;if(epoch===this._epoch)this._render();}
  }
  async _reset(){try{await this._hass.callService('chromatic','reset_session',{entry_id:this._entry});this._showNotice(this.t('saved'));}catch(err){this._error=err.message||String(err);this._renderNotice();}}
  async _save(){
    if(this._saving)return;const epoch=this._epoch,entry=this._entry,draft=clone(this._draft);this._saving=true;this._error='';this._footer();this.shadowRoot.querySelectorAll('input,select,button').forEach(el=>el.disabled=true);
    try{const result=await this._hass.callWS({type:'chromatic/save',entry_id:entry,revision:this._revision,settings:draft});if(epoch!==this._epoch||entry!==this._entry)return;const i=this._data.entries.findIndex(e=>e.entry_id===entry);this._data.entries[i]=result;this._dirty=false;this._loadDraft();this._pendingExternal=false;this._showNotice(this.t('saved'));}
    catch(err){if(epoch===this._epoch&&entry===this._entry)this._error=String(err.message||err).includes('stale_revision')?this.t('stale_revision'):err.message||String(err);}
    finally{this._saving=false;if(epoch===this._epoch)this._render();}
  }
}
const panelTag=new URL(import.meta.url).searchParams.get('component')||'chromatic-panel';
if(!customElements.get(panelTag))customElements.define(panelTag,ChromaticPanel);
