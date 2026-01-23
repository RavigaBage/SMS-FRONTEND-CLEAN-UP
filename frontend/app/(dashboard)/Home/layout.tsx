// frontend/src/app/dashboard/layout.tsx
import Sidebar from "@/components/Sidebar"
import { TopNav } from "@/src/assets/components/dashboard/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      {/* Side Navigation Bar on the left as seen in screen.png */}
      <Sidebar />

      <div className="content-shell">
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>

  );
}