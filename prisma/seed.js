const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for sample users
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create sample models
  const models = [
    {
      name: 'Stable Diffusion XL',
      endpoint: '/api/generate/text-to-image',
      type: 'TEXT_TO_IMAGE',
      category: 'Image Generation',
      provider: 'Stability AI',
      parameters: {
        width: 1024,
        height: 1024,
        steps: 50,
        guidance_scale: 7.5,
      },
      isActive: true,
    },
    {
      name: 'DALL-E 3',
      endpoint: '/api/generate/text-to-image',
      type: 'TEXT_TO_IMAGE',
      category: 'Image Generation',
      provider: 'OpenAI',
      parameters: {
        size: '1024x1024',
        quality: 'standard',
      },
      isActive: true,
    },
    {
      name: 'Runway Gen-2',
      endpoint: '/api/generate/image-to-video',
      type: 'IMAGE_TO_VIDEO',
      category: 'Video Generation',
      provider: 'Runway',
      parameters: {
        duration: 4,
        fps: 24,
        motion: 'medium',
      },
      isActive: true,
    },
    {
      name: 'Pika Labs',
      endpoint: '/api/generate/text-to-video',
      type: 'TEXT_TO_VIDEO',
      category: 'Video Generation',
      provider: 'Pika Labs',
      parameters: {
        duration: 3,
        fps: 24,
        aspect_ratio: '16:9',
      },
      isActive: true,
    },
    {
      name: 'Wav2Lip',
      endpoint: '/api/generate/lipsync',
      type: 'LIPSYNC',
      category: 'Lip Sync',
      provider: 'Open Source',
      parameters: {
        quality: 'high',
        face_detect: true,
      },
      isActive: true,
    },
    {
      name: 'ElevenLabs TTS',
      endpoint: '/api/generate/audio',
      type: 'AUDIO',
      category: 'Text to Speech',
      provider: 'ElevenLabs',
      parameters: {
        voice_id: 'default',
        stability: 0.75,
        similarity_boost: 0.75,
      },
      isActive: true,
    },
  ];

  for (const modelData of models) {
    const model = await prisma.model.upsert({
      where: { name: modelData.name },
      update: {},
      create: modelData,
    });
    console.log('✅ Model created:', model.name);
  }

  // Create sample subscription for regular user
  const subscription = await prisma.subscription.create({
    data: {
      userId: regularUser.id,
      plan: 'FREE',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Subscription created for user:', regularUser.email);

  // Create sample API key for admin user
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: adminUser.id,
      key: 'sk_test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      name: 'Default API Key',
    },
  });

  console.log('✅ API Key created:', apiKey.name);

  // Get a model for sample generation
  const textToImageModel = await prisma.model.findFirst({
    where: { type: 'TEXT_TO_IMAGE' },
  });

  // Create sample generations
  if (textToImageModel) {
    const generation1 = await prisma.generation.create({
      data: {
        userId: regularUser.id,
        modelId: textToImageModel.id,
        prompt: 'A beautiful sunset over mountains, digital art',
        parameters: {
          width: 1024,
          height: 1024,
          steps: 50,
        },
        status: 'COMPLETED',
        resultUrl: 'https://example.com/generations/sample1.png',
        cost: 0.05,
        duration: 12,
      },
    });

    const generation2 = await prisma.generation.create({
      data: {
        userId: adminUser.id,
        modelId: textToImageModel.id,
        prompt: 'Futuristic cityscape at night, cyberpunk style',
        parameters: {
          width: 1024,
          height: 1024,
          steps: 50,
        },
        status: 'COMPLETED',
        resultUrl: 'https://example.com/generations/sample2.png',
        cost: 0.05,
        duration: 15,
      },
    });

    console.log('✅ Sample generations created');
  }

  // Create sample audit logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      details: {
        method: 'credentials',
        success: true,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: regularUser.id,
      action: 'GENERATION_CREATED',
      resource: 'generation',
      details: {
        model: 'Stable Diffusion XL',
        type: 'TEXT_TO_IMAGE',
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  console.log('✅ Audit logs created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Sample Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User:  user@example.com / admin123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
