// Health check endpoint for Docker / load balancer
export async function loader() {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
