const LANG_KEY = 'og_lang';

/** Normalize browser locales to a supported code. */
export function normalizeLang(raw) {
    if (!raw) return 'en';
    const lower = String(raw).toLowerCase();
    if (lower === 'ru' || lower.startsWith('ru-') || lower.startsWith('ru_')) return 'ru';
    return 'en';
}

/** Detect browser locale on first visit. */
export function initLocale() {
    if (typeof localStorage === 'undefined') return 'en';
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) {
        const normalized = normalizeLang(stored);
        if (normalized !== stored) localStorage.setItem(LANG_KEY, normalized);
        return normalized;
    }
    const detected = typeof navigator !== 'undefined' ? navigator.language : 'en';
    const lang = normalizeLang(detected);
    localStorage.setItem(LANG_KEY, lang);
    return lang;
}

export function getLang() {
    if (typeof localStorage === 'undefined') return 'en';
    const stored = localStorage.getItem(LANG_KEY);
    if (!stored) return initLocale();
    const normalized = normalizeLang(stored);
    if (normalized !== stored) localStorage.setItem(LANG_KEY, normalized);
    return normalized;
}

export function setLang(lang, { reload = true } = {}) {
    const normalized = normalizeLang(lang);
    localStorage.setItem(LANG_KEY, normalized);
    if (reload && typeof location !== 'undefined') {
        location.reload();
    } else if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('og_lang_change', { detail: normalized }));
    }
}

function dictFor(lang) {
    const key = normalizeLang(lang);
    if (key === 'ru') return translations.ru;
    return translations.en;
}

const translations = {
    en: {
        // Navigation
        'nav.image': 'Image',
        'nav.video': 'Video',
        'nav.lipsync': 'Lip Sync',
        'nav.cinema': 'Cinema Studio',
        'nav.workflows': 'Workflows',
        'nav.agents': 'Agents',
        'nav.mcpcli': 'MCP & CLI',
        'nav.settings': 'Settings',

        // Sidebar
        'sidebar.canvas': 'Canvas',
        'sidebar.video': 'Video',
        'sidebar.library': 'Library',
        'sidebar.settings': 'Settings',

        // Common
        'common.generate': 'Generate ✨',
        'common.generating': 'Generating...',
        'common.download': '↓ Download',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.history': 'History',
        'common.advanced': 'Advanced',
        'common.less': 'Less',
        'common.tools': 'Tools',
        'common.copy': 'Copy',
        'common.copied': 'Copied!',
        'common.searchModels': 'Search models...',
        'common.retry': 'Retry',
        'common.loading': 'Loading...',
        'common.noResults': 'No local models match',
        'common.regenerate': '↻ Regenerate',
        'common.newItem': '+ New',
        'common.useInGenerator': 'Use in Generator',
        'common.randomize': 'Randomize',

        // Settings Modal
        'settings.title': 'Settings',
        'settings.apiKey': 'API Key',
        'settings.localModels': 'Local Models',
        'settings.muapiKeyLabel': 'Muapi API Key',
        'settings.keyPlaceholder': 'Enter your Muapi API key...',
        'settings.keyNote': 'Your API key is stored locally and never sent anywhere except api.muapi.ai.',
        'settings.invalidKey': 'Please enter a valid API key.',

        // Auth Modal
        'auth.title': 'Muapi API Key Required',
        'auth.subtitle': 'Create a Muapi access key, then paste the key value here to start creating high-aesthetic images.',
        'auth.keyLabel': 'Muapi Access Key',
        'auth.keyPlaceholder': 'Paste your access key value...',
        'auth.keyNote': 'Do not enter the key name or label; paste the generated key value from Muapi.',
        'auth.initBtn': 'Initialize Studio',
        'auth.createKey': 'Create or copy a Muapi access key →',

        // Image Studio
        'image.title': 'Image Studio',
        'image.subtitle': 'Transform images with AI — upscale, stylize, animate and more',
        'image.placeholder': 'Describe the image you want to create',
        'image.placeholderTransform': 'Describe how to transform this image (optional)',
        'image.generateTooltip': 'Generate AI image from prompt',
        'image.modelTooltip': 'Select AI generation model',
        'image.arTooltip': 'Change aspect ratio',
        'image.qualityTooltip': 'Set output quality',
        'image.advancedTooltip': 'Show advanced options',
        'image.toolsTooltip': 'Quick starters & prompt enhancer',
        'image.local': '⚡ Local',
        'image.api': '☁ API',
        'image.generatingLocally': 'Generating locally...',
        'image.quickTools': 'Quick Tools',
        'image.quickStarters': 'Quick Starters',
        'image.promptEnhancer': 'Prompt Enhancer',
        'image.basePromptPlaceholder': 'Enter base prompt...',
        'image.enhancementTags': 'Enhancement Tags',
        'image.enhancedPrompt': 'Enhanced Prompt',
        'image.enhancedPlaceholder': 'Your enhanced prompt will appear here...',
        'image.advancedOptions': 'Advanced Options',
        'image.stylePreset': 'Style Preset',
        'image.negPromptLabel': 'Negative Prompt',
        'image.negPromptPlaceholder': 'What to exclude from the image (e.g., blurry, distorted, watermark)',
        'image.guidanceScale': 'Guidance Scale',
        'image.steps': 'Steps',
        'image.seed': 'Seed',
        'image.seedPlaceholder': '-1 for random',
        'image.batchCount': 'Batch Count',
        'image.width': 'Width',
        'image.height': 'Height',
        'image.widthPlaceholder': 'Auto',
        'image.heightPlaceholder': 'Auto',
        'image.refStrength': 'Reference Strength',
        'image.refStrengthNote': 'How much to preserve the reference image characteristics',
        'image.lora': 'LoRA Model (Optional)',
        'image.loraPlaceholder': 'e.g., civitai:1642876@1864626',
        'image.loraWeight': 'LoRA Weight:',
        'image.loraNote': 'Enter a LoRA model ID from Civitai (format: civitai:id@version)',

        // Video Studio
        'video.title': 'Video Studio',
        'video.subtitle': 'Animate images into stunning AI videos with motion effects',
        'video.placeholder': 'Describe the video you want to create',
        'video.generateTooltip': 'Generate AI video',
        'video.history': 'History',
        'video.regenerate': '↻ Regenerate',
        'video.download': '↓ Download',
        'video.extend': '↗ Extend',
        'video.new': '+ New',
        'video.videoTools': 'Video Tools',

        // Lip Sync Studio
        'lipsync.title': 'Lip Sync',
        'lipsync.subtitle': 'Animate portraits or sync lips to audio with AI',
        'lipsync.input': 'Input:',
        'lipsync.portraitImage': '🖼 Portrait Image',
        'lipsync.video': '🎬 Video',
        'lipsync.noImage': 'No image',
        'lipsync.noVideo': 'No video',
        'lipsync.noAudio': 'No audio',
        'lipsync.imageReady': '✓ Image ready',
        'lipsync.videoReady': '✓ Video ready',
        'lipsync.promptPlaceholder': 'Optional: describe the talking style or motion...',
        'lipsync.regenerate': '↻ Regenerate',
        'lipsync.download': '↓ Download',
        'lipsync.new': '+ New',
        'lipsync.history': 'History',
        'lipsync.noAudioAlert': 'Please upload an audio file first.',
        'lipsync.noImageAlert': 'Please upload a portrait image first.',
        'lipsync.noVideoAlert': 'Please upload a source video first.',

        // Cinema Studio
        'cinema.tagline': 'Cinema Studio 2.0',
        'cinema.headline': 'What would you shoot<br>with infinite budget?',
        'cinema.placeholder': 'Describe your scene - use @ to add characters & props',
        'cinema.builderTooltip': 'Quick camera builder',
        'cinema.cameraSettings': 'Open camera settings',
        'cinema.generateBtn': 'GENERATE ✨',
        'cinema.shooting': 'SHOOTING...',
        'cinema.history': 'History',
        'cinema.load': 'Load',
        'cinema.regenerate': '↻ Regenerate',
        'cinema.download': '↓ Download',
        'cinema.newShot': '+ New Shot',
        'cinema.cameraBuilder': 'Camera Builder',
        'cinema.camera': 'Camera',
        'cinema.lens': 'Lens',
        'cinema.focal': 'Focal',
        'cinema.aperture': 'Aperture',
        'cinema.preview': 'Preview',
        'cinema.useSetup': 'Use This Setup',
        'cinema.selectSettings': 'Select camera settings to see preview...',
        'cinema.generationFailed': 'Generation Failed: ',

        // Agent Studio
        'agents.title': 'Agent Studio',
        'agents.webOnly': 'Available in the web app at open-generative-ai.com',

        // Workflow Studio
        'workflows.title': 'Workflow Studio',
        'workflows.webOnly': 'Available in the web app at open-generative-ai.com',

        // Local Model Manager
        'localModels.title': 'Local Models',
        'localModels.webOnly': 'Local model inference is only available in the desktop app (Electron build). Use npm run electron:build to build.',
        'localModels.inferenceEngine': 'Inference Engine',
        'localModels.checking': 'Checking...',
        'localModels.installed': 'Installed and ready',
        'localModels.notInstalled': 'Not installed — required for local generation',
        'localModels.installEngine': 'Install Engine',
        'localModels.downloading': 'Downloading...',
        'localModels.extracting': 'Extracting...',
        'localModels.storedIn': 'Stored in',
        'localModels.storedDefault': 'Stored in your app data folder',
        'localModels.checkingStorage': 'Checking storage...',
        'localModels.loading': 'Loading...',
        'localModels.featured': '⚡ Featured',
        'localModels.download': 'Download',
        'localModels.requiredComponents': 'Required components',
        'localModels.ready': 'Ready',
        'localModels.available': 'Available',
        'localModels.offline': 'Unavailable',
        'localModels.starting': 'Starting...',
        'localModels.complete': 'Complete!',
        'localModels.preparing': 'Preparing...',
        'localModels.get': 'Get',
        'localModels.notConfigured': 'Not configured',
        'localModels.notConfiguredNote': 'Not configured (Wan2GP models will appear offline)',
        'localModels.probing': 'Probing...',
        'localModels.errorLoading': 'Error loading models: ',
        'localModels.deleteConfirm': (name) => `Delete "${name}"? You'll need to re-download it to use it again.`,

        // Web shell
        'web.settingsTitle': 'Settings — API key, local models, preferences',
        'web.switchToEn': 'Switch to English',
        'web.switchToRu': 'Переключить на русский',

        // MCP & CLI page
        'mcp.tagline': 'For developers & AI agents',
        'mcp.title': 'MCP & CLI',
        'mcp.subtitle': 'Use Open Generative AI from your terminal, your IDE, or any MCP-compatible assistant. Generate cinematic images, videos, and audio across 100+ models — without leaving your workflow.',
        'mcp.quickStart': 'Quick start',
    },
    ru: {
        // Navigation
        'nav.image': 'Изображение',
        'nav.video': 'Видео',
        'nav.lipsync': 'Синхр. губ',
        'nav.cinema': 'Кино-студия',
        'nav.workflows': 'Workflow',
        'nav.agents': 'Агенты',
        'nav.mcpcli': 'MCP & CLI',
        'nav.settings': 'Настройки',

        // Sidebar
        'sidebar.canvas': 'Холст',
        'sidebar.video': 'Видео',
        'sidebar.library': 'Библиотека',
        'sidebar.settings': 'Настройки',

        // Common
        'common.generate': 'Создать ✨',
        'common.generating': 'Создание...',
        'common.download': '↓ Скачать',
        'common.cancel': 'Отмена',
        'common.save': 'Сохранить',
        'common.history': 'История',
        'common.advanced': 'Дополнительно',
        'common.less': 'Свернуть',
        'common.tools': 'Инструменты',
        'common.copy': 'Копировать',
        'common.copied': 'Скопировано!',
        'common.searchModels': 'Поиск моделей...',
        'common.retry': 'Повторить',
        'common.loading': 'Загрузка...',
        'common.noResults': 'Нет локальных моделей',
        'common.regenerate': '↻ Перегенерировать',
        'common.newItem': '+ Новый',
        'common.useInGenerator': 'Использовать в генераторе',
        'common.randomize': 'Случайно',

        // Settings Modal
        'settings.title': 'Настройки',
        'settings.apiKey': 'API-ключ',
        'settings.localModels': 'Локальные модели',
        'settings.muapiKeyLabel': 'Ключ API Muapi',
        'settings.keyPlaceholder': 'Введите ваш API-ключ Muapi...',
        'settings.keyNote': 'Ваш API-ключ хранится локально и никуда не отправляется, кроме api.muapi.ai.',
        'settings.invalidKey': 'Пожалуйста, введите действительный API-ключ.',

        // Auth Modal
        'auth.title': 'Требуется API-ключ Muapi',
        'auth.subtitle': 'Создайте ключ доступа Muapi, затем вставьте его значение сюда, чтобы начать создавать изображения высокого качества.',
        'auth.keyLabel': 'Ключ доступа Muapi',
        'auth.keyPlaceholder': 'Вставьте значение вашего ключа доступа...',
        'auth.keyNote': 'Не вводите имя или метку ключа; вставьте сгенерированное значение ключа из Muapi.',
        'auth.initBtn': 'Запустить студию',
        'auth.createKey': 'Создать или скопировать ключ доступа Muapi →',

        // Image Studio
        'image.title': 'Студия изображений',
        'image.subtitle': 'Преобразуйте изображения с помощью AI — увеличение, стилизация, анимация и многое другое',
        'image.placeholder': 'Опишите изображение, которое хотите создать',
        'image.placeholderTransform': 'Опишите, как преобразовать это изображение (опционально)',
        'image.generateTooltip': 'Сгенерировать AI-изображение по запросу',
        'image.modelTooltip': 'Выбрать модель генерации AI',
        'image.arTooltip': 'Изменить соотношение сторон',
        'image.qualityTooltip': 'Настроить качество вывода',
        'image.advancedTooltip': 'Показать дополнительные настройки',
        'image.toolsTooltip': 'Быстрые шаблоны и усилитель запроса',
        'image.local': '⚡ Локально',
        'image.api': '☁ API',
        'image.generatingLocally': 'Локальная генерация...',
        'image.quickTools': 'Быстрые инструменты',
        'image.quickStarters': 'Быстрый старт',
        'image.promptEnhancer': 'Усилитель запроса',
        'image.basePromptPlaceholder': 'Введите базовый запрос...',
        'image.enhancementTags': 'Теги улучшения',
        'image.enhancedPrompt': 'Улучшенный запрос',
        'image.enhancedPlaceholder': 'Ваш улучшенный запрос появится здесь...',
        'image.advancedOptions': 'Дополнительные настройки',
        'image.stylePreset': 'Пресет стиля',
        'image.negPromptLabel': 'Негативный запрос',
        'image.negPromptPlaceholder': 'Что исключить из изображения (например: размыто, искажено, водяной знак)',
        'image.guidanceScale': 'Масштаб направления',
        'image.steps': 'Шаги',
        'image.seed': 'Сид',
        'image.seedPlaceholder': '-1 для случайного',
        'image.batchCount': 'Количество в пакете',
        'image.width': 'Ширина',
        'image.height': 'Высота',
        'image.widthPlaceholder': 'Авто',
        'image.heightPlaceholder': 'Авто',
        'image.refStrength': 'Сила референса',
        'image.refStrengthNote': 'Насколько сохранять характеристики референсного изображения',
        'image.lora': 'Модель LoRA (опционально)',
        'image.loraPlaceholder': 'например: civitai:1642876@1864626',
        'image.loraWeight': 'Вес LoRA:',
        'image.loraNote': 'Введите ID модели LoRA с Civitai (формат: civitai:id@version)',

        // Video Studio
        'video.title': 'Студия видео',
        'video.subtitle': 'Анимируйте изображения в впечатляющие AI-видео с эффектами движения',
        'video.placeholder': 'Опишите видео, которое хотите создать',
        'video.generateTooltip': 'Сгенерировать AI-видео',
        'video.history': 'История',
        'video.regenerate': '↻ Перегенерировать',
        'video.download': '↓ Скачать',
        'video.extend': '↗ Продлить',
        'video.new': '+ Новый',
        'video.videoTools': 'Видео-инструменты',

        // Lip Sync Studio
        'lipsync.title': 'Синхронизация губ',
        'lipsync.subtitle': 'Анимируйте портреты или синхронизируйте губы с аудио с помощью AI',
        'lipsync.input': 'Вход:',
        'lipsync.portraitImage': '🖼 Портрет',
        'lipsync.video': '🎬 Видео',
        'lipsync.noImage': 'Нет изображения',
        'lipsync.noVideo': 'Нет видео',
        'lipsync.noAudio': 'Нет аудио',
        'lipsync.imageReady': '✓ Изображение готово',
        'lipsync.videoReady': '✓ Видео готово',
        'lipsync.promptPlaceholder': 'Опционально: опишите стиль речи или движения...',
        'lipsync.regenerate': '↻ Перегенерировать',
        'lipsync.download': '↓ Скачать',
        'lipsync.new': '+ Новый',
        'lipsync.history': 'История',
        'lipsync.noAudioAlert': 'Сначала загрузите аудиофайл.',
        'lipsync.noImageAlert': 'Сначала загрузите изображение портрета.',
        'lipsync.noVideoAlert': 'Сначала загрузите исходное видео.',

        // Cinema Studio
        'cinema.tagline': 'Кино-студия 2.0',
        'cinema.headline': 'Что бы вы сняли<br>с безграничным бюджетом?',
        'cinema.placeholder': 'Опишите сцену — используйте @ для добавления персонажей и реквизита',
        'cinema.builderTooltip': 'Быстрая настройка камеры',
        'cinema.cameraSettings': 'Открыть настройки камеры',
        'cinema.generateBtn': 'СОЗДАТЬ ✨',
        'cinema.shooting': 'СЪЁМКА...',
        'cinema.history': 'История',
        'cinema.load': 'Загрузить',
        'cinema.regenerate': '↻ Перегенерировать',
        'cinema.download': '↓ Скачать',
        'cinema.newShot': '+ Новый кадр',
        'cinema.cameraBuilder': 'Настройка камеры',
        'cinema.camera': 'Камера',
        'cinema.lens': 'Объектив',
        'cinema.focal': 'Фокус',
        'cinema.aperture': 'Диафрагма',
        'cinema.preview': 'Предпросмотр',
        'cinema.useSetup': 'Использовать эту настройку',
        'cinema.selectSettings': 'Выберите настройки камеры для предпросмотра...',
        'cinema.generationFailed': 'Ошибка генерации: ',

        // Agent Studio
        'agents.title': 'Студия агентов',
        'agents.webOnly': 'Доступно в веб-приложении на open-generative-ai.com',

        // Workflow Studio
        'workflows.title': 'Студия Workflow',
        'workflows.webOnly': 'Доступно в веб-приложении на open-generative-ai.com',

        // Local Model Manager
        'localModels.title': 'Локальные модели',
        'localModels.webOnly': 'Локальный вывод моделей доступен только в настольном приложении (сборка Electron). Используйте npm run electron:build для сборки.',
        'localModels.inferenceEngine': 'Движок вывода',
        'localModels.checking': 'Проверка...',
        'localModels.installed': 'Установлено и готово',
        'localModels.notInstalled': 'Не установлено — требуется для локальной генерации',
        'localModels.installEngine': 'Установить движок',
        'localModels.downloading': 'Загрузка...',
        'localModels.extracting': 'Извлечение...',
        'localModels.storedIn': 'Хранится в',
        'localModels.storedDefault': 'Хранится в папке данных приложения',
        'localModels.checkingStorage': 'Проверка хранилища...',
        'localModels.loading': 'Загрузка...',
        'localModels.featured': '⚡ Рекомендуемые',
        'localModels.download': 'Скачать',
        'localModels.requiredComponents': 'Необходимые компоненты',
        'localModels.ready': 'Готово',
        'localModels.available': 'Доступно',
        'localModels.offline': 'Недоступно',
        'localModels.starting': 'Запуск...',
        'localModels.complete': 'Завершено!',
        'localModels.preparing': 'Подготовка...',
        'localModels.get': 'Получить',
        'localModels.notConfigured': 'Не настроено',
        'localModels.notConfiguredNote': 'Не настроено (модели Wan2GP будут отображаться как недоступные)',
        'localModels.probing': 'Проверка...',
        'localModels.errorLoading': 'Ошибка загрузки моделей: ',
        'localModels.deleteConfirm': (name) => `Удалить "${name}"? Потребуется повторно скачать модель для использования.`,

        // Web shell
        'web.settingsTitle': 'Настройки — API-ключ, локальные модели, предпочтения',
        'web.switchToEn': 'Switch to English',
        'web.switchToRu': 'Переключить на русский',

        // MCP & CLI page
        'mcp.tagline': 'Для разработчиков и AI-агентов',
        'mcp.title': 'MCP & CLI',
        'mcp.subtitle': 'Используйте Open Generative AI из терминала, IDE или любого совместимого с MCP ассистента. Создавайте кинематографичные изображения, видео и аудио на 100+ моделях — не отрываясь от рабочего процесса.',
        'mcp.quickStart': 'Быстрый старт',
    },
};

export function t(key) {
    const lang = getLang();
    const dict = dictFor(lang);
    const val = dict[key] !== undefined ? dict[key] : (translations.en[key] !== undefined ? translations.en[key] : key);
    return typeof val === 'function' ? val : val;
}

export function tf(key, ...args) {
    const lang = getLang();
    const dict = dictFor(lang);
    const val = dict[key] !== undefined ? dict[key] : (translations.en[key] !== undefined ? translations.en[key] : key);
    return typeof val === 'function' ? val(...args) : val;
}
