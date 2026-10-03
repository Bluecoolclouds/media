const test = require('node:test');
const assert = require('node:assert/strict');

// lib/crypto.ts is loaded via Node's native TypeScript type stripping.
const SECRET = 'test-secret-0123456789abcdefghijklmnopqrstuvwxyz';

async function load() {
    return import('../lib/crypto.ts');
}

function withSecret(value, fn) {
    const prev = process.env.MUAPI_KEY_ENCRYPTION_SECRET;
    if (value === undefined) delete process.env.MUAPI_KEY_ENCRYPTION_SECRET;
    else process.env.MUAPI_KEY_ENCRYPTION_SECRET = value;
    try {
        return fn();
    } finally {
        if (prev === undefined) delete process.env.MUAPI_KEY_ENCRYPTION_SECRET;
        else process.env.MUAPI_KEY_ENCRYPTION_SECRET = prev;
    }
}

test('crypto: round-trips a secret and uses a fresh IV each time', async () => {
    const { encryptSecret, decryptSecret } = await load();
    withSecret(SECRET, () => {
        const plain = 'sk-live-ABCdef1234567890';
        const a = encryptSecret(plain, 'user:1');
        const b = encryptSecret(plain, 'user:1');
        assert.notEqual(a, b, 'same plaintext must not produce the same ciphertext');
        assert.match(a, /^v1\.[\w-]+\.[\w-]+\.[\w-]+$/);
        assert.ok(!a.includes(plain), 'ciphertext must not contain the plaintext');
        assert.equal(decryptSecret(a, 'user:1'), plain);
        assert.equal(decryptSecret(b, 'user:1'), plain);
        // Unicode survives.
        assert.equal(decryptSecret(encryptSecret('ключ-✓'), undefined), 'ключ-✓');
    });
});

test('crypto: rejects tampered ciphertext, auth tag and IV', async () => {
    const { encryptSecret, decryptSecret } = await load();
    withSecret(SECRET, () => {
        const payload = encryptSecret('sk-secret-value-1234', 'user:1');
        const [v, iv, tag, ct] = payload.split('.');
        const flip = (s) => {
            const buf = Buffer.from(s, 'base64url');
            buf[0] ^= 0x01;
            return buf.toString('base64url');
        };
        assert.throws(() => decryptSecret([v, iv, tag, flip(ct)].join('.'), 'user:1'));
        assert.throws(() => decryptSecret([v, iv, flip(tag), ct].join('.'), 'user:1'));
        assert.throws(() => decryptSecret([v, flip(iv), tag, ct].join('.'), 'user:1'));
    });
});

test('crypto: AAD binds the ciphertext to its owner', async () => {
    const { encryptSecret, decryptSecret } = await load();
    withSecret(SECRET, () => {
        const payload = encryptSecret('sk-secret-value-1234', 'user:alice');
        assert.throws(() => decryptSecret(payload, 'user:bob'));
        assert.throws(() => decryptSecret(payload));
    });
});

test('crypto: a different secret cannot decrypt', async () => {
    const { encryptSecret, decryptSecret } = await load();
    const payload = withSecret(SECRET, () => encryptSecret('sk-secret-value-1234'));
    withSecret('another-secret-0123456789abcdefghijklmnop', () => {
        assert.throws(() => decryptSecret(payload));
    });
});

test('crypto: malformed payloads and bad input are rejected', async () => {
    const { encryptSecret, decryptSecret } = await load();
    withSecret(SECRET, () => {
        for (const bad of ['', 'garbage', 'v2.a.b.c', 'v1.a.b', 'v1.AAAA.AAAA.AAAA', null, 42]) {
            assert.throws(() => decryptSecret(bad), `should reject ${String(bad)}`);
        }
        assert.throws(() => encryptSecret(''));
    });
});

test('crypto: missing or short secret fails loudly', async () => {
    const { encryptSecret, isEncryptionConfigured } = await load();
    withSecret(undefined, () => {
        assert.equal(isEncryptionConfigured(), false);
        assert.throws(() => encryptSecret('sk-x'), /MUAPI_KEY_ENCRYPTION_SECRET/);
    });
    withSecret('too-short', () => {
        assert.equal(isEncryptionConfigured(), false);
        assert.throws(() => encryptSecret('sk-x'), /MUAPI_KEY_ENCRYPTION_SECRET/);
    });
    withSecret(SECRET, () => assert.equal(isEncryptionConfigured(), true));
});

test('muapiKeyShared: maskApiKey reveals at most the last 4 chars', async () => {
    const { maskApiKey } = await import('../lib/muapiKeyShared.js');
    assert.equal(maskApiKey('sk-1234567890abcd'), '****abcd');
    assert.equal(maskApiKey('short'), '****');
    assert.equal(maskApiKey(''), null);
    assert.equal(maskApiKey(undefined), null);
});
