"use client";

import { useState } from "react";


export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  
  return (
    <>
      <div>Hello world!</div>
    </>
  );
}
