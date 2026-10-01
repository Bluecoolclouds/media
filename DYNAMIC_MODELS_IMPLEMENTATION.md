# Dynamic Models Implementation

This document describes the implementation of dynamic model loading from the database to Studio components.

## Overview

The Studio components now support loading AI models dynamically from the database while maintaining backward compatibility with hardcoded fallback models.

## Architecture

### 1. API Endpoint (`app/api/models/route.ts`)

**GET /api/models**
- Query parameter: `type` (optional) - Filter by model type
- Returns active models from database grouped by type
- Includes 5-minute cache headers
- Automatic fallback to hardcoded models if DB query fails

### 2. Models Service (`lib/services/models.ts`)

Core functions:
- `getActiveModels()` - Fetch all active models from DB
- `getModelsByType(type)` - Filter models by type
- `formatModelForStudio(model)` - Convert DB format to Studio format
- In-memory cache with 5-minute TTL
- `clearModelsCache()` - Manual cache invalidation

### 3. React Hook (`lib/hooks/useModels.ts`)

**useModels(type)**
- SWR-based data fetching with automatic caching
- Auto-refresh every 5 minutes
- Deduplication within 1 minute
- Returns: `{ models, isLoading, error, mutate }`

### 4. Studio Components

Updated components with dynamic loading:
- `packages/studio/src/components/ImageStudio.jsx`
- `packages/studio/src/components/VideoStudio.jsx`
- `packages/studio/src/components/LipSyncStudio.jsx`

Each component:
- Uses `useDynamicModels()` hook for fetching
- Maintains fallback to hardcoded models
- Shows loading states during fetch
- Seamless fallback on API errors

## Feature Flag

**Environment Variable**: `NEXT_PUBLIC_USE_DYNAMIC_MODELS`

- Set to `"true"` to enable dynamic loading from database
- Omit or set to `"false"` to use only hardcoded models
- Added to `.env.example`

## Database Schema

Models are stored in the `Model` table (Prisma schema):

```prisma
model Model {
  id         String    @id @default(cuid())
  name       String    @unique
  endpoint   String
  type       ModelType
  category   String
  provider   String
  parameters Json
  isActive   Boolean   @default(true)
}

enum ModelType {
  TEXT_TO_IMAGE
  IMAGE_TO_IMAGE
  TEXT_TO_VIDEO
  IMAGE_TO_VIDEO
  AUDIO
  LIPSYNC
}
```

## Type Mapping

DB ModelType → Studio Type:
- `TEXT_TO_IMAGE` → `"text-to-image"`
- `IMAGE_TO_IMAGE` → `"image-to-image"`
- `TEXT_TO_VIDEO` → `"text-to-video"`
- `IMAGE_TO_VIDEO` → `"image-to-video"`
- `AUDIO` → `"audio"`
- `LIPSYNC` → `"lipsync"`

## Model Format Conversion

Database model structure:
```json
{
  "name": "Model Name",
  "endpoint": "model-endpoint",
  "category": "category",
  "provider": "provider",
  "parameters": {
    "inputs": {
      "prompt": { "type": "string", "title": "Prompt" },
      "aspect_ratio": {
        "enum": ["1:1", "16:9"],
        "default": "1:1"
      }
    }
  }
}
```

Converted to Studio format:
```javascript
{
  id: "Model Name",
  name: "Model Name",
  endpoint: "model-endpoint",
  category: "category",
  provider: "provider",
  inputs: { /* from parameters.inputs */ }
}
```

## Migration Path

1. **Phase 1 (Current)**: Feature flag controls dynamic vs hardcoded
2. **Phase 2**: Admin adds models via admin panel
3. **Phase 3**: Studio automatically picks up new models
4. **Phase 4**: Remove hardcoded models once DB is fully populated

## Testing

Test scenarios:
1. ✅ Build succeeds with TypeScript
2. ✅ API endpoint returns models
3. ✅ Studio components load with dynamic models
4. ✅ Fallback works when DB is unavailable
5. ✅ Feature flag toggles behavior correctly

## Error Handling

- **DB Connection Failure**: Falls back to hardcoded models
- **Empty DB Result**: Falls back to hardcoded models
- **API Timeout**: SWR retries, then falls back
- **Invalid Model Format**: Logged and skipped

## Cache Strategy

1. **Server-side**: In-memory cache (5 min TTL)
2. **HTTP Headers**: `Cache-Control: public, s-maxage=300`
3. **Client-side**: SWR automatic caching (5 min refresh)

## Admin Panel Integration

When admin adds/edits models:
1. Model saved to database
2. Server cache cleared automatically (future enhancement)
3. Studio components refresh within 5 minutes
4. Or manual page refresh picks up changes immediately

## Known Limitations

1. V2V models not yet in database (uses fallback only)
2. Model validation not enforced at API level
3. No real-time updates (5-minute polling)
4. Cache invalidation requires restart or timeout

## Future Enhancements

1. WebSocket updates for real-time model additions
2. Model versioning and A/B testing
3. Per-user model access control
4. Model performance metrics
5. Automatic cache invalidation on admin changes
