const test = require('node:test');
const assert = require('node:assert/strict');

const DAY_MS = 24 * 60 * 60 * 1000;
const subs = () => import('../app/api/admin/subscriptions/helpers.js');
const keys = () => import('../app/api/admin/api-keys/helpers.js');

test('buildSubscriptionWhere maps filters and email search', async () => {
    const { buildSubscriptionWhere } = await subs();
    assert.deepEqual(buildSubscriptionWhere({}), {});
    assert.deepEqual(buildSubscriptionWhere({ status: 'ACTIVE', plan: 'PRO', search: 'bob' }), {
        status: 'ACTIVE',
        plan: 'PRO',
        user: { email: { contains: 'bob', mode: 'insensitive' } },
    });
});

test('subscriptionFiltersSchema rejects unknown status/plan', async () => {
    const { subscriptionFiltersSchema } = await subs();
    assert.equal(subscriptionFiltersSchema.safeParse({ status: 'ACTIVE', plan: 'ENTERPRISE' }).success, true);
    assert.equal(subscriptionFiltersSchema.safeParse({ status: 'PAUSED' }).success, false);
    assert.equal(subscriptionFiltersSchema.safeParse({ plan: 'ULTRA' }).success, false);
});

test('subscriptionActionSchema: cancel, extend with default and bounds', async () => {
    const { subscriptionActionSchema } = await subs();
    assert.deepEqual(subscriptionActionSchema.parse({ action: 'cancel' }), { action: 'cancel' });
    assert.deepEqual(subscriptionActionSchema.parse({ action: 'extend' }), { action: 'extend', days: 30 });
    assert.equal(subscriptionActionSchema.parse({ action: 'extend', days: '7' }).days, 7);
    assert.equal(subscriptionActionSchema.safeParse({ action: 'extend', days: 0 }).success, false);
    assert.equal(subscriptionActionSchema.safeParse({ action: 'extend', days: 366 }).success, false);
    assert.equal(subscriptionActionSchema.safeParse({ action: 'extend', days: 1.5 }).success, false);
    assert.equal(subscriptionActionSchema.safeParse({ action: 'delete' }).success, false);
});

test('buildSubscriptionUpdate cancel', async () => {
    const { buildSubscriptionUpdate } = await subs();
    assert.deepEqual(buildSubscriptionUpdate({}, { action: 'cancel' }), {
        status: 'CANCELLED',
        cancelAtPeriodEnd: false,
    });
});

test('buildSubscriptionUpdate extend adds to a future period end', async () => {
    const { buildSubscriptionUpdate } = await subs();
    const now = new Date('2026-10-03T00:00:00Z');
    const end = new Date('2026-10-10T00:00:00Z');
    const start = new Date('2026-09-10T00:00:00Z');
    const data = buildSubscriptionUpdate(
        { currentPeriodStart: start, currentPeriodEnd: end },
        { action: 'extend', days: 30 },
        now,
    );
    assert.equal(data.status, 'ACTIVE');
    assert.equal(data.currentPeriodStart, start);
    assert.equal(data.currentPeriodEnd.getTime(), end.getTime() + 30 * DAY_MS);
});

test('buildSubscriptionUpdate extend counts from now when expired or missing', async () => {
    const { buildSubscriptionUpdate } = await subs();
    const now = new Date('2026-10-03T00:00:00Z');
    const expired = buildSubscriptionUpdate(
        { currentPeriodStart: null, currentPeriodEnd: new Date('2026-01-01T00:00:00Z') },
        { action: 'extend', days: 10 },
        now,
    );
    assert.equal(expired.currentPeriodEnd.getTime(), now.getTime() + 10 * DAY_MS);
    assert.equal(expired.currentPeriodStart, now);

    const missing = buildSubscriptionUpdate({}, { action: 'extend', days: 1 }, now);
    assert.equal(missing.currentPeriodEnd.getTime(), now.getTime() + DAY_MS);
});

test('maskApiKey never exposes the middle of the key', async () => {
    const { maskApiKey } = await keys();
    assert.equal(maskApiKey('sk-live-abcdefghijklmnop1234'), 'sk-l••••••••1234');
    assert.equal(maskApiKey('shortkey1234'), '••••••••');
    assert.equal(maskApiKey(''), '');
    assert.equal(maskApiKey(null), '');
});

test('toPublicApiKey strips the raw key', async () => {
    const { toPublicApiKey } = await keys();
    const raw = 'sk-live-abcdefghijklmnop1234';
    const out = toPublicApiKey({ id: 'k1', name: 'CI', key: raw, isActive: true });
    assert.equal('key' in out, false);
    assert.equal(out.maskedKey, 'sk-l••••••••1234');
    assert.equal(JSON.stringify(out).includes('abcdefghijklmnop'), false);
});

test('buildApiKeyWhere maps status and search', async () => {
    const { buildApiKeyWhere, apiKeyFiltersSchema } = await keys();
    assert.deepEqual(buildApiKeyWhere({}), {});
    assert.deepEqual(buildApiKeyWhere({ status: 'active' }), { isActive: true });
    assert.deepEqual(buildApiKeyWhere({ status: 'revoked', search: 'ci' }), {
        isActive: false,
        OR: [
            { name: { contains: 'ci', mode: 'insensitive' } },
            { user: { email: { contains: 'ci', mode: 'insensitive' } } },
        ],
    });
    assert.equal(apiKeyFiltersSchema.safeParse({ status: 'deleted' }).success, false);
});
