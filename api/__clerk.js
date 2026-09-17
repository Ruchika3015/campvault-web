// Vercel Edge Function to proxy Clerk Frontend API traffic for campusvault.vercel.app
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);

  // Extract path following /__clerk or /api/__clerk
  let subPath = url.pathname
    .replace(/^\/api\/__clerk/, '')
    .replace(/^\/__clerk/, '');

  // Default to /v1/client if base verification request
  if (!subPath || subPath === '/') {
    subPath = '/v1/client';
  }

  const targetUrl = new URL(`https://frontend-api.clerk.dev${subPath}${url.search}`);

  const headers = new Headers(req.headers);
  headers.set('Clerk-Proxy-Url', 'https://campusvault.vercel.app/__clerk');
  
  if (process.env.CLERK_SECRET_KEY) {
    headers.set('Clerk-Secret-Key', process.env.CLERK_SECRET_KEY);
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
  }

  headers.set('Origin', 'https://campusvault.vercel.app');
  headers.delete('host');

  try {
    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      redirect: 'manual',
    });

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
