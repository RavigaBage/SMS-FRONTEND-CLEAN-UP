"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Search, ChevronDown, UserPlus, Shield, BookOpen, DollarSign, GraduationCap, MoreVertical, Pencil, Power, KeyRound, Mail, X, Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import Pagination from "@/src/assets/components/dashboard/Pagnation";
import Loading from "@/src/assets/components/dashboard/loader";

interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "headmaster" | "bursar" | "teacher";
  role_display: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  created_by_username: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admin: { label: "Administrator", color: "#1e3a5f", bg: "#e8eef7", icon: <Shield size={11} /> },
  headmaster: { label: "Headmaster", color: "#5b3a8f", bg: "#f0ebfa", icon: <GraduationCap size={11} /> },
  bursar: { label: "Bursar", color: "#1a6b4a", bg: "#e6f4ed", icon: <DollarSign size={11} /> },
  teacher: { label: "Teacher", color: "#8f5a1a", bg: "#faf0e6", icon: <BookOpen size={11} /> },
};

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fetchLoader, setfetchLoader] = useState(false);
  const [pagination, setPagination] = useState<PaginatedResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateUserForm>({
    username: "", email: "", password: "", role: "", is_active: true,
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    userId: 0, newPassword: "", confirmPassword: "",
  });
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUser, setInviteUser] = useState<User | null>(null);
  const [inviteSending, setInviteSending] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { fetchUsers(); }, [currentPage, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { if (searchQuery || searchQuery === "") fetchUsers(); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = `/users/?page=${currentPage}`;
      if (roleFilter) endpoint += `&role=${roleFilter}`;
      if (statusFilter) endpoint += `&is_active=${statusFilter}`;
      if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      const response = await apiRequest<User>(endpoint);
      if (response.results) {
        setUsers(response.results);
        setPagination({ count: response.count || 0, next: response.next || null, previous: response.previous || null, results: response.results });
      } else {
        const data = response.data;
        if (Array.isArray(data)) setUsers(data.filter((u): u is User => u !== null));
        else if (data) setUsers([data]);
        else setUsers([]);
      }
    } catch { showMessage("error", "Failed to fetch users"); }
    finally { setLoading(false); }
  };

  const extractErrorMessage = (detail: string): string => {
    if (!detail) return "Something went wrong.";
    try {
      const matches = [...detail.matchAll(/string='([^']+)'/g)];
      if (matches.length > 0) return matches.map((m) => m[1]).join(", ");
      const jsonString = detail.replace(/'/g, '"').replace(/\bNone\b/g, "null").replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false");
      const parsed = JSON.parse(jsonString);
      const firstKey = Object.keys(parsed)[0];
      const firstVal = parsed[firstKey];
      return Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
    } catch { return detail; }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setfetchLoader(true);
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      showMessage("error", "Please fill in all required fields");
      setfetchLoader(false);
      return;
    }
    try {
      const response = await apiRequest("/users/", { method: "POST", body: JSON.stringify(formData) });
      if (response?.data === null) { showMessage("error", extractErrorMessage(response?.error as any) || "Failed to create user"); setfetchLoader(false); return; }
      showMessage("success", "User created successfully");
      setModalOpen(false); resetForm(); fetchUsers();
    } catch (err: any) { showMessage("error", extractErrorMessage(err?.detail) || err?.message || "Failed to create user"); }
    setfetchLoader(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setfetchLoader(true);
    if (!selectedUser) return;
    try {
      await apiRequest(`/users/${selectedUser.id}/`, { method: "PATCH", body: JSON.stringify({ username: formData.username, email: formData.email, role: formData.role, is_active: formData.is_active }) });
      showMessage("success", "User updated successfully");
      setModalOpen(false); setIsEditMode(false); resetForm(); fetchUsers();
    } catch (error: any) { showMessage("error", error.message || "Failed to update user"); }
    setfetchLoader(false);
  };

  const handleDeactivateUser = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await apiRequest(`/users/${userId}/${action}/`, { method: "POST" });
      showMessage("success", `User ${action}d successfully`); fetchUsers();
    } catch (error: any) { showMessage("error", error.message || `Failed to ${action} user`); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) { showMessage("error", "Passwords do not match"); return; }
    if (resetPasswordData.newPassword.length < 10) { showMessage("error", "Password must be at least 10 characters long"); return; }
    try {
      setfetchLoader(true);
      await apiRequest(`/users/${resetPasswordData.userId}/change_password/`, { method: "POST", body: JSON.stringify({ new_password: resetPasswordData.newPassword, confirm_password: resetPasswordData.confirmPassword }) });
      showMessage("success", "Password reset successfully");
      setIsResetPasswordModalOpen(false);
      setResetPasswordData({ userId: 0, newPassword: "", confirmPassword: "" });
    } catch (error: any) { showMessage("error", error.message || "Failed to reset password"); }
    setfetchLoader(false);
  };

  const handleSendInvite = async () => {
    if (!inviteUser) return;
    setInviteSending(true);
    try {
      await apiRequest(`/users/${inviteUser.id}/send_invite/`, { method: "POST" });
      showMessage("success", `Invite sent to ${inviteUser.email}`);
      setIsInviteModalOpen(false); setInviteUser(null);
    } catch (error: any) { showMessage("error", error.message || "Failed to send invite"); }
    setInviteSending(false);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ username: user.username, email: user.email, password: "", role: user.role, is_active: user.is_active });
    setIsEditMode(true); setModalOpen(true); setOpenMenuId(null);
  };

  const openResetPasswordModal = (userId: number) => {
    setResetPasswordData({ userId, newPassword: "", confirmPassword: "" });
    setIsResetPasswordModalOpen(true); setOpenMenuId(null);
  };

  const openInviteModal = (user: User) => {
    setInviteUser(user); setIsInviteModalOpen(true); setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", password: "", role: "", is_active: true });
    setSelectedUser(null); setIsEditMode(false);
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text }); setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-GB", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const totalPages = pagination ? Math.ceil(pagination.count / 10) : 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ua-root * { box-sizing: border-box; }

        .ua-root {
          font-family: 'DM Sans', sans-serif;
          background: #f7f8fc;
          min-height: 100vh;
          padding: 32px;
          color: #1a2540;
        }

        .ua-toast {
          position: fixed; top: 24px; right: 24px; z-index: 99999;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 20px; border-radius: 12px;
          font-size: 13.5px; font-weight: 500;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          animation: slideIn 0.3s ease;
          max-width: 360px;
        }
        .ua-toast.success { background: #fff; border-left: 4px solid #2d9e6b; color: #1a4a35; }
        .ua-toast.error { background: #fff; border-left: 4px solid #d94f4f; color: #4a1a1a; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .ua-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .ua-header-text h1 {
          font-family: 'Lora', serif;
          font-size: 26px; font-weight: 600; color: #1a2540; margin: 0 0 4px;
          letter-spacing: -0.3px;
        }
        .ua-header-text p { font-size: 13.5px; color: #8090b0; margin: 0; font-weight: 400; }

        .ua-btn-primary {
          display: flex; align-items: center; gap: 8px;
          background: #1e3a5f; color: #fff;
          border: none; padding: 11px 20px; border-radius: 10px;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .ua-btn-primary:hover { background: #162d4a; transform: translateY(-1px); }
        .ua-btn-primary:active { transform: translateY(0); }

        .ua-controls {
          display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
        }
        .ua-search {
          flex: 1; min-width: 200px; position: relative;
        }
        .ua-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #8090b0; }
        .ua-search input {
          width: 100%; padding: 10px 14px 10px 38px;
          border: 1.5px solid #e4e9f2; border-radius: 10px;
          font-size: 13.5px; background: #fff; color: #1a2540;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .ua-search input:focus { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
        .ua-search input::placeholder { color: #b0bdd0; }

        .ua-select-wrap { position: relative; }
        .ua-select-wrap svg { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #8090b0; pointer-events: none; }
        .ua-select {
          padding: 10px 32px 10px 14px;
          border: 1.5px solid #e4e9f2; border-radius: 10px;
          font-size: 13.5px; background: #fff; color: #1a2540;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          appearance: none; outline: none; min-width: 130px;
          transition: border-color 0.2s;
        }
        .ua-select:focus { border-color: #1e3a5f; }

        .ua-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #e8edf5;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(30,58,95,0.06);
        }

        .ua-table { width: 100%; border-collapse: collapse;}
        .ua-table thead tr {
          background: #f7f9fc;
          border-bottom: 1.5px solid #e8edf5;
          
        }
        .ua-table th {
          padding: 13px 18px;
          text-align: left; font-size: 11px; font-weight: 600;
          color: #8090b0; letter-spacing: 0.08em; text-transform: uppercase;
          white-space: nowrap;
        }

        .ua-table td {
          padding: 15px 18px;
          font-size: 13.5px; color: #2a3a5a;
          border-bottom: 1px solid #f0f4fa;
          vertical-align: middle;
        }
        .ua-table tbody tr:last-child td { border-bottom: none; }
        .ua-table tbody tr { transition: background 0.15s; }
        .ua-table tbody tr:hover { background: #fafbfe; }

        .ua-username { font-weight: 600; color: #1a2540; display: flex; align-items: center; gap: 9px; }
        .ua-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          background: #e8eef7; color: #1e3a5f;
        }

        .ua-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 6px;
          font-size: 11.5px; font-weight: 500;
        }

        .ua-status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .ua-status-active { color: #2d9e6b; font-weight: 500; font-size: 13px; }
        .ua-status-inactive { color: #b0bdd0; font-weight: 500; font-size: 13px; }

        .ua-date { font-size: 12.5px; color: #8090b0; }

        /* Action menu */
        .ua-menu-wrap { position: relative; }
        .ua-menu-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #e4e9f2; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; color: #8090b0;
        }
        .ua-menu-btn:hover { background: #f0f4fa; border-color: #c8d4e8; color: #1a2540; }
        .ua-menu-btn.open { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }

        .ua-dropdown {
          position: absolute; right: 60px; top: -60px;
          background: #fff; border: 1.5px solid #e4e9f2;
          border-radius: 12px; min-width: 200px; z-index: 100;
          box-shadow: 0 8px 32px rgba(30,58,95,0.12);
          overflow: hidden; padding: 6px;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .ua-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          color: #2a3a5a; transition: background 0.12s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .ua-dropdown-item:hover { background: #f0f4fa; }
        .ua-dropdown-item.danger { color: #d94f4f; }
        .ua-dropdown-item.danger:hover { background: #fdf0f0; }
        .ua-dropdown-item.activate { color: #2d9e6b; }
        .ua-dropdown-item.activate:hover { background: #e6f4ed; }
        .ua-dropdown-divider { height: 1px; background: #f0f4fa; margin: 4px 0; }

        .ua-empty {
          padding: 64px 24px; text-align: center; color: #b0bdd0;
        }
        .ua-empty-icon { margin: 0 auto 16px; width: 48px; height: 48px; border-radius: 12px; background: #f0f4fa; display: flex; align-items: center; justify-content: center; color: #c8d4e8; }
        .ua-empty p { font-size: 14px; margin: 0; }

        .ua-loading {
          padding: 64px 24px; text-align: center;
        }
        .ua-spinner {
          width: 32px; height: 32px; border: 2.5px solid #e8edf5;
          border-top-color: #1e3a5f; border-radius: 50%;
          animation: spin 0.7s linear infinite; margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ua-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-top: 1.5px solid #f0f4fa;
          background: #fafbfe;
        }
        .ua-page-info { font-size: 13px; color: #8090b0; }
        .ua-page-btns { display: flex; gap: 6px; }
        .ua-page-btn {
          width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #e4e9f2;
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 13px; color: #2a3a5a; font-weight: 500;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ua-page-btn:hover:not(:disabled) { background: #f0f4fa; border-color: #c8d4e8; }
        .ua-page-btn.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
        .ua-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Modal */
        .ua-overlay {
          position: fixed; inset: 0; background: rgba(26,37,64,0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; padding: 24px;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .ua-modal {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 440px;
          box-shadow: 0 24px 64px rgba(26,37,64,0.18);
          animation: modalUp 0.25s ease;
          overflow: hidden;
        }
        @keyframes modalUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .ua-modal-header {
          padding: 24px 28px 0;
          display: flex; align-items: flex-start; justify-content: space-between;
        }
        .ua-modal-title {
          font-family: 'Lora', serif;
          font-size: 20px; font-weight: 600; color: #1a2540; margin: 0 0 4px;
        }
        .ua-modal-sub { font-size: 13px; color: #8090b0; margin: 0; }

        .ua-modal-close {
          width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e4e9f2;
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #8090b0; flex-shrink: 0;
          transition: all 0.15s; margin-top: -4px;
        }
        .ua-modal-close:hover { background: #f0f4fa; color: #1a2540; }

        .ua-modal-body { padding: 20px 28px 28px; }

        .ua-field { margin-bottom: 16px; }
        .ua-label {
          display: block; font-size: 12.5px; font-weight: 600;
          color: #4a5a7a; margin-bottom: 6px; letter-spacing: 0.02em;
        }
        .ua-req { color: #d94f4f; margin-left: 2px; }
        .ua-input {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid #e4e9f2; border-radius: 10px;
          font-size: 13.5px; color: #1a2540;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }
        .ua-input:focus { border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
        .ua-input::placeholder { color: #b0bdd0; }

        .ua-pw-wrap { position: relative; }
        .ua-pw-wrap .ua-input { padding-right: 40px; }
        .ua-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #b0bdd0;
          display: flex; align-items: center; padding: 0;
          transition: color 0.15s;
        }
        .ua-pw-toggle:hover { color: #4a5a7a; }

        .ua-modal-footer {
          display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px;
        }
        .ua-btn-secondary {
          padding: 10px 18px; border-radius: 10px;
          border: 1.5px solid #e4e9f2; background: #fff;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          color: #4a5a7a; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .ua-btn-secondary:hover { background: #f0f4fa; }

        /* Invite modal specific */
        .ua-invite-card {
          background: #f7f9fc; border: 1.5px solid #e4e9f2;
          border-radius: 12px; padding: 16px; margin: 16px 0;
          display: flex; align-items: center; gap: 14px;
        }
        .ua-invite-avatar {
          width: 44px; height: 44px; border-radius: 10px;
          background: #e8eef7; color: #1e3a5f;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; flex-shrink: 0;
        }
        .ua-invite-name { font-weight: 600; font-size: 14px; color: #1a2540; margin: 0 0 3px; }
        .ua-invite-email { font-size: 12.5px; color: #8090b0; margin: 0; }

        .ua-invite-note {
          background: #e8f4ee; border-radius: 10px; padding: 12px 14px;
          font-size: 13px; color: #1a4a35; display: flex; gap: 8px;
          margin-top: 4px; align-items: flex-start;
        }

        .ua-loader-bar {
          height: 3px; background: #e8edf5; overflow: hidden;
        }
        .ua-loader-bar-inner {
          height: 100%; background: #1e3a5f;
          animation: loadBar 1.5s ease-in-out infinite;
          width: 40%;
        }
        @keyframes loadBar {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(350%); }
        }

        @media (max-width: 768px) {
          .ua-root { padding: 16px; }
          .ua-header { flex-direction: column; gap: 16px; }
          .ua-controls { flex-direction: column; }
          .ua-search { width: 100%; }
          .ua-select { width: 100%; }
          .ua-table th:nth-child(5), .ua-table td:nth-child(5),
          .ua-table th:nth-child(6), .ua-table td:nth-child(6) { display: none; }
        }
      `}</style>

      <div className="ua-root">
        {message && (
          <div className={`ua-toast ${message.type}`}>
            {message.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="ua-header">
          <div className="ua-header-text">
            <h1>User Accounts</h1>
            <p>Manage staff access, roles, and permissions across the platform</p>
          </div>
          <button className="ua-btn-primary" onClick={() => { resetForm(); setModalOpen(true); }}>
            <UserPlus size={15} /> Add User
          </button>
        </div>

        {/* Controls */}
        <div className="ua-controls">
          <div className="ua-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="ua-select-wrap">
            <select className="ua-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="headmaster">Headmaster</option>
              <option value="bursar">Bursar</option>
              <option value="teacher">Teacher</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="ua-select-wrap">
            <select className="ua-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Table */}
        <div className="ua-card">
          {loading ? (
            <div className="ua-loading">
              <div className="ua-spinner" />
              <p style={{ color: "#8090b0", fontSize: 13 }}>Loading users…</p>
            </div>
          ) : users.length > 0 ? (
            <>
              <table className="ua-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Joined</th>
                    <th>Created By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role = roleConfig[user.role] || { label: user.role_display, color: "#1a2540", bg: "#f0f4fa", icon: null };
                    const initials = user.username.slice(0, 2).toUpperCase();
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="ua-username">
                            <div className="ua-avatar" style={{ background: role.bg, color: role.color }}>{initials}</div>
                            <div>
                              <div>{user.username}</div>
                              <div style={{ fontSize: 12, color: "#8090b0", fontWeight: 400 }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ua-role-badge" style={{ background: role.bg, color: role.color }}>
                            {role.icon} {role.label}
                          </span>
                        </td>
                        <td>
                          {user.is_active ? (
                            <span className="ua-status-active">
                              <span className="ua-status-dot" style={{ background: "#2d9e6b" }} />Active
                            </span>
                          ) : (
                            <span className="ua-status-inactive">
                              <span className="ua-status-dot" style={{ background: "#c8d4e8" }} />Inactive
                            </span>
                          )}
                        </td>
                        <td><span className="ua-date">{formatDate(user.last_login)}</span></td>
                        <td><span className="ua-date">{formatDate(user.date_joined)}</span></td>
                        <td><span style={{ fontSize: 13, color: "#8090b0" }}>{user.created_by_username || "System"}</span></td>
                        <td>
                          <div className="ua-menu-wrap" ref={openMenuId === user.id ? menuRef : null}>
                            <button
                              className={`ua-menu-btn ${openMenuId === user.id ? "open" : ""}`}
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            >
                              <MoreVertical size={15} />
                            </button>
                            {openMenuId === user.id && (
                              <div className="ua-dropdown">
                                <button className="ua-dropdown-item" onClick={() => openEditModal(user)}>
                                  <Pencil size={14} /> Edit Details
                                </button>
                                <button className="ua-dropdown-item" onClick={() => openInviteModal(user)}>
                                  <Mail size={14} /> Send Invite Email
                                </button>
                                <div className="ua-dropdown-divider" />
                                <button className="ua-dropdown-item" onClick={() => { openResetPasswordModal(user.id); }}>
                                  <KeyRound size={14} /> Reset Password
                                </button>
                                <button
                                  className={`ua-dropdown-item ${user.is_active ? "danger" : "activate"}`}
                                  onClick={() => { handleDeactivateUser(user.id, user.is_active); setOpenMenuId(null); }}
                                >
                                  <Power size={14} /> {user.is_active ? "Deactivate User" : "Activate User"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {pagination && pagination.count > 0 && (
                <div className="ua-pagination">
                  <span className="ua-page-info">
                    Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, pagination.count)} of {pagination.count} users
                  </span>
                  <div className="ua-page-btns">
                    <button className="ua-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                      <button key={page} className={`ua-page-btn ${page === currentPage ? "active" : ""}`} onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    ))}
                    <button className="ua-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="ua-empty">
              <div className="ua-empty-icon"><UserPlus size={22} /></div>
              <p>No users found. Adjust your filters or add a new user.</p>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="ua-overlay" onClick={() => { setModalOpen(false); resetForm(); }}>
            <div className="ua-modal" onClick={(e) => e.stopPropagation()}>
              {fetchLoader && <div className="ua-loader-bar"><div className="ua-loader-bar-inner" /></div>}
              <div className="ua-modal-header">
                <div>
                  <p className="ua-modal-title">{isEditMode ? "Edit User" : "Add New User"}</p>
                  <p className="ua-modal-sub">{isEditMode ? "Update account details and role" : "Create a staff account and assign a role"}</p>
                </div>
                <button className="ua-modal-close" onClick={() => { setModalOpen(false); resetForm(); }}><X size={15} /></button>
              </div>
              <div className="ua-modal-body">
                <form onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}>
                  <div className="ua-field">
                    <label className="ua-label">Username <span className="ua-req">*</span></label>
                    <input className="ua-input" type="text" placeholder="e.g. j.mensah" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                  </div>
                  <div className="ua-field">
                    <label className="ua-label">Email Address <span className="ua-req">*</span></label>
                    <input className="ua-input" type="email" placeholder="e.g. j.mensah@school.edu.gh" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  {!isEditMode && (
                    <div className="ua-field">
                      <label className="ua-label">Password <span className="ua-req">*</span></label>
                      <div className="ua-pw-wrap">
                        <input className="ua-input" type={showPassword ? "text" : "password"} placeholder="Minimum 10 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} minLength={10} required />
                        <button type="button" className="ua-pw-toggle" onClick={() => setShowPassword((p) => !p)}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div className="ua-field" style={{ flex: 1 }}>
                      <label className="ua-label">Role <span className="ua-req">*</span></label>
                      <div className="ua-select-wrap" style={{ width: "100%" }}>
                        <select className="ua-select" style={{ width: "100%" }} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                          <option value="">Select role</option>
                          <option value="admin">Administrator</option>
                          <option value="headmaster">Headmaster</option>
                          <option value="bursar">Bursar</option>
                          <option value="teacher">Teacher</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                    </div>
                    <div className="ua-field" style={{ flex: 1 }}>
                      <label className="ua-label">Status</label>
                      <div className="ua-select-wrap" style={{ width: "100%" }}>
                        <select className="ua-select" style={{ width: "100%" }} value={formData.is_active ? "true" : "false"} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="ua-modal-footer">
                    <button type="button" className="ua-btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancel</button>
                    <button type="submit" className="ua-btn-primary">{isEditMode ? "Save Changes" : "Create User"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {isResetPasswordModalOpen && (
          <div className="ua-overlay" onClick={() => setIsResetPasswordModalOpen(false)}>
            <div className="ua-modal" onClick={(e) => e.stopPropagation()}>
              {fetchLoader && <div className="ua-loader-bar"><div className="ua-loader-bar-inner" /></div>}
              <div className="ua-modal-header">
                <div>
                  <p className="ua-modal-title">Reset Password</p>
                  <p className="ua-modal-sub">Set a new password for this account</p>
                </div>
                <button className="ua-modal-close" onClick={() => setIsResetPasswordModalOpen(false)}><X size={15} /></button>
              </div>
              <div className="ua-modal-body">
                <form onSubmit={handleResetPassword}>
                  <div className="ua-field">
                    <label className="ua-label">New Password <span className="ua-req">*</span></label>
                    <input className="ua-input" type="password" placeholder="Minimum 10 characters" value={resetPasswordData.newPassword} onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })} minLength={10} required />
                  </div>
                  <div className="ua-field">
                    <label className="ua-label">Confirm Password <span className="ua-req">*</span></label>
                    <input className="ua-input" type="password" placeholder="Repeat new password" value={resetPasswordData.confirmPassword} onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })} minLength={10} required />
                  </div>
                  <div className="ua-modal-footer">
                    <button type="button" className="ua-btn-secondary" onClick={() => setIsResetPasswordModalOpen(false)}>Cancel</button>
                    <button type="submit" className="ua-btn-primary"><KeyRound size={14} /> Reset Password</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Send Invite Modal */}
        {isInviteModalOpen && inviteUser && (
          <div className="ua-overlay" onClick={() => { setIsInviteModalOpen(false); setInviteUser(null); }}>
            <div className="ua-modal" onClick={(e) => e.stopPropagation()}>
              {inviteSending && <div className="ua-loader-bar"><div className="ua-loader-bar-inner" /></div>}
              <div className="ua-modal-header">
                <div>
                  <p className="ua-modal-title">Send Platform Invite</p>
                  <p className="ua-modal-sub">Notify this user and grant access to the platform</p>
                </div>
                <button className="ua-modal-close" onClick={() => { setIsInviteModalOpen(false); setInviteUser(null); }}><X size={15} /></button>
              </div>
              <div className="ua-modal-body">
                <div className="ua-invite-card">
                  <div className="ua-invite-avatar">
                    {inviteUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="ua-invite-name">{inviteUser.username}</p>
                    <p className="ua-invite-email">{inviteUser.email}</p>
                  </div>
                  <span className="ua-role-badge" style={{ marginLeft: "auto", ...(() => { const r = roleConfig[inviteUser.role]; return r ? { background: r.bg, color: r.color } : {}; })() }}>
                    {roleConfig[inviteUser.role]?.label || inviteUser.role_display}
                  </span>
                </div>
                <div className="ua-invite-note">
                  <Check size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span>An invitation email will be sent with a link to set up their account and access the school management platform.</span>
                </div>
                <div className="ua-modal-footer" style={{ marginTop: 20 }}>
                  <button type="button" className="ua-btn-secondary" onClick={() => { setIsInviteModalOpen(false); setInviteUser(null); }}>Cancel</button>
                  <button type="button" className="ua-btn-primary" onClick={handleSendInvite} disabled={inviteSending}>
                    <Mail size={14} /> {inviteSending ? "Sending…" : "Send Invite"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}