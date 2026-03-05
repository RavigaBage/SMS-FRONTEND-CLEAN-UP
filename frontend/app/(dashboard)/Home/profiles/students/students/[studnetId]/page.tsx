"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import { StatsCard } from "@/src/assets/components/dashboard/StatsCard";
import { GradeTable } from "@/src/assets/components/dashboard/GradeTable";
import { ErrorState } from "@/src/assets/components/dashboard/ErrorState";
import { QuickNotes } from "@/src/assets/components/dashboard/QuickNotesCard";
import {
  Loader2,
  Download,
  Printer,
  ArrowLeft,
  MessageSquare,
  Edit,
} from "lucide-react";
import { EditStudentModal } from "@/src/assets/components/management/EditStudentModal";
import html2canvas from "html2canvas";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import Image from "next/image";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  // Use the name exactly as it appears in your console logs
  const id = params?.studnetId;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: number; message: string } | null>(
    null,
  );
  const [actionError, setActionError] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        console.log("🚀 Starting fetch for Student ID:", id);
        setLoading(true);

        const res = await apiRequest<any>(`/students/${id}/full_details/`);

        console.log("✅ API Response received:", res);
        setData(res.data);
      } catch (err: any) {
        console.error("❌ Fetch Error:", err);
        setError({
          code: err.status || 500,
          message: err.message || "Failed to load profile",
        });
      } finally {
        console.log("🏁 Loading sequence complete");
        setLoading(false);
      }
    };

    if (id) {
      fetchFullProfile();
    } else {
      console.warn("⚠️ No ID found in URL parameters yet.");
    }
  }, [id]);

  const handleDownloadPDF = async (): Promise<void> => {
  if (!printRef?.current) return;

  setIsExporting(true);

  try {
    const element = printRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = (canvas.height * PAGE_WIDTH) / canvas.width;

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [0, 0, 0, 0] as [number, number, number, number],
      content: [
        {
          image: imgData,
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
        },
      ],
    };

    const safeName =
      student?.first_name?.replace(/\s+/g, "_") || "Student";

    pdfMake.createPdf(docDefinition).download(`Transcript_${safeName}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
  } finally {
    setIsExporting(false);
  }
};


  const handleUpdateStudent = async (updatedFields: any) => {
    try {
      setActionError(null);
      await apiRequest(`/students/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(updatedFields),
      });

      setData((prev: any) => ({
        ...prev,
        student: { ...prev.student, ...updatedFields },
      }));

      setIsEditModalOpen(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update failed", err);
      setActionError(extractErrorDetail(err) || "Failed to save changes.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-cyan-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium italic">
          Assembling student profile for ID: {id}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 max-w-xl mx-auto">
        <ErrorState code={error.code} message={error.message} />
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 text-cyan-600 font-bold hover:underline"
        >
          <ArrowLeft size={16} /> Go Back to Dashboard
        </button>
      </div>
    );
  }
  const { student, parents, academic_record, recent_attendance,current_enrollment } = data.data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {actionError && <ErrorMessage errorDetail={actionError} />}
      <section className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12">
          <Image
            src={`https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=random`}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white object-cover"
            alt="Student Profile"
            width={200}
            height={200}
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-800">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-slate-500 font-medium">
              ID: {student.admission_number} •{" "}
              {current_enrollment?.class_obj?.name || "Unassigned"}
            </p>
          </div>
          <div className="flex gap-2 pb-1">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <MessageSquare size={16} /> Message Parent
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-700 transition-all shadow-md"
            >
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Personal Details</h3>
            <div className="space-y-4">
              <DetailItem label="DATE OF BIRTH" value={student.date_of_birth} />
              <DetailItem
                label="GENDER"
                value={student.gender?.toUpperCase()}
              />
              <DetailItem
                label="ADDRESS"
                value={student.address || "No address provided"}
              />
              <DetailItem
                label="BLOOD GROUP"
                value={student.blood_group || "—"}
              />
            </div>

            <hr className="my-6 border-slate-100" />

            <h3 className="font-bold text-slate-800 mb-4">Parent/Guardian</h3>
            {parents?.length > 0 ? (
              parents.map((p: any) => (
                <div
                  key={p.id}
                  className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <p className="text-sm font-bold text-slate-700">
                    {p.first_name} {p.last_name}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase font-medium">
                    {p.relationship} • {p.phone_number}
                  </p>
                 
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                No parent linked to this account
              </p>
            )}
          </div>
          <QuickNotes
            note={
              student.medical_conditions ||
              "No critical medical notes documented."
            }
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              label="GPA"
              value={academic_record.summary?.gpa}
              subValue="Term Avg"
              color="cyan"
            />
            <StatsCard
              label="Attendance"
              value={recent_attendance.length}
              subValue="This Month"
              color="blue"
            />
            <StatsCard
              label="Status"
              value={student.status?.toUpperCase()}
              color={student.status === "active" ? "emerald" : "slate"}
            />
          </div>

          <div
            className="bg-white rounded-2xl border shadow-sm overflow-hidden"
            ref={printRef}
          >
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="font-bold text-slate-800">
                Recent Academic Performance
              </h3>
              <div className="flex gap-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 text-cyan-600 text-sm font-bold hover:bg-cyan-50 px-3 py-1 rounded-lg transition-all"
                >
                  <Download size={16} />{" "}
                  {isExporting ? "Saving..." : "Export PDF"}
                </button>
              </div>
            </div>
            <div className="p-4">
              <GradeTable grades={academic_record?.grades || []} />
            </div>
          </div>
        </div>
      </div>
      <EditStudentModal
        student={student}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateStudent}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
    </div>
  );
}
