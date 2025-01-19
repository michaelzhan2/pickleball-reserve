import { cookies } from "next/headers";

async function createAuthCookie(password: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth',
    value: password,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  })
}

async function checkAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');

  if (authCookie === undefined || authCookie.value !== process.env.AUTH_PASSWORD) {
    return false;
  } else {
    const password = authCookie.value;
    createAuthCookie(password); // refresh cookie
    return true;
  }
}

export async function POST(request: Request): Promise<Response> {
  const body: { password: string } = await request.json();
  if (body.password === process.env.AUTH_PASSWORD) {
    await createAuthCookie(body.password);
    return new Response('OK', { status: 200 });
  } else {
    return new Response('Incorrect password', { status: 403 });
  }
}

export async function GET(request: Request): Promise<Response> {
  const isAuth = await checkAuthCookie();
  if (isAuth) {
    return new Response('OK', { status: 200 });
  } else {
    return new Response('Unauthorized', { status: 401 });
  }
}