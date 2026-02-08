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

  if (loading) return <div className="dashboardWrapper">Loading transcript...</div>;
  if (!student) return <div className="dashboardWrapper">Student not found</div>;

  const terms = Array.from(new Set(records.map(r => r.term))).sort();

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        <header className="header no-print">
          <div>
            <h1>Official Academic Transcript</h1>
            <p>{student.last_name} {student.first_name} • ID: {student.id}</p>
          </div>
          <div className="actions">
            <button 
              className="primaryBtn" 
              onClick={handleDownloadPDF}
              disabled={isExporting}
            >
              {isExporting ? "Generating..." : "Download PDF"}
            </button>
            <button className="secondaryBtn" onClick={() => window.print()}>Print</button>
          </div>
        </header>

        <main className="card" ref={transcriptRef} style={{ padding: '40px', background: 'white' }}>
          {/* Document Header */}
          <div className="pdf-header" style={{ marginBottom: '30px', borderBottom: '3px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px' }}>OFFICIAL REPORT CARD</h2>
                <p style={{ margin: 0, color: '#666' }}>{student.current_class?.class_name} | {student.current_class?.academic_year}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888' }}>
                Generated: {new Date().toLocaleDateString()}
              </div>
          </div>

          {terms.map((term) => {
            const termRecords = records.filter(r => r.term === term);
            const termRankValue = student.summary.rank;
            const rankColors = {
              1: '#ffc400', // Gold
              2: '#036cff', // Silver
              3: '#914d19', // Bronze
            };

            const defaultColor = '#2d3748';
            return (
              <section key={term} className="termSection" style={{ marginBottom: '50px' }}>
                <div className="termHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div className="termTitle">
                    <h2 style={{ color: '#1a202c', borderLeft: '4px solid #3182ce', paddingLeft: '10px', textTransform: 'uppercase' }}>
                      {term} Term
                    </h2>
                  </div>
                  <div className="rankBadge" style={{ textAlign: 'center', backgroundColor: '#f7fafc', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold', display: 'block' }}>Class Rank</span>
                    
                    <div style={{ fontSize: '20px', fontWeight: '800', color: rankColors[termRankValue as keyof typeof rankColors] || defaultColor }}>
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
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <span className={`rankPill ${isTopSubject ? 'gold-pill' : ''}`} style={{
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                backgroundColor: isTopSubject ? '#fffaf0' : '#edf2f7',
                                color: isTopSubject ? '#b7791f' : '#4a5568',
                                border: isTopSubject ? '1px solid #fbd38d' : 'none'
                              }}>
                                {formatRank(rec.subject_rank)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            );
          })}
          
          <footer style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '11px', color: '#aaa', textAlign: 'center' }}>
            This is a computer-generated document. No signature is required.
          </footer>
        </main>
      </div>
    </div>
  );
}