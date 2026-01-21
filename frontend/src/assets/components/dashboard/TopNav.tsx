// frontend/src/assets/components/dashboard/TopNav.tsx
"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export function TopNav() {
    const pathname = usePathname();
    const isManagementPage = pathname === "/students";
    const isProfilePage = pathname.includes("/students/") && pathname !== "/students";
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Left side: Dynamic Breadcrumbs */}
      <div className="flex items-center text-xs font-medium">
        {isManagementPage && (
          <>
            <span className="text-slate-400">SchoolAdmin</span>
            <span className="mx-1 text-slate-300">›</span>
            <span className="text-cyan-600">Students</span>
          </>
        )}
        {isProfilePage && (
          <>
            <span className="text-slate-400">Students</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-800 font-bold">Student Profile</span>
          </>
        )}
      </div>

        {/* Right side: Conditional Search and Profile */}
      <div className="flex items-center gap-6">
        {/* Hide search box in Management Page */}
        {isProfilePage && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students, classes..." 
              className="w-64 pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-100 outline-none"
            />
          </div>
        )}

        {/* Notification Bell */}
        <button className="relative p-1 text-slate-500 hover:text-cyan-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Avatar */}
        <button className="h-9 w-9 rounded-full bg-amber-100 border border-amber-200 overflow-hidden hover:ring-2 hover:ring-cyan-100 transition-all">
          <img 
            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Easton"
            alt="User profile" 
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}