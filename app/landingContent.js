// Landing page copy — EN/RU. Mirrors the i18n approach used across studio.
// Card gradients emulate the higgsfield-style vivid showcase tiles.

const cardGrads = {
  image: 'linear-gradient(150deg, #22d3ee22, #0ea5e922 40%, #6366f122)',
  video: 'linear-gradient(150deg, #a855f722, #ec489922 45%, #f9731622)',
  avatar: 'linear-gradient(150deg, #f4364722, #fb923c22 45%, #facc1522)',
  audio: 'linear-gradient(150deg, #10b98122, #22d3ee22 50%, #3b82f622)',
};

export const landingContent = {
  en: {
    nav: {
      links: [
        { label: 'Showcase', href: '#showcase' },
        { label: 'Features', href: '#features' },
      ],
      pricing: 'Pricing',
      langSwitch: 'Switch language',
      cta: 'Open Studio',
    },
    hero: {
      badge: '200+ generative models',
      titleLine1: 'Create anything.',
      titleLine2: 'Image, video, sound.',
      subtitle:
        'One studio for the entire generative stack — Flux, Seedream, Kling, Veo, lip sync, avatars and agents. Bring an idea, leave with a finished asset.',
      ctaPrimary: 'Start creating free',
      ctaSecondary: 'View pricing',
      note: 'No install. Runs in your browser.',
    },
    cards: [
      { kicker: 'Text → Image', title: 'Image Studio', desc: 'Photoreal stills across Flux, Seedream, DALL·E and more.', grad: cardGrads.image },
      { kicker: 'Text → Video', title: 'Video & Cinema', desc: 'Cinematic clips with Kling, Veo and Seedance.', grad: cardGrads.video },
      { kicker: 'Face → Motion', title: 'Avatars & Lip Sync', desc: 'Talking avatars synced to any voice track.', grad: cardGrads.avatar },
      { kicker: 'Voice → Audio', title: 'Audio & Music', desc: 'Generate voiceovers, music and sound design.', grad: cardGrads.audio },
    ],
    models: {
      label: 'Powered by the models you already want',
      list: ['Flux.1', 'Seedream 4.0', 'Nano Banana', 'Gemini 2.5', 'DALL·E 3', 'Kling', 'Veo', 'Seedance', 'Midjourney', 'Recast'],
    },
    features: {
      title: 'A whole production team, on tap',
      subtitle: 'Every tool talks to the same canvas, so output from one becomes input to the next.',
      items: [
        { icon: '🎨', title: 'Multi-model image', desc: 'Switch models mid-project without losing your prompt or references.', glow: 'radial-gradient(circle, #22d3ee55, transparent)' },
        { icon: '🎬', title: 'Video & cinema', desc: 'Turn a still or a line of text into motion, then extend it into a scene.', glow: 'radial-gradient(circle, #a855f755, transparent)' },
        { icon: '🗣️', title: 'Avatars & lip sync', desc: 'Drive a face from any audio and get frame-accurate lip movement.', glow: 'radial-gradient(circle, #f4364755, transparent)' },
        { icon: '🧩', title: 'Visual workflows', desc: 'Chain generators into a repeatable pipeline with the node builder.', glow: 'radial-gradient(circle, #10b98155, transparent)' },
        { icon: '🤖', title: 'Creative agents', desc: 'Delegate briefs to agents that plan and generate on your behalf.', glow: 'radial-gradient(circle, #6366f155, transparent)' },
        { icon: '📦', title: 'Product & marketing', desc: 'Product cards and campaign assets from a single source shot.', glow: 'radial-gradient(circle, #f9731655, transparent)' },
      ],
    },
    stats: [
      { value: '200+', label: 'AI models' },
      { value: '14', label: 'Creative studios' },
      { value: '4K', label: 'Max output' },
      { value: '∞', label: 'Iterations' },
    ],
    bottomCta: {
      title: 'Your next idea is one prompt away',
      subtitle: 'Open the studio and generate your first asset in seconds.',
      button: 'Launch the studio',
    },
    footer: '© 2026 apinet.cloud — Open Generative AI Studio.',
  },
  ru: {
    nav: {
      links: [
        { label: 'Витрина', href: '#showcase' },
        { label: 'Возможности', href: '#features' },
      ],
      pricing: 'Тарифы',
      langSwitch: 'Переключить язык',
      cta: 'Открыть студию',
    },
    hero: {
      badge: '200+ генеративных моделей',
      titleLine1: 'Создавайте что угодно.',
      titleLine2: 'Картинки, видео, звук.',
      subtitle:
        'Одна студия для всего генеративного стека — Flux, Seedream, Kling, Veo, синхронизация губ, аватары и агенты. Приходите с идеей — уходите с готовым результатом.',
      ctaPrimary: 'Начать бесплатно',
      ctaSecondary: 'Посмотреть тарифы',
      note: 'Без установки. Работает прямо в браузере.',
    },
    cards: [
      { kicker: 'Текст → Картинка', title: 'Студия картинок', desc: 'Фотореалистичные кадры на Flux, Seedream, DALL·E и других.', grad: cardGrads.image },
      { kicker: 'Текст → Видео', title: 'Видео и кино', desc: 'Кинематографичные клипы на Kling, Veo и Seedance.', grad: cardGrads.video },
      { kicker: 'Лицо → Движение', title: 'Аватары и синхр. губ', desc: 'Говорящие аватары под любую звуковую дорожку.', grad: cardGrads.avatar },
      { kicker: 'Голос → Аудио', title: 'Аудио и музыка', desc: 'Озвучка, музыка и звуковой дизайн.', grad: cardGrads.audio },
    ],
    models: {
      label: 'Работает на моделях, которые вам и нужны',
      list: ['Flux.1', 'Seedream 4.0', 'Nano Banana', 'Gemini 2.5', 'DALL·E 3', 'Kling', 'Veo', 'Seedance', 'Midjourney', 'Recast'],
    },
    features: {
      title: 'Целая продакшн-команда под рукой',
      subtitle: 'Все инструменты работают на одном холсте — результат одного становится входом для следующего.',
      items: [
        { icon: '🎨', title: 'Мульти-модельные картинки', desc: 'Меняйте модель по ходу проекта, не теряя промпт и референсы.', glow: 'radial-gradient(circle, #22d3ee55, transparent)' },
        { icon: '🎬', title: 'Видео и кино', desc: 'Превратите кадр или строку текста в движение и разверните в сцену.', glow: 'radial-gradient(circle, #a855f755, transparent)' },
        { icon: '🗣️', title: 'Аватары и синхр. губ', desc: 'Оживите лицо любой аудиодорожкой с точной артикуляцией.', glow: 'radial-gradient(circle, #f4364755, transparent)' },
        { icon: '🧩', title: 'Визуальные сценарии', desc: 'Соберите генераторы в повторяемый конвейер в конструкторе узлов.', glow: 'radial-gradient(circle, #10b98155, transparent)' },
        { icon: '🤖', title: 'Креативные агенты', desc: 'Поручите бриф агентам — они спланируют и сгенерируют за вас.', glow: 'radial-gradient(circle, #6366f155, transparent)' },
        { icon: '📦', title: 'Товары и маркетинг', desc: 'Карточки товаров и рекламные материалы из одного исходника.', glow: 'radial-gradient(circle, #f9731655, transparent)' },
      ],
    },
    stats: [
      { value: '200+', label: 'AI-моделей' },
      { value: '14', label: 'Креативных студий' },
      { value: '4K', label: 'Макс. качество' },
      { value: '∞', label: 'Итераций' },
    ],
    bottomCta: {
      title: 'Ваша следующая идея — в одном промпте',
      subtitle: 'Откройте студию и создайте первый результат за секунды.',
      button: 'Запустить студию',
    },
    footer: '© 2026 apinet.cloud — Open Generative AI Studio.',
  },
};
