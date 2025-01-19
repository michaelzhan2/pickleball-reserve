"use client"

import { useRouter } from "next/navigation";

function checkAuth() {
  const router = useRouter();
  fetch('/api/auth', {
    method: 'GET',
    credentials: 'include'
  }).then((res: Response) => {
    if (!res.ok) {
      router.push('/auth');
    }
  })
}

export default function Home() {
  checkAuth();

  return (
    <>
      <div>Hello world!</div>
    </>
  );
}
