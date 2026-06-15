// Silence Chrome DevTools .well-known requests (harmless 404 noise)
export async function loader() {
  return new Response(null, { status: 204 });
}
