import { prisma } from '../prisma';
import { ModelType } from '@prisma/client';

// In-memory cache (5 minutes TTL)
let modelsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Map Prisma ModelType enum to Studio model type strings
 */
function mapModelTypeToStudioType(type: ModelType): string {
  const mapping: Record<ModelType, string> = {
    TEXT_TO_IMAGE: 'text-to-image',
    IMAGE_TO_IMAGE: 'image-to-image',
    TEXT_TO_VIDEO: 'text-to-video',
    IMAGE_TO_VIDEO: 'image-to-video',
    AUDIO: 'audio',
    LIPSYNC: 'lipsync',
    AVATAR: 'avatar',
    RECAST: 'recast',
    PRODUCT_CARD: 'product-card',
  };
  return mapping[type];
}

/**
 * Format DB model to Studio format.
 *
 * `Model.name` is unique and doubles as the stable slug/id the studio
 * components look up by (e.g. getRecastModelById, getAudioModelById).
 * A separate human-friendly label can be stored in `parameters.displayName`;
 * if present it is used for the `name` field shown in the UI, otherwise the
 * slug itself is used.
 */
export function formatModelForStudio(model: any) {
  const { displayName, ...restParameters } = model.parameters || {};
  return {
    id: model.name,
    name: displayName || model.name,
    endpoint: model.endpoint,
    category: model.category,
    provider: model.provider,
    inputs: model.parameters?.inputs || {},
    // Include any other fields from parameters (family, videoField, etc.)
    ...restParameters,
  };
}

/**
 * Get all active models from database
 */
export async function getActiveModels() {
  try {
    // Check cache first
    if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_TTL) {
      return modelsCache.data;
    }

    const models = await prisma.model.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    // Group models by type
    const groupedModels: Record<string, any[]> = {
      'text-to-image': [],
      'image-to-image': [],
      'text-to-video': [],
      'image-to-video': [],
      audio: [],
      lipsync: [],
      avatar: [],
      recast: [],
      'product-card': [],
    };

    models.forEach((model) => {
      const studioType = mapModelTypeToStudioType(model.type);
      const formattedModel = formatModelForStudio(model);
      groupedModels[studioType].push(formattedModel);
    });

    // Update cache
    modelsCache = {
      data: groupedModels,
      timestamp: Date.now(),
    };

    return groupedModels;
  } catch (error) {
    console.error('Error fetching models from database:', error);
    throw error;
  }
}

/**
 * Get models by type
 */
export async function getModelsByType(type: string) {
  try {
    const allModels = await getActiveModels();
    return allModels[type] || [];
  } catch (error) {
    console.error(`Error fetching models for type ${type}:`, error);
    throw error;
  }
}

/**
 * Clear the models cache (useful for admin operations)
 */
export function clearModelsCache() {
  modelsCache = null;
}
