const test = require('node:test');
const assert = require('node:assert/strict');

// lib/pagination.ts is loaded via Node's native TypeScript type stripping (Node >= 22.18 / 23.6).
const load = () => import('../lib/pagination.ts');

test('getPaginationParams defaults to page 1, limit 10', async () => {
    const { getPaginationParams } = await load();
    assert.deepEqual(getPaginationParams(new URLSearchParams()), { skip: 0, take: 10, page: 1, limit: 10 });
    assert.deepEqual(getPaginationParams({}), { skip: 0, take: 10, page: 1, limit: 10 });
});

test('getPaginationParams computes skip from page and limit', async () => {
    const { getPaginationParams } = await load();
    assert.deepEqual(getPaginationParams(new URLSearchParams('page=3&limit=20')), { skip: 40, take: 20, page: 3, limit: 20 });
    assert.deepEqual(getPaginationParams({ page: '2', limit: '5' }), { skip: 5, take: 5, page: 2, limit: 5 });
});

test('getPaginationParams clamps page and limit', async () => {
    const { getPaginationParams } = await load();
    assert.equal(getPaginationParams({ page: '0' }).page, 1);
    assert.equal(getPaginationParams({ page: '-5' }).page, 1);
    assert.equal(getPaginationParams({ limit: '1000' }).limit, 100);
    assert.equal(getPaginationParams({ limit: '-1' }).limit, 1);
});

test('createPaginatedResponse builds pagination metadata', async () => {
    const { createPaginatedResponse } = await load();
    const res = createPaginatedResponse([1, 2], 25, 2, 10);
    assert.deepEqual(res, {
        data: [1, 2],
        pagination: { page: 2, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrev: true },
    });
});

test('createPaginatedResponse handles first/last/empty pages', async () => {
    const { createPaginatedResponse } = await load();
    const first = createPaginatedResponse([], 25, 1, 10).pagination;
    assert.equal(first.hasPrev, false);
    assert.equal(first.hasNext, true);
    const last = createPaginatedResponse([], 25, 3, 10).pagination;
    assert.equal(last.hasNext, false);
    const empty = createPaginatedResponse([], 0, 1, 10).pagination;
    assert.equal(empty.totalPages, 0);
    assert.equal(empty.hasNext, false);
    assert.equal(empty.hasPrev, false);
});
