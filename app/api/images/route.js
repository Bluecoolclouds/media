import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserMuapiKey } from '@/lib/muapiKey';
import { SESSION_KEY_SENTINEL } from '@/lib/muapiKeyShared';

// OpenAI-compatible image generation proxy (apinet.cloud and similar gateways).
// Keeps the provider key server-side and normalizes the response to { url }.
const IMAGE_API_BASE = process.env.IMAGE_API_BASE || 'https://apinet.cloud/v1';

// Some studios send MuAPI-era model ids. Map them to real apinet ids so the
// call still succeeds instead of 400-ing on an unknown model.
const MODEL_ALIAS = {
  'nano-banana-pro': 'nano-banana-pro-2k',
  'nano-banana-pro-edit': 'nano-banana-pro-2k',
  'flux-dev': 'flux-1-schnell',
  'flux-dev-image': 'flux-1-schnell',
};

// The server-side provider key is only spent on behalf of signed-in users.
// Anonymous callers must bring their own key via x-api-key / Authorization.
async function getKey(request) {
  const session = await auth();
  if (session?.user && process.env.IMAGE_API_KEY) {
    return process.env.IMAGE_API_KEY;
  }
  const raw =
    request.headers.get('authorization') || request.headers.get('x-api-key') || '';
  const key = raw.replace(/^Bearer\s+/i, '').trim();
  // Signed-in studio clients send a placeholder instead of their key; swap in
  // the stored one, and never forward the placeholder upstream.
  if (key === SESSION_KEY_SENTINEL) {
    return (session?.user?.id && (await getUserMuapiKey(session.user.id))) || '';
  }
  return key;
}

export async function POST(request) {
  const key = await getKey(request);
  if (!key) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const rawModel = body.model || 'doubao-seedream-4-0-250828';
  const model = MODEL_ALIAS[rawModel] || rawModel;
  const prompt = (body.prompt || '').trim();
  const size = body.size || '1024x1024';
  const n = body.n || 1;

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${IMAGE_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, prompt, size, n }),
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const msg = data?.error?.message || `Upstream error ${upstream.status}`;
      return NextResponse.json({ error: msg }, { status: upstream.status });
    }

    const item = data?.data?.[0];
    let url = item?.url || null;
    if (!url && item?.b64_json) {
      url = `data:image/png;base64,${item.b64_json}`;
    }
    if (!url) {
      return NextResponse.json({ error: 'No image returned by provider' }, { status: 502 });
    }

    return NextResponse.json({ url, model });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Request failed' }, { status: 500 });
  }
}
