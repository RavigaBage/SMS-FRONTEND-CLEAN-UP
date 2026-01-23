// frontend/src/assets/components/dashboard/Sidebar.tsx
"use client";

import { 
  LayoutDashboard, Users, GraduationCap, 
  School, Calendar, Settings, LogOut, Landmark 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <GraduationCap size={20} />, label: "Students", href: "/dashboard/students" },
    { icon: <Users size={20} />, label: "Teachers", href: "/dashboard/teachers" },
    { icon: <School size={20} />, label: "Classes", href: "/dashboard/classes" },
    { icon: <Landmark size={20} />, label: "Finance", href: "/dashboard/finance" },
    { icon: <Calendar size={20} />, label: "Attendance", href: "/dashboard/attendance" },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Persistent EduManager Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg shadow-slate-200">
          <School size={24} />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-slate-800 block leading-none">EduManager</span>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 block">Management System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.label === "Students" 
            ? pathname.startsWith("/students") 
            : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-cyan-50 text-cyan-600 shadow-sm shadow-cyan-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action Section */}
      <div className="p-4 border-t bg-slate-50/50">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 transition-colors text-sm font-bold rounded-xl hover:bg-red-50">
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
}