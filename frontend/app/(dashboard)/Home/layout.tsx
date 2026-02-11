"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { TopNav } from "@/src/assets/components/dashboard/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl px-10 py-8 flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <h2 className="text-lg font-semibold text-gray-800">
          Verifying your session
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we prepare your dashboard.
        </p>
      </div>
    </div>


    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="content-shell">
        <TopNav />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
