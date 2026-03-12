"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAssignPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin?tab=assignments");
  }, [router]);
  return null;
}
