import { createCipheriv, createDecipheriv, randomBytes, hkdfSync } from 'node:crypto';

/**
 * AES-256-GCM encryption for secrets stored at rest (per-user MuAPI keys).
 *
 * Payload format: `v1.<iv>.<authTag>.<ciphertext>` (each part base64url).
 * The 256-bit key is derived with HKDF-SHA256 from MUAPI_KEY_ENCRYPTION_SECRET,
 * so the env value can be any high-entropy string (e.g. `openssl rand -base64 32`).
 *
 * Pass `aad` (e.g. `user:<id>`) to bind a ciphertext to its owner: a payload
 * copied onto another row then fails authentication instead of decrypting.
 */

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12; // 96-bit nonce, the GCM standard
const TAG_LENGTH = 16;
const MIN_SECRET_LENGTH = 32;
const HKDF_INFO = 'open-generative-ai:muapi-key:v1';

function getEncryptionKey(): Buffer {
  const secret = process.env.MUAPI_KEY_ENCRYPTION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `MUAPI_KEY_ENCRYPTION_SECRET must be set (min ${MIN_SECRET_LENGTH} chars; generate with \`openssl rand -base64 32\`)`
    );
  }
  return Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), HKDF_INFO, 32));
}

/** True when the encryption secret is configured well enough to use. */
export function isEncryptionConfigured(): boolean {
  const secret = process.env.MUAPI_KEY_ENCRYPTION_SECRET;
  return Boolean(secret && secret.length >= MIN_SECRET_LENGTH);
}

export function encryptSecret(plaintext: string, aad?: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('encryptSecret: plaintext must be a non-empty string');
  }
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

/** Throws if the payload is malformed, tampered with, or was bound to a different aad. */
export function decryptSecret(payload: string, aad?: string): string {
  const parts = typeof payload === 'string' ? payload.split('.') : [];
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('decryptSecret: unsupported payload format');
  }
  const iv = Buffer.from(parts[1], 'base64url');
  const tag = Buffer.from(parts[2], 'base64url');
  const ciphertext = Buffer.from(parts[3], 'base64url');
  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new Error('decryptSecret: invalid iv or auth tag length');
  }
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
