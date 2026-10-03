const test = require('node:test');
const assert = require('node:assert/strict');

// lib/validations/*.ts are loaded via Node's native TypeScript type stripping.

test('model.schema: createModelSchema applies defaults and validates', async () => {
    const { createModelSchema, updateModelSchema } = await import('../lib/validations/model.schema.ts');
    const parsed = createModelSchema.parse({
        name: 'flux-dev',
        endpoint: 'flux-dev-image',
        type: 'TEXT_TO_IMAGE',
        category: 'image',
        provider: 'muapi',
    });
    assert.deepEqual(parsed.parameters, {});
    assert.equal(parsed.isActive, true);

    assert.equal(createModelSchema.safeParse({ name: '', endpoint: 'e', type: 'AUDIO', category: 'c', provider: 'p' }).success, false);
    assert.equal(createModelSchema.safeParse({ name: 'n', endpoint: 'e', type: 'NOPE', category: 'c', provider: 'p' }).success, false);
    assert.equal(createModelSchema.safeParse({ name: 'x'.repeat(256), endpoint: 'e', type: 'AUDIO', category: 'c', provider: 'p' }).success, false);
    assert.equal(createModelSchema.safeParse({ name: 'n', endpoint: 'e', type: 'PRODUCT_CARD', category: 'c', provider: 'p' }).success, true);

    assert.deepEqual(updateModelSchema.parse({}), {});
    assert.equal(updateModelSchema.safeParse({ isActive: 'yes' }).success, false);
});

test('user.schema: create/update user', async () => {
    const { createUserSchema, updateUserSchema } = await import('../lib/validations/user.schema.ts');
    const parsed = createUserSchema.parse({ email: 'user@example.com', password: '12345678' });
    assert.equal(parsed.role, 'USER');
    assert.equal(createUserSchema.safeParse({ email: 'bad', password: '12345678' }).success, false);
    assert.equal(createUserSchema.safeParse({ email: 'user@example.com', password: 'short' }).success, false);
    assert.equal(createUserSchema.safeParse({ email: 'user@example.com', password: '12345678', role: 'ROOT' }).success, false);

    assert.equal(updateUserSchema.safeParse({ image: '' }).success, true);
    assert.equal(updateUserSchema.safeParse({ image: 'https://example.com/a.png' }).success, true);
    assert.equal(updateUserSchema.safeParse({ image: 'not-a-url' }).success, false);
});

test('generation.schema: coerces pagination and validates status', async () => {
    const { generationFilterSchema } = await import('../lib/validations/generation.schema.ts');
    assert.deepEqual(generationFilterSchema.parse({}), { page: 1, limit: 10 });
    const parsed = generationFilterSchema.parse({ page: '2', limit: '50', status: 'CANCELLED' });
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 50);
    assert.equal(generationFilterSchema.safeParse({ limit: '101' }).success, false);
    assert.equal(generationFilterSchema.safeParse({ page: '0' }).success, false);
    assert.equal(generationFilterSchema.safeParse({ status: 'UNKNOWN' }).success, false);
});

test('admin: pagination and generation filters', async () => {
    const { paginationSchema, generationFiltersSchema, createUserSchema } = await import('../lib/validations/admin.ts');
    assert.deepEqual(paginationSchema.parse({}), { page: 1, limit: 10 });
    assert.equal(paginationSchema.safeParse({ limit: '500' }).success, false);
    assert.equal(generationFiltersSchema.safeParse({ startDate: '2026-01-01T00:00:00Z' }).success, true);
    assert.equal(generationFiltersSchema.safeParse({ startDate: 'yesterday' }).success, false);
    assert.equal(createUserSchema.safeParse({ email: 'user@example.com', name: '', password: '12345678' }).success, false);
});
