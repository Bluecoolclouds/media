import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { isEncryptionConfigured } from '@/lib/crypto';
import { getUserMuapiKey, setUserMuapiKey, clearUserMuapiKey } from '@/lib/muapiKey';
import { maskApiKey, SESSION_KEY_SENTINEL } from '@/lib/muapiKeyShared';

// The plaintext key never leaves the server through this route: GET returns
// only a mask, PUT/DELETE return the new state as a mask.

const putSchema = z.object({
  key: z
    .string()
    .trim()
    .min(8, 'API key looks too short')
    .max(512, 'API key too long')
    .regex(/^[\x21-\x7E]+$/, 'API key contains invalid characters')
    .refine((k) => k !== SESSION_KEY_SENTINEL, 'Invalid API key'),
});

const noStore = { 'Cache-Control': 'no-store' };

async function requireUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const key = await getUserMuapiKey(userId);
  return NextResponse.json({ hasKey: Boolean(key), masked: maskApiKey(key) }, { headers: noStore });
}

export async function PUT(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  if (!isEncryptionConfigured()) {
    console.error('[muapi-key] MUAPI_KEY_ENCRYPTION_SECRET is not configured');
    return NextResponse.json(
      { error: 'Server-side key storage is not configured' },
      { status: 503, headers: noStore }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400, headers: noStore }
    );
  }

  try {
    await setUserMuapiKey(userId, parsed.data.key);
  } catch (error: any) {
    // Log the failure class only, never the key.
    console.error('[muapi-key] failed to store key:', error?.name || 'Error');
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500, headers: noStore });
  }

  return NextResponse.json({ hasKey: true, masked: maskApiKey(parsed.data.key) }, { headers: noStore });
}

export async function DELETE() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  try {
    await clearUserMuapiKey(userId);
  } catch (error: any) {
    console.error('[muapi-key] failed to clear key:', error?.name || 'Error');
    return NextResponse.json({ error: 'Failed to remove API key' }, { status: 500, headers: noStore });
  }
  return NextResponse.json({ hasKey: false, masked: null }, { headers: noStore });
}
