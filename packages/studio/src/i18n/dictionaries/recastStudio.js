export const recastStudioDict = {
    en: {
        'upload.title.readyToClear': (fileName) => `${fileName} — click to clear`,
        'upload.title.video': 'Upload video file',
        'upload.title.image': 'Upload character image file',

        'alert.videoTooLarge': 'Video exceeds 50MB limit.',
        'alert.videoUploadFailed': (msg) => `Video upload failed: ${msg}`,
        'alert.imageTooLarge': 'Image exceeds 10MB limit.',
        'alert.imageUploadFailed': (msg) => `Image upload failed: ${msg}`,
        'alert.needVideo': 'Please upload a source video first.',
        'alert.needImage': 'Please upload a character image first.',

        'error.noVideoUrl': 'No video URL returned by API',
        'error.unknown': 'Unknown error',

        'loading.title': 'Swapping the character',
        'loading.subtitle': 'Re-rendering your video with the new character…',

        'action.fullscreen': 'Fullscreen',
        'action.download': 'Download',

        'card.defaultModelName': 'Body Swap',

        'hero.badge': 'Body Swap',
        'hero.title.line1': 'Recast any video with',
        'hero.title.line2': 'a new character',
        'hero.subtitle': 'Drop in a source clip and a character image — AI swaps the performer and keeps the motion.',
        'hero.chip.video': '🎬 Add a source video',
        'hero.chip.image': '🖼 Add a character image',
        'hero.chip.swap': '✨ Swap & render',

        'prompt.placeholder': 'Optional — describe the motion or scene...',
        'prompt.hint': 'Your Video + Character Image → swapped video',

        'model.selectPlaceholder': 'Select model',

        'generate.swapping': 'Swapping...',
        'generate.error': (msg) => `Error: ${msg}`,
        'generate.swapBody': 'Swap Body',
    },
    ru: {
        'upload.title.readyToClear': (fileName) => `${fileName} — нажмите, чтобы очистить`,
        'upload.title.video': 'Загрузить видеофайл',
        'upload.title.image': 'Загрузить файл с изображением персонажа',

        'alert.videoTooLarge': 'Видео превышает лимит 50 МБ.',
        'alert.videoUploadFailed': (msg) => `Не удалось загрузить видео: ${msg}`,
        'alert.imageTooLarge': 'Изображение превышает лимит 10 МБ.',
        'alert.imageUploadFailed': (msg) => `Не удалось загрузить изображение: ${msg}`,
        'alert.needVideo': 'Сначала загрузите исходное видео.',
        'alert.needImage': 'Сначала загрузите изображение персонажа.',

        'error.noVideoUrl': 'API не вернул ссылку на видео',
        'error.unknown': 'Неизвестная ошибка',

        'loading.title': 'Замена персонажа',
        'loading.subtitle': 'Перерисовываем ваше видео с новым персонажем…',

        'action.fullscreen': 'Во весь экран',
        'action.download': 'Скачать',

        'card.defaultModelName': 'Замена персонажа',

        'hero.badge': 'Замена персонажа',
        'hero.title.line1': 'Замените персонажа',
        'hero.title.line2': 'в любом видео',
        'hero.subtitle': 'Загрузите исходный клип и изображение персонажа — AI заменит исполнителя, сохранив движение.',
        'hero.chip.video': '🎬 Добавьте исходное видео',
        'hero.chip.image': '🖼 Добавьте изображение персонажа',
        'hero.chip.swap': '✨ Замените и обработайте',

        'prompt.placeholder': 'Необязательно — опишите движение или сцену...',
        'prompt.hint': 'Ваше видео + изображение персонажа → готовое видео',

        'model.selectPlaceholder': 'Выбрать модель',

        'generate.swapping': 'Замена...',
        'generate.error': (msg) => `Ошибка: ${msg}`,
        'generate.swapBody': 'Заменить персонажа',
    },
};
