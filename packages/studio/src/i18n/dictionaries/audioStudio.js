export const audioStudioDict = {
    en: {
        'upload.exceedsLimit': 'Audio file exceeds 20MB limit.',
        'upload.clear': 'Clear',
        'upload.trackLabel': 'Upload audio track',
        'upload.formats': 'MP3, WAV, M4A up to 20MB',
        'upload.uploading': 'Uploading...',
        'upload.readyToGenerate': 'Ready to generate',
        'upload.uploadFailed': (msg) => `Upload failed: ${msg}`,
        'upload.dropFailed': (msg) => `Failed to upload dropped file: ${msg}`,

        'label.trackNumber': (n) => `Track #${n}`,
        'label.max': (n) => `(Max ${n})`,

        'player.nowPlaying': 'Now Playing',
        'player.generatedTrackFallback': 'Generated Track',
        'player.muteUnmute': 'Mute/Unmute',
        'player.pause': 'Pause',
        'player.play': 'Play',
        'player.downloadAudio': 'Download Audio',
        'player.save': 'Save',

        'sidebar.audioModel': 'Audio Model',
        'sidebar.selectModel': 'Select Model',
        'sidebar.description': 'Description',
        'sidebar.lyricsPrompt': 'Lyrics / Prompt',
        'sidebar.promptPlaceholder': 'Enter what you want generated...',
        'placeholder.enterField': (key) => `Enter ${key}...`,

        'generate.generatingAudio': 'Generating Audio...',
        'generate.generateTrack': 'Generate Track',
        'generate.requiredField': (field) => `Please complete the required field: ${field}`,
        'generate.generatedFallbackTitle': (name) => `Generated ${name}`,

        'error.generationError': 'Generation Error',
        'error.noAudioUrl': 'No audio URL returned by the API.',
        'error.generationFailed': 'Audio generation failed',

        'loading.generatingSoundtrack': 'Generating Soundtrack',
        'loading.renderingWaveforms': 'Rendering audio waveforms and vocals…',

        'empty.badge': 'Audio Studio',
        'empty.headline1': 'Turn ideas into',
        'empty.headline2': 'finished tracks',
        'empty.description': 'Describe a mood or genre, pick a model on the left, and generate studio-quality audio in seconds.',

        'chip.lofi': 'Lo-fi hip hop, chill beats',
        'chip.epic': 'Epic orchestral trailer',
        'chip.synthPop': 'Upbeat synth pop',
        'chip.ambient': 'Ambient meditation drone',

        'result.newGeneration': 'New Generation',
        'result.success': 'Success',

        'history.generationHistory': (n) => `Generation History (${n})`,
        'history.untitledAudio': 'Untitled Audio',
        'history.audioFallback': 'Audio',
    },
    ru: {
        'upload.exceedsLimit': 'Размер аудиофайла превышает лимит 20 МБ.',
        'upload.clear': 'Очистить',
        'upload.trackLabel': 'Загрузить аудиотрек',
        'upload.formats': 'MP3, WAV, M4A до 20 МБ',
        'upload.uploading': 'Загрузка...',
        'upload.readyToGenerate': 'Готово к генерации',
        'upload.uploadFailed': (msg) => `Ошибка загрузки: ${msg}`,
        'upload.dropFailed': (msg) => `Не удалось загрузить перетащенный файл: ${msg}`,

        'label.trackNumber': (n) => `Трек #${n}`,
        'label.max': (n) => `(Максимум ${n})`,

        'player.nowPlaying': 'Сейчас играет',
        'player.generatedTrackFallback': 'Сгенерированный трек',
        'player.muteUnmute': 'Вкл./выкл. звук',
        'player.pause': 'Пауза',
        'player.play': 'Воспроизвести',
        'player.downloadAudio': 'Скачать аудио',
        'player.save': 'Сохранить',

        'sidebar.audioModel': 'Аудиомодель',
        'sidebar.selectModel': 'Выбрать модель',
        'sidebar.description': 'Описание',
        'sidebar.lyricsPrompt': 'Текст песни / Промпт',
        'sidebar.promptPlaceholder': 'Введите, что нужно сгенерировать...',
        'placeholder.enterField': (key) => `Введите ${key}...`,

        'generate.generatingAudio': 'Генерация аудио...',
        'generate.generateTrack': 'Сгенерировать трек',
        'generate.requiredField': (field) => `Заполните обязательное поле: ${field}`,
        'generate.generatedFallbackTitle': (name) => `Сгенерировано (${name})`,

        'error.generationError': 'Ошибка генерации',
        'error.noAudioUrl': 'API не вернул ссылку на аудио.',
        'error.generationFailed': 'Не удалось сгенерировать аудио',

        'loading.generatingSoundtrack': 'Генерация саундтрека',
        'loading.renderingWaveforms': 'Рендеринг звуковых волн и вокала…',

        'empty.badge': 'Аудиостудия',
        'empty.headline1': 'Превращайте идеи',
        'empty.headline2': 'в готовые треки',
        'empty.description': 'Опишите настроение или жанр, выберите модель слева и получите аудио студийного качества за секунды.',

        'chip.lofi': 'Lo-fi хип-хоп, спокойный бит',
        'chip.epic': 'Эпичный оркестровый трейлер',
        'chip.synthPop': 'Бодрый синти-поп',
        'chip.ambient': 'Эмбиент для медитации',

        'result.newGeneration': 'Новая генерация',
        'result.success': 'Готово',

        'history.generationHistory': (n) => `История генераций (${n})`,
        'history.untitledAudio': 'Аудио без названия',
        'history.audioFallback': 'Аудио',
    },
};
