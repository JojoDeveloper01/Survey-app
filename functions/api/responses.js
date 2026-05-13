export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env.SURVEY_ADMIN_PASSWORD)) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Survey Dashboard"' },
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT id, submitted_at, data FROM responses ORDER BY submitted_at DESC'
  ).all();

  return Response.json(results.map((row) => ({
    id: row.id,
    submitted_at: row.submitted_at,
    data: JSON.parse(row.data),
  })));
}

function isAuthorized(request, password) {
  if (!password) return false;
  const auth = request.headers.get('Authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const decoded = atob(encoded);
  const separator = decoded.indexOf(':');
  const supplied = separator >= 0 ? decoded.slice(separator + 1) : '';
  return supplied === password;
}
