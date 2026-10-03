import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decryptSecret, encryptSecret } from '@/lib/crypto';
import { SESSION_KEY_SENTINEL } from '@/lib/muapiKeyShared';

/** AAD binding each ciphertext to its user row (see lib/crypto.ts). */
const aadFor = (userId: string) => `user:${userId}`;

export async function setUserMuapiKey(userId: string, key: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      muapiKeyEncrypted: encryptSecret(key, aadFor(userId)),
      muapiKeyUpdatedAt: new Date(),
    },
  });
}

export async function clearUserMuapiKey(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { muapiKeyEncrypted: null, muapiKeyUpdatedAt: null },
  });
}

/** Decrypted key for a user, or null if none is stored / it can't be decrypted. */
export async function getUserMuapiKey(userId: string): Promise<string | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { muapiKeyEncrypted: true },
  });
  if (!row?.muapiKeyEncrypted) return null;
  try {
    return decryptSecret(row.muapiKeyEncrypted, aadFor(userId));
  } catch {
    // Wrong/rotated secret or tampered row. Never log the payload.
    console.error('[muapi-key] stored key could not be decrypted for a user');
    return null;
  }
}

/** Stored key of the signed-in user, or null. Never throws. */
async function sessionUserKey(): Promise<string | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;
    return await getUserMuapiKey(userId);
  } catch {
    // DB or encryption misconfigured — behave as if no key, never crash the proxy.
    return null;
  }
}

/**
 * CSRF guard for spending the stored key on cookie auth alone. Allowed only if
 * the client sent the sentinel (a custom header, impossible cross-site without
 * a failing CORS preflight) or the browser marks the request same-origin.
 * Blocks cross-site top-level GET navigations, which do carry the Lax cookie.
 */
function mayUseSessionKey(request: Request, headerKey: string | null) {
  if (headerKey === SESSION_KEY_SENTINEL) return true;
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

/**
 * Resolve the MuAPI key for a proxied request. Order:
 *   1. explicit x-api-key header (existing behavior, unchanged)
 *   2. signed-in user's stored key (only for same-origin/sentinel requests)
 *   3. legacy muapi_key cookie
 * The session key ranks above the cookie so a stale cookie left by someone
 * else on a shared browser can't override the signed-in user's own key.
 */
export async function resolveMuapiKey(request: Request & { cookies?: any }): Promise<string | undefined> {
  const headerKey = request.headers.get('x-api-key');
  if (headerKey && headerKey !== SESSION_KEY_SENTINEL) return headerKey;

  if (mayUseSessionKey(request, headerKey)) {
    const stored = await sessionUserKey();
    if (stored) return stored;
  }

  const cookieKey = request.cookies?.get?.('muapi_key')?.value;
  if (cookieKey && cookieKey !== SESSION_KEY_SENTINEL) return cookieKey;

  return undefined;
}

/**
 * Key for server components that call MuAPI directly (no browser request to
 * guard): the signed-in user's stored key, else the legacy cookie.
 */
export async function getServerComponentMuapiKey(cookieValue?: string): Promise<string | undefined> {
  const stored = await sessionUserKey();
  if (stored) return stored;
  return cookieValue && cookieValue !== SESSION_KEY_SENTINEL ? cookieValue : undefined;
}
