"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, SlidersHorizontal, Download, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { StaffTable, StaffMember } from "@/src/assets/components/management/StaffTable";
import { AddStaffModal } from "@/src/assets/components/management/AddStaff";
import { Pagination } from "@/src/assets/components/management/Pagination";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export default function StaffDirectoryPage() {
  // State Management
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);

  const resultsPerPage = 10;

  // Fetch Logic
  const fetchStaff = async (page: number, search: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: search,
      });

      const data: PaginatedResponse = await apiRequest(`/staff/?${query}`, {
        method: "GET",
      });

      // Map backend data to our StaffMember interface
      const formattedStaff = data.results.map((s: any) => ({
        id: s.user_id || s.id, // Support for the manual user_id
        fullName: `${s.first_name} ${s.last_name}`,
        role: s.role || "Staff",
        department: s.department || "General",
        email: s.email,
        phone: s.phone || "N/A",
        status: s.status || "Active",
        profileImage: s.profile_image || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=0D9488&color=fff`,
      }));

      setStaff(formattedStaff);
      setTotalResults(data.count);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on page or search change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStaff(currentPage, searchTerm);
    }, 300); // Debounce search to prevent too many API calls

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Staff Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage faculty records and system access</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border rounded-xl hover:bg-slate-50 transition-all">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
          >
            <UserPlus size={18} /> Add Staff
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border rounded-t-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="animate-spin text-slate-400" size={18} />}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg border">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* 3. Table & Pagination Container */}
      <div className={`relative transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-hidden border-x border-slate-200">
          <StaffTable staff={staff} />
        </div>

        {staff.length > 0 ? (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        ) : !loading && (
          <div className="bg-white border-x border-b rounded-b-2xl p-20 text-center">
            <p className="text-slate-400 font-medium">No staff members found matching your search.</p>
          </div>
        )}
      </div>

      {/* 4. Modals */}
      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchStaff(currentPage, searchTerm); // Refresh data
        }} 
      />
    </div>
  );
}