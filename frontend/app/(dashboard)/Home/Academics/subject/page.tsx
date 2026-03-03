"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, BookOpen } from "lucide-react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import SkeletonTable from "@/components/ui/SkeletonLoader";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { ErrorState } from "@/src/assets/components/dashboard/ErrorState";
import EnrollPopup from '@/components/ui/subjectPopup';

export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

export interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subject[];
}

const PAGE_SIZE = 20;

const SUBJECT_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "text-blue-600" },
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", icon: "text-purple-600" },
  { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700", icon: "text-green-600" },
  { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "text-amber-600" },
  { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-100 text-pink-700", icon: "text-pink-600" },
  { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", icon: "text-indigo-600" },
];

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
  });
  const [active, setActive] = useState(false);
  const [clickVelvet, setClickVelvet] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const checkVelvetClick = useRef<HTMLTableRowElement>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchSubjects = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/?page=${pageNumber}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data: SubjectApiResponse = await res.json();
      setTotalCount(data.count);
      setSubjects(data.results || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(page);
  }, [page]);

  const updateFormField = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePopup = () => {
    if (active) setSelectedId(null);
    setActive(!active);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/`, {
        method: "DELETE",
      });
      const newCount = totalCount - 1;
      const newTotalPages = Math.ceil(newCount / PAGE_SIZE);
      if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
      else fetchSubjects(page);
      setTotalCount(newCount);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleStartEdit = (item: Subject) => {
    setSelectedId(item.id);
    setFormData({
      subject_name: item.subject_name,
      subject_code: item.subject_code,
    });
    setActive(true);
    setClickVelvet(null);
  };

  const handleAddNew = () => {
    setFormData({ subject_name: "", subject_code: "" });
    if (active) setSelectedId(null);
    setActive(!active);
  };

  const handleVelvetToggle = (index: number) =>
    setClickVelvet((prev) => (prev === index ? null : index));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setClickVelvet(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        checkVelvetClick.current &&
        !checkVelvetClick.current.contains(event.target as Node)
      )
        setClickVelvet(null);
    };
    if (clickVelvet !== null)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clickVelvet]);

  const filtered = subjects.filter(
    (s) =>
      s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
 
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <BookOpen size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Academic Management
                  </p>
                  <h1 className="text-4xl font-black uppercase tracking-tight">
                    Subjects
                  </h1>
                </div>
              </div>
              <p className="text-slate-300 font-medium">
                Manage all academic subjects and their codes
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
            >
              <Plus size={20} />
              New Subject
            </button>
          </div>
        </div>
      </div>

      <EnrollPopup
        active={active}
        togglePopup={handlePopup}
        formData={formData}
        fieldNames={["student", "class_obj"]}
        setFormData={updateFormField}
        selectedIM={selectedId}
        onSuccess={() => {
          fetchSubjects(page);
          handlePopup();
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
 
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-slate-600 text-sm font-bold uppercase tracking-wider mb-2">Total Subjects</p>
            <p className="text-3xl font-black text-slate-900">{totalCount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-slate-600 text-sm font-bold uppercase tracking-wider mb-2">Pages</p>
            <p className="text-3xl font-black text-slate-900">{totalPages}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-slate-600 text-sm font-bold uppercase tracking-wider mb-2">Current Page</p>
            <p className="text-3xl font-black text-slate-900">{page}</p>
          </div>
          <div className="relative group flex align:center h-10">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" 
              size={18} 
            />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 font-medium outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === "grid"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === "table"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Table View
          </button>
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : viewMode === "grid" ? (

          <>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filtered.map((subject, index) => {
                  const color = getColor(index);
                  return (
                    <div
                      key={subject.id}
                      className={`group ${color.bg} border-2 ${color.border} rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer relative`}
                    >
                      <div className={`absolute top-4 right-4 p-2 rounded-lg ${color.badge} bg-opacity-50`}>
                        <BookOpen size={20} className={color.icon} />
                      </div>

                      <div className="mb-4 pr-12">
                        <h3 className="text-lg font-black text-slate-900 mb-2">
                          {subject.subject_name}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${color.badge}`}>
                          {subject.subject_code}
                        </span>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleStartEdit(subject)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ErrorState code={6} message="No Subjects Found" />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((subject, index) => {
                    const color = getColor(index);
                    return (
                      <tr
                        key={subject.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                        ref={clickVelvet === index ? checkVelvetClick : null}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">{subject.subject_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${color.badge}`}>
                            {subject.subject_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => handleVelvetToggle(index)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} className="text-slate-600" />
                            </button>

                            {clickVelvet === index && (
                              <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                <button
                                  onClick={() => handleStartEdit(subject)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 text-sm font-semibold text-blue-600 flex items-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(subject.id)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm font-semibold text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <ErrorState code={6} message="No Subjects Found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
  

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalResults={totalCount}
            resultsPerPage={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
    
  );
}