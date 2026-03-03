"use client";

import { useState } from "react";
import { LogOut, AlertCircle, Loader2, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutModal() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  
  const router = useRouter();

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      if (refreshToken && accessToken) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );

          if (response.ok) {
            showNotification("success", "✅ Logged out successfully!");
          }
        } catch (err) {
          console.warn("Backend logout failed, continuing client cleanup");
          showNotification("info", "⚠️ Session cleared");
        }
      }
      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);

    } catch (err) {
      console.error("Logout error:", err);
      showNotification("error", "❌ Logout failed");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    showNotification("info", "👋 Welcome back!");
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-start gap-3 p-4 rounded-lg shadow-md animate-in slide-in-from-top-2 duration-300 max-w-sm ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div>
            {notification.type === "success" && (
              <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
            )}
            {notification.type === "error" && (
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            )}
            {notification.type === "info" && (
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            )}
          </div>
          <p
            className={`text-sm font-semibold ${
              notification.type === "success"
                ? "text-green-700"
                : notification.type === "error"
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            {notification.message}
          </p>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
          
          <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-100 rounded-lg mt-0.5">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Sign Out?</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Confirm before leaving</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-6 space-y-5">
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">When you sign out:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2.5">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>Your session will be terminated on all devices</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>You'll need to log in again to access EduFlow</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>All temporary data will be cleared from this device</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Save Your Work</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Make sure you've saved all grade entries and pending changes before signing out.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
