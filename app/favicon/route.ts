export const runtime = 'edge';

export async function GET() {
  // The project doesn't include a favicon.ico in /public; serve an existing svg
  // from the public folder (next.svg) as a fallback.
  const response = await fetch(new URL('../../public/next.svg', import.meta.url));
  return new Response(response.body, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}