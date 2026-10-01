# Admin API Routes and Server Actions

This directory contains admin-specific API routes and server actions for managing users, models, and generations.

## Setup

### 1. Install Dependencies

```bash
npm install zod
npm install --save-dev @types/bcryptjs
```

### 2. Database Setup

Initialize Prisma and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 3. Environment Variables

Add the following to your `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/open_generative_ai"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## API Routes

### Models

- `GET /api/admin/models` - List all models with pagination
  - Query params: `page`, `limit`, `search`, `type`, `isActive`
- `POST /api/admin/models` - Create a new model
- `GET /api/admin/models/[id]` - Get a single model
- `PATCH /api/admin/models/[id]` - Update a model
- `DELETE /api/admin/models/[id]` - Delete a model

### Users

- `GET /api/admin/users` - List all users with pagination
  - Query params: `page`, `limit`, `search`, `role`
- `POST /api/admin/users` - Create a new user
- `GET /api/admin/users/[id]` - Get a single user
- `PATCH /api/admin/users/[id]` - Update a user
- `DELETE /api/admin/users/[id]` - Delete a user

### Generations

- `GET /api/admin/generations` - List generations with filters
  - Query params: `page`, `limit`, `userId`, `modelId`, `status`, `startDate`, `endDate`

### Stats

- `GET /api/admin/stats` - Get dashboard statistics
  - Query params: `days` (default: 30)

## Server Actions

### Models (`app/actions/models.ts`)

- `createModel(data)` - Create a new model
- `updateModel(id, data)` - Update a model
- `deleteModel(id)` - Delete a model
- `toggleModelActive(id)` - Toggle model active status
- `getModelById(id)` - Get a single model
- `getModels(params)` - List models with pagination

### Users (`app/actions/users.ts`)

- `createUser(data)` - Create a new user
- `updateUser(id, data)` - Update a user
- `deleteUser(id, currentUserId)` - Delete a user
- `updateUserRole(id, role)` - Update user role
- `getUserById(id)` - Get a single user
- `getUsers(params)` - List users with pagination

### Generations (`app/actions/generations.ts`)

- `getGenerations(params)` - List generations with filters
- `getGenerationStats(params)` - Get generation statistics
- `getGenerationById(id)` - Get a single generation

### Admin (`app/actions/admin.ts`)

- `getDashboardStats(days)` - Get dashboard statistics
- `getRecentActivity(limit)` - Get recent activity
- `getDailyGenerations(days)` - Get daily generation counts
- `getSystemHealth()` - Get system health metrics

## Authentication

All routes and actions require admin authentication. The following helpers are provided:

- `requireAdmin()` - Requires admin role
- `requireAuth()` - Requires any authenticated user

## Validation

Input validation is handled using Zod schemas defined in `lib/validations/admin.ts`:

- `createModelSchema` - Validates model creation data
- `updateModelSchema` - Validates model update data
- `createUserSchema` - Validates user creation data
- `updateUserSchema` - Validates user update data
- `generationFiltersSchema` - Validates generation filter parameters

## Example Usage

### API Route (fetch)

```typescript
// Fetch models
const response = await fetch('/api/admin/models?page=1&limit=10');
const data = await response.json();

// Create a model
const response = await fetch('/api/admin/models', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'FLUX Schnell',
    slug: 'flux-schnell',
    endpoint: '/api/v1/flux-schnell',
    type: 'IMAGE',
    isActive: true,
  }),
});
```

### Server Action (client component)

```typescript
import { createModel } from '@/app/actions/models';

async function handleSubmit(formData) {
  try {
    const model = await createModel({
      name: formData.get('name'),
      slug: formData.get('slug'),
      endpoint: formData.get('endpoint'),
      type: formData.get('type'),
      isActive: true,
    });
    console.log('Model created:', model);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Error Handling

All routes and actions include proper error handling:

- **400 Bad Request** - Invalid input/validation errors
- **401 Unauthorized** - Not authenticated
- **403 Forbidden** - Not authorized (not an admin)
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource (email/slug already exists)
- **500 Internal Server Error** - Server error

Errors are returned in the format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```
