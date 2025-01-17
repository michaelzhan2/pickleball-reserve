"use client";

import { useRouter } from "next/navigation";


export default function Auth() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    let password: string = (e.target as HTMLFormElement).password.value;
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: password })
    }).then((res: Response) => {
      if (res.ok) {
        router.push('/');
      } else {
        alert('Incorrect password');
      }
    });
  }

  return (
    <>
      <form onSubmit={ handleSubmit }>
        <label htmlFor="password">Enter password:</label>
        <input type="password" id="password" />
        <button type="submit">Submit</button>
      </form>
    </>
  )
}