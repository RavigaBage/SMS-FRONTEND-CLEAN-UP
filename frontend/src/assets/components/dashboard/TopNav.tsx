"use client";

import React, { useEffect, useState,useCallback } from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-slate-100 animate-pulse rounded ${className}`} />
);

interface TopNavProps {
  loading?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ loading = false }) => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [Notifications,setNotify] = useState(0);


  const GetAmissionNotification =  useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("unapproved", '');
      const res: any = await apiRequest(`/admission?${params.toString()}`);
      setNotify((res?.results).length ?? 0);
    } catch (e: any) {
      console.log(e.message || "Failed to load admissions.");
    } 
  }, []);


  useEffect(() => {
    const username = localStorage.getItem("userName") || "";
    const role = localStorage.getItem("userRole") || "";
    setUserName(username);
    setUserRole(role);
  }, []);
 useEffect(() => { GetAmissionNotification();  }, [GetAmissionNotification]);
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
        <div className="flex justify-between items-center w-full m-[30px]">
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
            <a href="/Home/management/Admission/"><div className="relative inline-flex items-center justify-center">
                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Bell size={18} className="text-gray-700" />

                  {Notifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                      {Notifications > 99 ? "99+" : Notifications}
                    </span>
                  )}
                </button>
              </div></a>
            
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
                userName || "User",
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
