export const imageStudioDict = {
    en: {
        'upload.tooLarge': (names) => `The following images are too large (max 10MB): ${names}`,
        'upload.failed': (msg) => `Image upload failed: ${msg}`,
        'upload.addUpToImages': (n) => `Add up to ${n} images`,
        'upload.referenceImage': 'Reference image',
        'upload.selectedClickManage': (count, max) => `${count} of ${max} images selected — click to manage`,
        'upload.oneSelectedAddMore': (max) => `1 image selected — click to add more (up to ${max})`,
        'upload.referenceImages': 'Reference Images',
        'upload.selectUpToImages': (max) => `Select up to ${max} images`,
        'upload.done': (count) => `✓ Done (${count})`,
        'upload.uploadFiles': 'Upload files',
        'upload.uploadNew': 'Upload new',
        'upload.noUploadsYet': 'No uploads yet',
        'upload.removeFromHistory': 'Remove from history',
        'upload.countOfMaxSelected': (count, max) => `${count} of ${max} selected`,
        'upload.useSelected': 'Use Selected',
        'upload.restoredImage': 'Restored Image',
        'upload.swapFace': 'Swap Face',

        'model.searchPlaceholder': 'Search models...',
        'model.availableModels': 'Available models',

        'dropdown.aspectRatio': 'Aspect Ratio',
        'dropdown.resolution': 'Resolution',
        'dropdown.effectType': 'Effect Type',
        'dropdown.effectFallback': 'Effect',

        'alert.uploadReferenceFirst': 'Please upload a reference image first.',
        'alert.uploadSwapFace': 'Please upload a swap face image.',
        'alert.enterPrompt': 'Please enter a prompt to generate an image.',

        'placeholder.multiImagesTransform': (n) => `${n} images selected — describe the transformation (optional)`,
        'placeholder.transformImage': 'Describe how to transform this image (optional)',
        'placeholder.describeImage': 'Describe the image you want to create',

        'badge.imageStudio': 'Image Studio',
        'headline.turnWordsInto': 'Turn words into',
        'headline.cinematicImages': 'cinematic images',
        'subheadline.describeScene': 'Describe a scene, a character, a mood — and generate it in seconds.',

        'chip.neonCyberpunk': 'Neon cyberpunk city at night',
        'chip.portraitGoldenHour': 'Portrait, golden hour, 85mm',
        'chip.surrealDesert': 'Surreal desert dreamscape',
        'chip.retroFilm': 'Retro film still, 1970s',

        'action.fullscreen': 'Fullscreen',
        'action.download': 'Download',
        'gallery.noPromptProvided': 'No prompt provided',
        'gallery.generatedImageAlt': 'Generated image',

        'generate.generating': 'Generating...',
        'generate.error': (msg) => `Error: ${msg}`,
        'generate.generate': 'Generate',

        'modal.fullscreenPreviewAlt': 'Fullscreen Preview',
    },
    ru: {
        'upload.tooLarge': (names) => `Следующие изображения слишком большие (макс. 10 МБ): ${names}`,
        'upload.failed': (msg) => `Не удалось загрузить изображение: ${msg}`,
        'upload.addUpToImages': (n) => `Добавьте до ${n} изображений`,
        'upload.referenceImage': 'Референсное изображение',
        'upload.selectedClickManage': (count, max) => `Выбрано ${count} из ${max} изображений — нажмите, чтобы управлять`,
        'upload.oneSelectedAddMore': (max) => `Выбрано 1 изображение — нажмите, чтобы добавить ещё (до ${max})`,
        'upload.referenceImages': 'Референсные изображения',
        'upload.selectUpToImages': (max) => `Выберите до ${max} изображений`,
        'upload.done': (count) => `✓ Готово (${count})`,
        'upload.uploadFiles': 'Загрузить файлы',
        'upload.uploadNew': 'Загрузить новое',
        'upload.noUploadsYet': 'Пока нет загрузок',
        'upload.removeFromHistory': 'Удалить из истории',
        'upload.countOfMaxSelected': (count, max) => `Выбрано ${count} из ${max}`,
        'upload.useSelected': 'Использовать выбранное',
        'upload.restoredImage': 'Восстановленное изображение',
        'upload.swapFace': 'Замена лица',

        'model.searchPlaceholder': 'Поиск моделей...',
        'model.availableModels': 'Доступные модели',

        'dropdown.aspectRatio': 'Соотношение сторон',
        'dropdown.resolution': 'Разрешение',
        'dropdown.effectType': 'Тип эффекта',
        'dropdown.effectFallback': 'Эффект',

        'alert.uploadReferenceFirst': 'Сначала загрузите референсное изображение.',
        'alert.uploadSwapFace': 'Загрузите изображение для замены лица.',
        'alert.enterPrompt': 'Введите описание, чтобы сгенерировать изображение.',

        'placeholder.multiImagesTransform': (n) => `Выбрано ${n} изображений — опишите преобразование (необязательно)`,
        'placeholder.transformImage': 'Опишите, как преобразовать это изображение (необязательно)',
        'placeholder.describeImage': 'Опишите изображение, которое хотите создать',

        'badge.imageStudio': 'Студия изображений',
        'headline.turnWordsInto': 'Превратите слова в',
        'headline.cinematicImages': 'кинематографичные изображения',
        'subheadline.describeScene': 'Опишите сцену, персонажа, настроение — и сгенерируйте это за секунды.',

        'chip.neonCyberpunk': 'Неоновый киберпанк-город ночью',
        'chip.portraitGoldenHour': 'Портрет, золотой час, 85мм',
        'chip.surrealDesert': 'Сюрреалистичный пустынный пейзаж',
        'chip.retroFilm': 'Ретро кинокадр, 1970-е',

        'action.fullscreen': 'Полный экран',
        'action.download': 'Скачать',
        'gallery.noPromptProvided': 'Описание не указано',
        'gallery.generatedImageAlt': 'Сгенерированное изображение',

        'generate.generating': 'Генерация...',
        'generate.error': (msg) => `Ошибка: ${msg}`,
        'generate.generate': 'Создать',

        'modal.fullscreenPreviewAlt': 'Полноэкранный просмотр',
    },
};
