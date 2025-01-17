export async function POST(request: Request): Promise<Response> {
  const body: { password: string } = await request.json();
  console.log(body.password)
  if (body.password === process.env.AUTH_PASSWORD) {
    return new Response('OK', { status: 200 });
  } else {
    return new Response('Incorrect password', { status: 403 });
  }
}