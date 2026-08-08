export const lipSyncStudioDict = {
    en: {
        'title.clickToClear': (fileName) => `${fileName} — click to clear`,
        'title.uploadImage': 'Upload image file',
        'title.uploadVideo': 'Upload video file',
        'title.uploadAudio': 'Upload audio file',

        'title.download': 'Download',
        'title.fullscreen': 'Fullscreen',

        'alert.imageTooLarge': 'Image exceeds 10MB limit.',
        'alert.imageUploadFailed': (msg) => `Image upload failed: ${msg}`,
        'alert.videoTooLarge': 'Video exceeds 50MB limit.',
        'alert.videoUploadFailed': (msg) => `Video upload failed: ${msg}`,
        'alert.audioTooLarge': 'Audio file exceeds 10MB limit.',
        'alert.audioUploadFailed': (msg) => `Audio upload failed: ${msg}`,
        'alert.needAudio': 'Please upload an audio file first.',
        'alert.needImage': 'Please upload a portrait image first.',
        'alert.needVideo': 'Please upload a source video first.',

        'error.noVideoUrl': 'No video URL returned by API',
        'error.unknown': 'Unknown error',

        'status.noImage': 'No image',
        'status.noVideo': 'No video',
        'status.noAudio': 'No audio',

        'loading.title': 'Syncing lips to audio',
        'loading.subtitle': 'Matching mouth movement to your soundtrack…',

        'badge.lipSync': 'Lip Sync',
        'headline.line1': 'Make any face',
        'headline.line2': 'speak your words',
        'description': 'Upload a portrait or video, add an audio track, and AI syncs the lips to match — frame by frame.',

        'chip.pickPortrait': '🖼 Pick a portrait',
        'chip.useVideo': '🎬 Or use a video',
        'chip.addAudio': '🎙 Add your audio',

        'toggle.portraitImage': '🖼 Portrait Image',
        'toggle.video': '🎬 Video',

        'placeholder.speechStyle': 'Describe speech style...',

        'model.selectPlaceholder': 'Select model',

        'generate.generating': 'Generating...',
        'generate.error': (err) => `Error: ${err}`,
        'generate.syncLip': 'Sync Lip',

        'label.audioAbbrev': 'AUD',
    },
    ru: {
        'title.clickToClear': (fileName) => `${fileName} — нажмите, чтобы очистить`,
        'title.uploadImage': 'Загрузить изображение',
        'title.uploadVideo': 'Загрузить видео',
        'title.uploadAudio': 'Загрузить аудио',

        'title.download': 'Скачать',
        'title.fullscreen': 'Развернуть',

        'alert.imageTooLarge': 'Изображение превышает лимит 10 МБ.',
        'alert.imageUploadFailed': (msg) => `Не удалось загрузить изображение: ${msg}`,
        'alert.videoTooLarge': 'Видео превышает лимит 50 МБ.',
        'alert.videoUploadFailed': (msg) => `Не удалось загрузить видео: ${msg}`,
        'alert.audioTooLarge': 'Аудиофайл превышает лимит 10 МБ.',
        'alert.audioUploadFailed': (msg) => `Не удалось загрузить аудио: ${msg}`,
        'alert.needAudio': 'Сначала загрузите аудиофайл.',
        'alert.needImage': 'Сначала загрузите портретное изображение.',
        'alert.needVideo': 'Сначала загрузите исходное видео.',

        'error.noVideoUrl': 'API не вернул ссылку на видео',
        'error.unknown': 'Неизвестная ошибка',

        'status.noImage': 'Нет изображения',
        'status.noVideo': 'Нет видео',
        'status.noAudio': 'Нет аудио',

        'loading.title': 'Синхронизация губ с аудио',
        'loading.subtitle': 'Подстраиваем движение губ под вашу аудиозапись…',

        'badge.lipSync': 'Синхронизация губ',
        'headline.line1': 'Заставьте любое лицо',
        'headline.line2': 'произносить ваши слова',
        'description': 'Загрузите портрет или видео, добавьте аудиодорожку — и AI покадрово синхронизирует движение губ с речью.',

        'chip.pickPortrait': '🖼 Выбрать портрет',
        'chip.useVideo': '🎬 Или использовать видео',
        'chip.addAudio': '🎙 Добавить аудио',

        'toggle.portraitImage': '🖼 Портрет',
        'toggle.video': '🎬 Видео',

        'placeholder.speechStyle': 'Опишите стиль речи...',

        'model.selectPlaceholder': 'Выбрать модель',

        'generate.generating': 'Генерация...',
        'generate.error': (err) => `Ошибка: ${err}`,
        'generate.syncLip': 'Синхронизировать',

        'label.audioAbbrev': 'АУДИО',
    },
};
