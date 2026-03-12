"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAgenciesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin?tab=agencies");
  }, [router]);
  return null;
}
