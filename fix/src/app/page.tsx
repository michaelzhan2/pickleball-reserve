"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import ScheduleForm from "@/components/ScheduleForm";

function checkAuth(router: AppRouterInstance): void {
  fetch("/api/auth", {
    method: "GET",
    credentials: "include",
  }).then((res: Response) => {
    if (!res.ok) {
      router.push("/auth");
    }
  });
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
  }, [router]);

  return (
    <>
      <h1>Court Scheduler</h1>
      <ScheduleForm />
    </>
  );
}
