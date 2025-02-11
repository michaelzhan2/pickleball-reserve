// import { cookies } from "next/headers";

// async function createLoginCookie(hash: string): Promise<void> {
//   const cookieStore = await cookies();
//   cookieStore.set({
//     name: hash,
//     value: 'login',
//     maxAge: 60 * 60 * 24 * 7, // 1 week
//     httpOnly: true,
//   })
// }

// async function checkLoginCookie(hash: string): Promise<boolean> {
//   const cookieStore = await cookies();
//   const loginCookie = cookieStore.get(hash);

//   return loginCookie !== undefined;
// }

export async function POST(request: Request): Promise<Response> {
  const body: { username: string, password: string } = await request.json();
  const { username, password } = body;
  const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${username}:${password}`));
  console.log(hash); // TODO: use different hashing function
  return new Response('OK', { status: 200 });
  // if (checkLoginCookie(body.hash)) {
  //   return new Response('OK', { status: 200 });
  // } else {

  // }

  // await createLoginCookie(body.hash);
  // return new Response('OK', { status: 200 });
}