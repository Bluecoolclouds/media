import { NextResponse } from 'next/server';
import { resolveMuapiKey } from "@/lib/muapiKey";
import { SESSION_KEY_SENTINEL } from "@/lib/muapiKeyShared";

const MUAPI_BASE = process.env.API_BASE || 'https://api.muapi.ai';


function cleanHeaders(request) {
    const headers = new Headers(request.headers);
    // Never forward the session placeholder upstream; resolveMuapiKey sets the real key.
    if (headers.get("x-api-key") === SESSION_KEY_SENTINEL) headers.delete("x-api-key");
    headers.delete('host');
    headers.delete('connection');
    headers.delete('cookie');
    return headers;
}

export async function GET(request) {
    const { search } = new URL(request.url);
    const targetUrl = `${MUAPI_BASE}/app/get_file_upload_url${search}`;

    const headers = cleanHeaders(request);
    const apiKey = await resolveMuapiKey(request);
    if (apiKey) headers.set('x-api-key', apiKey);

    try {
        const response = await fetch(targetUrl, {
            headers,
            method: 'GET',
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
