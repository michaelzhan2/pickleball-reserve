import { cookies } from 'next/headers';
import { redirect } from "next/navigation";


async function checkAuth(value: string): Promise<boolean> {
  const res: Response = await fetch(`${process.env.API_URL}/api/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password: value })
  });

  return res.ok;
}

export default async function Home() {
  // check for auth cookie with correct value
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');

  if (authCookie === undefined) {
    redirect(`${process.env.API_URL}/auth`);
  } else {
    const isAuth = await checkAuth(authCookie.value);
    if (!isAuth) {
      redirect(`${process.env.API_URL}/auth`);
    }
  }

  return (
    <>
      <div>Hello world!</div>
    </>
  );
}
