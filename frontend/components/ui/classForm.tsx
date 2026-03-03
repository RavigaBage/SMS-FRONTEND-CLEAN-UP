"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { X, Plus, Check, AlertCircle, ChevronDown } from "lucide-react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface TeacherBase {
  id: number;
  first_name: string;
  last_name: string;
}

interface YearsModel {
  end_date: string;
  id: number;
  is_current: boolean;
  start_date: string;
  year_name: string;
}

type ClassFormProps = {
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData: (field: string, value: any) => void;
  isDeleting: Boolean;
  isUpdating: Boolean;
  onSuccess?: (payload?: any) => void;
};

const SUBJECT_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800" },
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-800" },
  { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800" },
  { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800" },
  { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-100 text-pink-800" },
  { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800" },
];

export default function classForm({
  formData,
  fieldNames,
  setFormData,
  isDeleting,
  isUpdating,
  onSuccess,
}: ClassFormProps) {
  const [teachers, setTeachers] = useState<TeacherBase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [AcademicYearList, setAcademicYearList] = useState<YearsModel[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "assignment" | "subjects">("basic");

 
  const fetchTeachers = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setTeachers(data.results || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };


  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setSubjects(data.results || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    setAcademicYearList(handleYearSync());
  }, []);

  useEffect(() => {
    if (!isUpdating || !Array.isArray(formData.subjects) || subjects.length === 0) return;

    const normalized = formData.subjects
      .map((entry: Subject | number) => {
        if (typeof entry === "number") {
          return subjects.find((s) => s.id === entry) || null;
        }
        return entry;
      })
      .filter(Boolean) as Subject[];

    setSelectedSubjects(normalized);
  }, [isUpdating, formData.subjects, subjects]);

  const handleYearSync = (): YearsModel[] => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2000 + 1 }, (_, i) => {
      const year = currentYear - i;
      return {
        end_date: `${year}-${year + 1}`,
        start_date: `${year}`,
        id: i,
        is_current: year === currentYear,
        year_name: `${year}-${year + 1}`,
      };
    });
  };

  const handleAddSubject = (subject: Subject) => {
    if (!selectedSubjects.some((s) => s.id === subject.id)) {
      const updated = [...selectedSubjects, subject];
      setSelectedSubjects(updated);
      setFormData("subjects", updated);
    }
  };

  const handleRemoveSubject = (subjectId: number) => {
    const updated = selectedSubjects.filter((s) => s.id !== subjectId);
    setSelectedSubjects(updated);
    setFormData("subjects", updated);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedSubjects.length === 0) {
      setError(true);
      setErrorDetail("Please add at least one subject");
      setMessageMsg("Please add at least one subject");
      setResponseMsg(true);
      setTimeout(() => setResponseMsg(false), 3000);
      return;
    }

    setResponseMsg(true);
    setError(false);
    setErrorDetail(null);
    setIsSubmitting(true);

    const url = isUpdating
      ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${formData.id}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/classes/`;

    try {
      const fetchRequest = await fetchWithAuth(url, {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subjects: selectedSubjects.map((s) => s.id),
        }),
      });

      if (!fetchRequest.ok) {
        const err = await fetchRequest.json();
        throw err;
      }

      setError(false);
      setErrorDetail(null);
      setMessageMsg(isUpdating ? "✅ Class updated!" : "✅ Class created!");
      onSuccess?.();

      setTimeout(() => {
        setResponseMsg(false);
      }, 2000);
    } catch (err) {
      setError(true);
      setErrorDetail(extractErrorDetail(err));
      setMessageMsg("Failed to save class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (["class_teacher", "grade_level", "capacity"].includes(name)) {
      setFormData(name, value ? parseInt(value) : "");
    } else {
      setFormData(name, value);
    }
  };

  const availableSubjects = subjects.filter(
    (s) => !selectedSubjects.some((selected) => selected.id === s.id)
  );

  const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          {formData.id ? "✏️ Edit Class" : "📚 Create Class"}
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          {formData.id ? "Update class details and subjects" : "Set up a new class"}
        </p>
      </div>

      {responseMsg && (
        <div
          className={`flex-shrink-0 px-6 py-3 border-b flex items-start gap-3 animate-in fade-in slide-in-from-top-2 text-sm ${
            error
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          {isSubmitting && <div className="animate-spin mt-0.5">⏳</div>}
          {error && !isSubmitting && (
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
          )}
          {!error && !isSubmitting && (
            <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
          )}
          <div className={`font-semibold ${error ? "text-red-700" : "text-green-700"}`}>
            {error ? (
              <ErrorMessage
                errorDetail={errorDetail || messageMsg}
                className="bg-transparent border-0 p-0 text-red-700"
              />
            ) : (
              <p>{messageMsg}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-6 py-0 border-b border-slate-200 flex gap-0">
        {[
          { id: "basic", label: "📋 Basic Info" },
          { id: "assignment", label: "👨‍🏫 Assignment" },
          { id: "subjects", label: `📖 Subjects (${selectedSubjects.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
        
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Class Name
                  </label>
                  <input
                    type="text"
                    name="class_name"
                    value={formData.class_name || ""}
                    onChange={handleChange}
                    placeholder="e.g. Grade 10-A"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    name="grade_level"
                    value={formData.grade_level || ""}
                    onChange={handleChange}
                    placeholder="e.g. Grade 10"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Block
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section || ""}
                    onChange={handleChange}
                    placeholder="e.g. A"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ""}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "assignment" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Teacher
                  </label>
                  <select
                    name="class_teacher"
                    onChange={handleChange}
                    value={formData.class_teacher || ""}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="">Select teacher</option>
                    {teachers?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {`${t.first_name} ${t.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Academic Year
                  </label>
                  <select
                    name="academic_year"
                    onChange={handleChange}
                    value={formData.academic_year || ""}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="">Select year</option>
                    {AcademicYearList.map((year) => (
                      <option key={year.id} value={year.year_name}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={formData.room_number || ""}
                    onChange={handleChange}
                    placeholder="e.g. A101"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="space-y-4">
              {selectedSubjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSubjects.map((subject, idx) => {
                    const color = getSubjectColor(idx);
                    return (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-xl border-2 ${color.bg} ${color.border} hover:shadow-md transition-all group`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">
                              {subject.subject_name}
                            </p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold ${color.badge}`}>
                              {subject.subject_code}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(subject.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 opacity-0 group-hover:opacity-100"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedSubjects.length === 0 && (
                <div className="p-8 rounded-xl border-2 border-dashed border-slate-300 text-center bg-slate-50">
                  <p className="text-slate-600 font-bold">No subjects added</p>
                  <p className="text-sm text-slate-500 mt-1">Click button below to add subjects</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSubjectModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add Subject
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black rounded-lg hover:from-slate-800 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all uppercase tracking-wider disabled:opacity-75 text-sm"
        >
          {isSubmitting ? "Please wait..." : formData.id ? "✅ Update" : "✅ Create"}
        </button>
      </div>

      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
    
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
              <h2 className="font-black text-slate-900 uppercase tracking-tight">
                Add Subjects
              </h2>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingSubjects ? (
                <div className="p-4 text-center text-slate-600">Loading subjects...</div>
              ) : availableSubjects.length > 0 ? (
                <div className="space-y-2 p-4">
                  {availableSubjects.map((subject, idx) => {
                    const color = getSubjectColor(idx);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          handleAddSubject(subject);
                        }}
                        className={`w-full p-4 rounded-lg border-2 ${color.bg} ${color.border} hover:shadow-md transition-all text-left group`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              {subject.subject_name}
                            </p>
                            <p className={`text-xs font-semibold mt-1 ${color.badge}`}>
                              {subject.subject_code}
                            </p>
                          </div>
                          <Plus className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-600">All subjects added</div>
              )}
            </div>

            <div className="flex-shrink-0 px-6 py-3 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
