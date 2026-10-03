const test = require('node:test');
const assert = require('node:assert/strict');

test('auditLogsToCsv writes header and flattens user/details', async () => {
    const { auditLogsToCsv, AUDIT_LOG_CSV_HEADERS } = await import('../app/admin/logs/toCsv.js');
    const csv = auditLogsToCsv([
        {
            id: 'l1',
            createdAt: '2026-10-01T10:00:00.000Z',
            action: 'MODEL_UPDATED',
            resource: 'model',
            userId: 'u1',
            user: { email: 'admin@example.com' },
            ipAddress: null,
            details: { modelId: 'm1' },
        },
    ]);
    const [header, row] = csv.split('\r\n');
    assert.equal(header, AUDIT_LOG_CSV_HEADERS.join(','));
    assert.equal(row, 'l1,2026-10-01T10:00:00.000Z,MODEL_UPDATED,model,u1,admin@example.com,,"{""modelId"":""m1""}"');
});

test('auditLogsToCsv quotes commas/newlines and neutralises formulas', async () => {
    const { auditLogsToCsv } = await import('../app/admin/logs/toCsv.js');
    const csv = auditLogsToCsv([
        { id: 'a,b', createdAt: 'x', action: '=HYPERLINK("evil")', resource: 'line1\nline2', userId: null, details: null },
    ]);
    const row = csv.slice(csv.indexOf('\r\n') + 2);
    assert.equal(row, `"a,b",x,"'=HYPERLINK(""evil"")","line1\nline2",,,,`);
});

test('auditLogsToCsv on empty input returns header only', async () => {
    const { auditLogsToCsv, AUDIT_LOG_CSV_HEADERS } = await import('../app/admin/logs/toCsv.js');
    assert.equal(auditLogsToCsv([]), AUDIT_LOG_CSV_HEADERS.join(','));
});

test('fillDailySeries returns a dense 30-day series ending today (UTC)', async () => {
    const { fillDailySeries, dailyWindowStart } = await import('../app/api/admin/stats/daily.js');
    const now = new Date('2026-10-03T15:30:00Z');
    assert.equal(dailyWindowStart(30, now).toISOString(), '2026-09-04T00:00:00.000Z');

    const series = fillDailySeries(
        [
            { day: new Date('2026-09-04T00:00:00Z'), count: 2n },
            { day: new Date('2026-10-03T00:00:00Z'), count: 5n },
        ],
        30,
        now,
    );
    assert.equal(series.length, 30);
    assert.deepEqual(series[0], { date: '2026-09-04', count: 2 });
    assert.deepEqual(series[29], { date: '2026-10-03', count: 5 });
    assert.equal(series.slice(1, 29).every((d) => d.count === 0), true);
});
