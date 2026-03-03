"use client";
import React, { useEffect, useState, KeyboardEvent } from "react";
import {
  Filter,
  Search,
  Plus,
  UserPlus,
  Users,
  Calendar,
  X,
  Mail,
  Phone,
  ExternalLink,
  Edit2,
  Trash2,
  User,
  Link2,
  ChevronRight,
  Home,
  GraduationCap,
  Heart,
} from "lucide-react";
import ParentForm, {
  MyFormData,
} from "@/src/assets/components/management/ParentForm";
import LinkParentModal from "@/src/assets/components/management/LinkParentModal";
import { apiRequest } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";
import { Pagination } from "@/src/assets/components/management/Pagination";

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}
interface Parent extends MyFormData {
  id: number;
  full_name: string;
  relationship_display: string;
}

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
  class_info?: {
    id?: number;
    name?: string;
    class_name?: string;
  };
  parents?: Parent[];
}

interface LinkModalState {
  open: boolean;
  studentId: number | null;
}

interface AcademicYear {
  id: number;
  year_name: string;
  is_active: boolean;
}

interface SchoolClass {
  id: number;
  class_name: string;
}


export default function ParentEntry() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState("");
  const [yearId, setYearId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"all" | "linking">("all");
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  const [linkingInProgress, setLinkingInProgress] = useState<number | null>(
    null,
  );
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [linkModal, setLinkModal] = useState<LinkModalState>({
    open: false,
    studentId: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pageError, setPageError] = useState<any>(null);
  const resultsPerPage = 20;
  const handleApplyFilters = () => {
    setCurrentPage(1); 
    fetchParents(1, classId, yearId);
    fetchStudents(classId ? Number(classId) : null);
    setShowFilters(false);
  };

  const handleReset = () => {
    setClassId("");
    setYearId("");
    setSearchQuery("");
    fetchParents(currentPage, "", ""); 
    fetchStudents(null);
  };

  const handleDirectLink = async (studentId: number) => {
   
    if (!selectedParent) {
      setLinkModal({ open: true, studentId });
      return;
    }

    setLinkingInProgress(studentId);

    const csrfToken =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("csrftoken="))
        ?.split("=")[1] || "";

    const payload = {
      student: studentId,
      parent: selectedParent.id,
      is_primary_contact: true,
      can_pickup: true,
    };

    try {
      await apiRequest(`/student-parents/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
      });

      await fetchParents(currentPage,classId,yearId);
      await fetchStudents();

      alert(`✅ ${selectedParent.full_name} linked to student successfully!`);
    } catch (err) {
      console.error("Direct link error", err);
      setPageError(extractErrorDetail(err) || "Could not link. This connection may already exist.");
    } finally {
      setLinkingInProgress(null);
    }
  };

  const fetchParents = async (
    page:number,
    classId:string,
    yearId:string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.append("class_id", classId.toString());
      if (yearId) params.append("academic_year_id", yearId.toString());
      params.append('page',page.toString());

      const url = `/parents/${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await apiRequest<PaginatedResponse>(url);
      const data: PaginatedResponse = {
        count: response.count ?? 0,
        next: response.next ?? null,
        previous: response.previous ?? null,
        results: response.results ?? [],
      };
      setTotalResults(data.count);
      setParents((data.results as any) || []);
    } catch (err) {
      console.error("fetchParents error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId_st: number | null = null) => {
    setLoading(true);
    try {
      const url = classId_st ? `/students/?class_id=${classId_st}` : "/students/";
      const response = await apiRequest<Student[]>(url, { method: "GET" });
      setStudents((response.data as any) || []);
      fetchParents(currentPage,classId,yearId);
    } catch (err) {
      console.error("fetchStudents error", err);
      setPageError(extractErrorDetail(err) || "Failed to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiRequest<SchoolClass[]>("/classes/", {
        method: "GET",
      });
      setClasses((response.data as any) || []);
    } catch (err) {
      console.error("fetchClasses error", err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await apiRequest<AcademicYear[]>("/academic-years/", {
        method: "GET",
      });
      setAcademicYears((response.data as any) || []);
    } catch (err) {
      console.error("fetchAcademicYears error", err);
    }
  };
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  useEffect(() => {
    fetchParents(currentPage, classId, yearId);
  }, [currentPage]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchParents(currentPage,classId,yearId);
    fetchStudents();
  }, []);

  const handleCreateParent = async (payload: MyFormData) => {
    try {
      const response = await apiRequest<ApiResponse<Parent>>("/parents/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setParents((prev) => [response.data as any, ...prev]);
      setOpenForm(false);
      alert("Parent created ✅");
    } catch (err) {
      console.error("create parent", err);
      setPageError(extractErrorDetail(err) || "Could not create parent.");
    }
  };

  const handleEditParent = async (id: number, payload: MyFormData) => {
    try {
      const response = await apiRequest<Parent>(`/parents/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const updated = response.data;

      if (!updated || Array.isArray(updated)) {
        throw new Error("Invalid parent response");
      }

      setParents((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditParent(null);
      setOpenForm(false);
      alert("Parent updated ✅");
    } catch (err) {
      console.error("update parent", err);
      setPageError(extractErrorDetail(err) || "Could not update parent.");
    }
  };

  const handleDeleteParent = async (id: number) => {
    if (!confirm("Delete parent? This cannot be undone.")) return;
    try {
      await apiRequest(`/parents/${id}/`, { method: "DELETE" });
      setParents((prev) => prev.filter((p) => p.id !== id));
      alert("Deleted");
    } catch (err) {
      console.error("delete parent", err);
      setPageError(extractErrorDetail(err) || "Failed to delete.");
    }
  };
  const filteredParents = parents.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {pageError && <ErrorMessage errorDetail={pageError} className="m-4" />}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap");

        * {
          font-family: "DM Sans", sans-serif;
        }

        .font-display {
          font-family: "Crimson Pro", serif;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(217, 119, 6, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(217, 119, 6, 0.5);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out;
        }

        .animate-slide-in-up {
          animation: slideInUp 0.4s ease-out;
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .link-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, #d97706, #f59e0b);
          transform-origin: left center;
          pointer-events: none;
          z-index: 1;
        }

        .gradient-border {
          position: relative;
        }

        .gradient-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, #d97706, #f59e0b);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      <header className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 border-b border-amber-200/50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-5xl font-bold text-stone-900 mb-3">
                Family Connections
              </h1>
              <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
                Build and nurture the relationships between families and
                students. Every connection matters in creating a supportive
                educational community.
              </p>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div className="text-right">
                <div className="text-sm text-stone-500 uppercase tracking-wider font-medium mb-1">
                  Active Parents
                </div>
                <div className="font-display text-4xl font-bold text-amber-600">
                  {parents.length}
                </div>
              </div>
              <div className="h-16 w-px bg-stone-300"></div>
              <div className="text-right">
                <div className="text-sm text-stone-500 uppercase tracking-wider font-medium mb-1">
                  Students
                </div>
                <div className="font-display text-4xl font-bold text-stone-700">
                  {students.length}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setActiveView("all")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeView === "all"
                  ? "bg-stone-900 text-white shadow-lg"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              All Parents
            </button>
            <button
              onClick={() => setActiveView("linking")}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeView === "linking"
                  ? "bg-amber-600 text-white shadow-lg pulse-glow"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Link Families
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeView === "all" ? (
         
          <div className="space-y-6 animate-slide-in-up">

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all text-stone-900 placeholder:text-stone-400"
                  placeholder="Search by name or email..."
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  showFilters
                    ? "bg-stone-900 text-white"
                    : "bg-white border-2 border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={() => setOpenForm(true)}
                className="px-6 py-4 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <Plus className="w-5 h-5" />
                Add Parent
              </button>
            </div>

            {showFilters && (
              <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 animate-slide-in-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Academic Year
                    </label>
                    <select
                      value={yearId}
                      onChange={(e) => setYearId(e.target.value)}
                      className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-lg focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">All Years</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.year_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Class
                    </label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full p-3 bg-stone-50 border-2 border-stone-200 rounded-lg focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">All Classes</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.class_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 bg-stone-900 text-white py-3 rounded-lg font-semibold hover:bg-stone-800 transition-all"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-stone-300 rounded-2xl p-16 text-center">
                <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 text-lg">
                  No parents found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParents.map((parent, idx) => (
                  <div
                    key={parent.id}
                    className="group bg-white border-2 border-stone-200 rounded-2xl p-6 hover:border-amber-500 hover:shadow-xl transition-all duration-300 animate-slide-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-display text-xl font-bold shadow-lg">
                        {parent.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl font-bold text-stone-900 mb-1 truncate">
                          {parent.full_name}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            parent.relationship === "father"
                              ? "bg-blue-100 text-blue-700"
                              : parent.relationship === "mother"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {parent.relationship_display}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-stone-100">
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{parent.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span className="truncate">{parent.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/Home/profiles/parents/profile/${parent.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-all text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Profile
                      </a>
                      <button
                        onClick={() => {
                          setEditParent(parent);
                          setOpenForm(true);
                        }}
                        className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParent(parent.id)}
                        className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-slide-in-up">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-600 text-white rounded-xl">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
                    Create Family Connections
                  </h2>
                  <p className="text-stone-600 leading-relaxed mb-3">
                    <strong>Quick Linking:</strong> Select a parent, then click
                    the link button next to any student to instantly connect
                    them.
                  </p>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    💡 Tip: Click the link button without selecting a parent to
                    see all available parents to choose from.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Home className="w-6 h-6 text-amber-600" />
                    Parents
                  </h3>
                  <span className="text-sm text-stone-500">
                    {parents.length} total
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {parents.map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() =>
                        setSelectedParent(
                          selectedParent?.id === parent.id ? null : parent,
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedParent?.id === parent.id
                          ? "border-amber-500 bg-amber-50 shadow-lg gradient-border"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-lg font-bold ${
                            selectedParent?.id === parent.id
                              ? "bg-gradient-to-br from-amber-500 to-orange-600"
                              : "bg-gradient-to-br from-stone-400 to-stone-500"
                          }`}
                        >
                          {parent.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-stone-900 truncate">
                            {parent.full_name}
                          </div>
                          <div className="text-sm text-stone-500">
                            {parent.relationship_display}
                          </div>
                        </div>
                        {selectedParent?.id === parent.id && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                              ACTIVE
                            </span>
                            <ChevronRight className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-amber-600" />
                    Students
                  </h3>
                  <span className="text-sm text-stone-500">
                    {students.length} total
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {students.map((student) => {
                    const isLinked = student.parents?.some(
                      (p) => p.id === selectedParent?.id,
                    );
                    const isLinking = linkingInProgress === student.id;

                    return (
                      <div
                        key={student.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isLinked
                            ? "border-green-500 bg-green-50"
                            : isLinking
                              ? "border-amber-500 bg-amber-50 animate-pulse"
                              : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-lg font-bold ${
                              isLinked
                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                : "bg-gradient-to-br from-blue-400 to-indigo-500"
                            }`}
                          >
                            {student.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-stone-900 truncate">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-stone-500">
                              {student.admission_number} {" "}
                              {student.class_info?.class_name}
                            </div>
                            {isLinked && selectedParent && (
                              <div className="flex items-center gap-1 mt-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  Linked to {selectedParent.full_name}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDirectLink(student.id)}
                            disabled={
                              isLinking || (isLinked && selectedParent !== null)
                            }
                            className={`p-2.5 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                              isLinked && selectedParent
                                ? "bg-green-600 text-white cursor-default"
                                : isLinking
                                  ? "bg-amber-400 text-white cursor-wait"
                                  : selectedParent
                                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-lg"
                                    : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                            }`}
                            title={
                              isLinked && selectedParent
                                ? "Already linked"
                                : selectedParent
                                  ? `Link to ${selectedParent.full_name}`
                                  : "Select a parent first or click to choose"
                            }
                          >
                            {isLinking ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </>
                            ) : isLinked && selectedParent ? (
                              <Check className="w-5 h-5" />
                            ) : selectedParent ? (
                              <>
                                <Link2 className="w-4 h-4" />
                                Link
                              </>
                            ) : (
                              <UserPlus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {totalResults > resultsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        )}

        {openForm && (
          <ParentForm
            open={openForm}
            initial={editParent}
            onClose={() => {
              setOpenForm(false);
              setEditParent(null);
            }}
            onSaved={(payload) =>
              editParent
                ? handleEditParent(editParent.id, payload)
                : handleCreateParent(payload)
            }
          />
        )}

        {linkModal.open && linkModal.studentId && (
          <LinkParentModal
            open={linkModal.open}
            studentId={linkModal.studentId}
            parentsList={parents}
            onClose={() => setLinkModal({ open: false, studentId: null })}
            onLinked={async () => {
              await fetchParents(currentPage,classId,yearId);
              await fetchStudents();
              setLinkModal({ open: false, studentId: null });
              alert("✅ Parent linked successfully!");
            }}
          />
        )}
      </main>
    </div>
  );
}

const Check = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
