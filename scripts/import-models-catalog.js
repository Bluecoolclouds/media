/**
 * One-off / repeatable import script: loads the full hardcoded model
 * catalog from packages/studio/src/models.js into the Prisma `Model`
 * table, so the admin panel and /api/models endpoint have real data for
 * every studio type (not just the 6 demo rows in prisma/seed.js).
 *
 * Safe to re-run: upserts by `name` (unique), so re-running after editing
 * models.js updates existing rows instead of duplicating them.
 *
 * Usage: node scripts/import-models-catalog.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

// Map each hardcoded array export name to its Prisma ModelType + a default
// "category" label (free-text field, used for display only). `nameSuffix`
// is appended to the slug for catalogs that reuse ids from another array
// (avatarModels === t2iModels, productCardModels ⊂ i2iModels) so each
// becomes its own independently-manageable admin row despite sharing an
// `endpoint` (the real upstream model id) with the source catalog.
const CATALOGS = [
  { exportName: 't2iModels', type: 'TEXT_TO_IMAGE', category: 'text-to-image' },
  { exportName: 'i2iModels', type: 'IMAGE_TO_IMAGE', category: 'image-to-image' },
  { exportName: 't2vModels', type: 'TEXT_TO_VIDEO', category: 'text-to-video' },
  { exportName: 'i2vModels', type: 'IMAGE_TO_VIDEO', category: 'image-to-video' },
  { exportName: 'audioModels', type: 'AUDIO', category: 'audio' },
  { exportName: 'lipsyncModels', type: 'LIPSYNC', category: 'lipsync' },
  { exportName: 'avatarModels', type: 'AVATAR', category: 'avatar', nameSuffix: '__avatar' },
  { exportName: 'recastModels', type: 'RECAST', category: 'recast' },
  {
    exportName: 'productCardModels',
    type: 'PRODUCT_CARD',
    category: 'product-card',
    nameSuffix: '__productcard',
  },
];

async function main() {
  console.log('Importing hardcoded model catalog into the database...');

  const modelsPath = path.join(process.cwd(), 'packages', 'studio', 'src', 'models.js');
  const models = require(modelsPath);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const { exportName, type, category, nameSuffix } of CATALOGS) {
    const list = models[exportName];
    if (!Array.isArray(list) || list.length === 0) {
      console.warn(`  (skip) ${exportName} is empty or missing`);
      continue;
    }

    for (const entry of list) {
      const { id, name, endpoint, inputs, ...rest } = entry;
      const baseSlug = id || name;
      if (!baseSlug || !endpoint) {
        skipped++;
        continue;
      }
      const slug = nameSuffix ? `${baseSlug}${nameSuffix}` : baseSlug;

      const parameters = {
        ...(name && name !== baseSlug ? { displayName: name } : {}),
        ...(inputs ? { inputs } : {}),
        ...rest,
      };

      const data = {
        name: slug,
        endpoint,
        type,
        category,
        provider: rest.family || 'unknown',
        parameters,
        isActive: true,
      };

      const existing = await prisma.model.findUnique({ where: { name: slug } });

      await prisma.model.upsert({
        where: { name: slug },
        update: {
          endpoint: data.endpoint,
          type: data.type,
          category: data.category,
          provider: data.provider,
          parameters: data.parameters,
        },
        create: data,
      });

      if (existing) updated++;
      else created++;
    }

    console.log(`  processed ${exportName} (${list.length} entries)`);
  }

  console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
