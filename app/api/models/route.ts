import { NextResponse } from 'next/server';
import { getActiveModels, getModelsByType } from '@/lib/services/models';
import path from 'path';

// Fallback to hardcoded models if DB query fails
async function getFallbackModels() {
  try {
    // Dynamically import the hardcoded models - use absolute path from project root
    const modelsPath = path.join(process.cwd(), 'packages', 'studio', 'src', 'models.js');
    const models = await import(modelsPath);

    return {
      'text-to-image': models.t2iModels || [],
      'image-to-image': models.i2iModels || [],
      'text-to-video': models.t2vModels || [],
      'image-to-video': models.i2vModels || [],
      audio: models.audioModels || [],
      lipsync: models.lipsyncModels || [],
      avatar: models.avatarModels || [],
      recast: models.recastModels || [],
      'product-card': models.productCardModels || [],
    };
  } catch (error) {
    console.error('Error loading fallback models:', error);
    return {};
  }
}

/**
 * GET /api/models
 * Returns active models from database, optionally filtered by type
 * Query params:
 *   - type: text-to-image | image-to-image | text-to-video | image-to-video | audio | lipsync | avatar | recast | product-card
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let models;

    try {
      if (type) {
        // Get models for specific type
        models = await getModelsByType(type);
      } else {
        // Get all models grouped by type
        models = await getActiveModels();
      }
    } catch (dbError) {
      console.error('Database query failed, falling back to hardcoded models:', dbError);
      const fallbackModels = await getFallbackModels();
      models = type ? fallbackModels[type] || [] : fallbackModels;
    }

    return NextResponse.json(
      { success: true, models },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/models:', error);

    // Last resort fallback
    const fallbackModels = await getFallbackModels();
    const type = new URL(request.url).searchParams.get('type');
    const models = type ? fallbackModels[type] || [] : fallbackModels;

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch models',
        models, // Still return fallback data
      },
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      }
    );
  }
}
