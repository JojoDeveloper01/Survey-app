export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    await env.DB.prepare('INSERT INTO responses (data) VALUES (?)').bind(JSON.stringify(data)).run();
    return Response.json({ message: 'Survey response saved to database!' });
  } catch (error) {
    return Response.json({ message: 'Failed to save response' }, { status: 500 });
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
