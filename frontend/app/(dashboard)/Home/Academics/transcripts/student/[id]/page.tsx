"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import "@/styles/transcripts.css";
import { fetchWithAuth } from '@/src/lib/apiClient';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Interfaces ---
interface Subject {
  subject_name: string;
  subject_code: string;
}

interface TranscriptRecord {
  id: number;
  subject: Subject;
  term: string;
  total_score: string;
  grade_letter: string;
  percentage: number;
  class_average: number;
  subject_rank: number; 
}
interface Summary {
  class_name: string;
  academic_year: string;
  term: string;
  rank: number;
  total_students: number;
  average_score: number;
  gpa: number;
}
interface StudentInfo {
  id: number;
  student_id: string;
  first_name:string;
  last_name:string;
  current_class?: {
    class_name: string;
    academic_year: string;
  };
  summary: Summary;
  term_ranks?: Record<string, number>; 
}

const formatRank = (rank: number | undefined) => {
  if (rank === undefined || rank === null || rank === 0) return "—";
  const j = rank % 10, k = rank % 100;
  if (j === 1 && k !== 11) return rank + "st";
  if (j === 2 && k !== 12) return rank + "nd";
  if (j === 3 && k !== 13) return rank + "rd";
  return rank + "th";
};

export default function StudentTranscript() {
  const { id } = useParams();
  const transcriptRef = useRef<HTMLDivElement>(null); 

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [records, setRecords] = useState<TranscriptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTranscript = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/transcripts/${id}/`);
        const data = await res.json();
        setStudent(data);
        setRecords(data.grades || []);
      } catch (error) {
        console.error("Failed to load transcript", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!transcriptRef.current) return;
    setIsExporting(true);

    try {
      const element = transcriptRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Transcript_${student?.first_name?.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  // ── after all hooks and data fetching ────────────────────────────

  if (loading) return <div className="dashboardWrapper">Loading transcript...</div>;
  if (!student) return <div className="dashboardWrapper">Student not found</div>;

  const terms = Array.from(new Set(records.map(r => r.term))).sort();

  // ── single return with correct structure ─────────────────────────
  return (
    <div className="dashboardWrapper TRANSCRIPTDATA">
      <div className="dashboard">

        <header className="header no-print">
          <div>
            <h1>Official Academic Transcript</h1>
            <p>{student.last_name} {student.first_name} • ID: {student.id}</p>
          </div>
          <div className="actions">
            <button className="primaryBtn" onClick={handleDownloadPDF} disabled={isExporting}>
              {isExporting ? "Generating..." : "Download PDF"}
            </button>
            <button className="secondaryBtn" onClick={() => window.print()}>Print</button>
          </div>
        </header>

        <main className="card" ref={transcriptRef} style={{ padding: '40px', background: 'white' }}>

          {/* PDF header — renders once */}
          <div className="pdf-header" style={{ marginBottom: '30px', borderBottom: '3px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px' }}>OFFICIAL REPORT CARD</h2>
              <p style={{ margin: 0, color: '#666' }}>{student.current_class?.class_name} | {student.current_class?.academic_year}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#888' }}>
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* ✅ Terms — conditional here, inside return */}
          {terms.length <= 0 ? (
            <NoTermsCard />
          ) : (
            terms.map((term) => {
              const termRecords = records.filter(r => r.term === term);
              const termRankValue = student.summary.rank;
              const rankColors: Record<number, string> = { 1: '#ffc400', 2: '#036cff', 3: '#914d19' };
              const defaultColor = '#2d3748';

              return (
                <section key={term} className="termSection" style={{ marginBottom: '50px' }}>
                  <div className="termHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ color: '#1a202c', borderLeft: '4px solid #3182ce', paddingLeft: '10px', textTransform: 'uppercase' }}>
                      {term} Term
                    </h2>
                    <div className="rankBadge" style={{ textAlign: 'center', backgroundColor: '#f7fafc', padding: '8px 15px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold', display: 'block' }}>Class Rank</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: rankColors[termRankValue] || defaultColor }}>
                        {formatRank(termRankValue)}
                      </div>
                    </div>
                  </div>

                  <table className="transcriptTable">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Subject</th>
                        <th>Score</th>
                        <th>Class Avg</th>
                        <th>Grade</th>
                        <th>Subject Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termRecords.map((rec) => {
                        const isTopSubject = [1, 2, 3].includes(rec.subject_rank);
                        return (
                          <tr key={rec.id}>
                            <td style={{ fontWeight: '500' }}>{rec.subject.subject_name}</td>
                            <td className="gradeCell">{rec.total_score}</td>
                            <td className="avgCell" style={{ color: '#a0aec0' }}>{rec.class_average}</td>
                            <td className="gradeCell"><strong>{rec.grade_letter}</strong></td>
                            <td>
                              <span style={{
                                padding: '2px 10px', fontSize: '12px', fontWeight: 'bold',
                                backgroundColor: isTopSubject ? '#fffaf0' : '#edf2f7',
                                color: isTopSubject ? '#b7791f' : '#4a5568',
                                border: isTopSubject ? '1px solid #fbd38d' : 'none'
                              }}>
                                {formatRank(rec.subject_rank)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              );
            })
          )}

          {/* Footer — renders once */}
          <footer style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
            This is a computer-generated document. No signature is required.
          </footer>

        </main>
      </div>
    </div>
  );

}


function NoTermsCard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .no-terms-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          font-family: 'DM Sans', sans-serif;
        }

        .no-terms-card {
          width: 100%;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-top: 3px solid #1a56db;
          padding: 40px 36px;
          text-align: center;
        }

        .no-terms-icon-wrap {
          width: 64px;
          height: 64px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .no-terms-icon {
          width: 28px;
          height: 28px;
          color: #94a3b8;
        }

        .no-terms-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #1a56db;
          margin: 0 0 8px;
          font-family: 'Sora', sans-serif;
        }

        .no-terms-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .no-terms-body {
          font-size: 13px;
          color: #64748b;
          line-height: 1.7;
          margin: 0 0 28px;
          font-weight: 300;
        }

        .no-terms-hint {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #eff6ff;
          border-left: 3px solid #1a56db;
          font-size: 12px;
          color: #1e40af;
          font-weight: 500;
          text-align: left;
        }

        .no-terms-hint svg {
          flex-shrink: 0;
          color: #1a56db;
        }
      `}</style>

      <div className="no-terms-wrap">
        <div className="no-terms-card">

          {/* Icon */}
          <div className="no-terms-icon-wrap">
            <svg className="no-terms-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2"/>
              <line x1="12" y1="14" x2="16" y2="14" strokeWidth="2"/>
              <line x1="8" y1="18" x2="8" y2="18" strokeWidth="2"/>
              <line x1="12" y1="18" x2="16" y2="18" strokeWidth="2"/>
            </svg>
          </div>

          {/* Text */}
          <p className="no-terms-label">Academic Terms</p>
          <h3 className="no-terms-title">No Terms Configured</h3>
          <p className="no-terms-body">
            There are no academic terms set up for this year yet.
            Grades need to be created before results can be displayed.
          </p>

          {/* Hint strip */}
          <div className="no-terms-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Contact your administrator to add terms for this academic year.
          </div>

        </div>
      </div>
    </>
  );
}
