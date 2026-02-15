"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-slate-100 animate-pulse rounded ${className}`} />
);

interface TopNavProps {
  loading?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ loading = false }) => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("userName") || "";
    const role = localStorage.getItem("userRole") || "";
    setUserName(username);
    setUserRole(role);
  }, []);

  return (
    <header className="top-bar bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      {loading ? (
        <div className="flex items-center gap-4 w-full">
          <SkeletonBox className="h-8 w-32" />
          <SkeletonBox className="h-8 w-24" />
          <div className="flex-1 flex justify-end gap-4">
            <SkeletonBox className="h-10 w-32" />
            <SkeletonBox className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-3 items-center">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">
              Main Dashboard
            </button>

            <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-extrabold tracking-wide shadow-sm">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-900 text-sm">
                {userName || "User"}
              </p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                {userRole || "Role"}
              </p>
            </div>

            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName || "User"
              )}&background=random`}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
        </div>
      )}
    </header>
  );
};
