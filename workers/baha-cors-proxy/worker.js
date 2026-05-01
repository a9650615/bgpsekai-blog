const ALLOWED_ORIGINS = [
  'https://blog.bgpsekai.club',
  'https://a9650615.github.io',
  'http://localhost:4321',
  'http://localhost:4322',
  'http://localhost:4323',
];

const BAHA_API_BASE = 'https://api.gamer.com.tw/anime/v1/danmu.php';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (!ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const sn = url.searchParams.get('sn');
    if (!sn || !/^\d+$/.test(sn)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid sn parameter' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const bahaUrl = `${BAHA_API_BASE}?videoSn=${sn}&geo=TW%2CHK&limit=9999`;

    try {
      const res = await fetch(bahaUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'bgpsekai-baha-proxy/1.0' },
      });

      const body = await res.text();

      return new Response(body, {
        status: res.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: `Upstream error: ${e.message}` }), {
        status: 502,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }
  },
};
