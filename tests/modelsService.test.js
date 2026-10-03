const test = require('node:test');
const assert = require('node:assert/strict');
const { registerHooks } = require('node:module');

// lib/services/models.ts imports '../prisma' without an extension (resolved by Next/TS,
// not by Node), plus '@prisma/client'. Redirect both to in-memory stubs so the module
// loads under Node's native type stripping and no real database is touched.
const prismaStub = 'export const prisma = { model: { findMany: (...a) => globalThis.__prismaMock.findMany(...a) } };';
const clientStub = 'export const ModelType = {};';
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL && context.parentURL.endsWith('/lib/services/models.ts')) {
            if (specifier === '../prisma') {
                return { url: `data:text/javascript,${encodeURIComponent(prismaStub)}`, shortCircuit: true };
            }
            if (specifier === '@prisma/client') {
                return { url: `data:text/javascript,${encodeURIComponent(clientStub)}`, shortCircuit: true };
            }
        }
        return nextResolve(specifier, context);
    },
});

const rows = [
    { name: 'flux-dev', endpoint: 'flux', type: 'TEXT_TO_IMAGE', category: 'image', provider: 'muapi', parameters: { displayName: 'Flux Dev', family: 'flux' } },
    { name: 'veo-3', endpoint: 'veo', type: 'TEXT_TO_VIDEO', category: 'video', provider: 'google', parameters: null },
];

let calls = 0;
globalThis.__prismaMock = {
    findMany: async () => {
        calls += 1;
        return rows;
    },
};

const load = () => import('../lib/services/models.ts');

test.beforeEach(async () => {
    (await load()).clearModelsCache();
    calls = 0;
});

test('getActiveModels groups and formats models', async () => {
    const { getActiveModels } = await load();
    const grouped = await getActiveModels();
    assert.deepEqual(grouped['text-to-image'], [
        { id: 'flux-dev', name: 'Flux Dev', endpoint: 'flux', category: 'image', provider: 'muapi', inputs: {}, family: 'flux' },
    ]);
    assert.equal(grouped['text-to-video'][0].name, 'veo-3');
    assert.deepEqual(grouped.audio, []);
});

test('getActiveModels serves repeat calls from cache', async () => {
    const { getActiveModels, getModelsByType } = await load();
    await getActiveModels();
    await getActiveModels();
    await getModelsByType('text-to-video');
    assert.equal(calls, 1);
});

test('clearModelsCache forces a fresh DB read', async () => {
    const { getActiveModels, clearModelsCache } = await load();
    await getActiveModels();
    clearModelsCache();
    await getActiveModels();
    assert.equal(calls, 2);
});

test('cache expires after 5 minutes', async (t) => {
    const { getActiveModels } = await load();
    const realNow = Date.now;
    t.after(() => { Date.now = realNow; });
    let now = 1_000_000;
    Date.now = () => now;
    await getActiveModels();
    now += 5 * 60 * 1000 - 1;
    await getActiveModels();
    assert.equal(calls, 1);
    now += 2;
    await getActiveModels();
    assert.equal(calls, 2);
});

test('getModelsByType returns [] for unknown type', async () => {
    const { getModelsByType } = await load();
    assert.deepEqual(await getModelsByType('nope'), []);
});
