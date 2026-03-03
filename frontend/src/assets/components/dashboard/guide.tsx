import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Check,
  Users,
  BookOpen,
  Settings,
  Sparkles,
  X,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const STORAGE_KEY = "ftg_v1_completed";

interface FirstTimeGuideProps {
  onFinish?: () => void;
  initiallyOpen?: boolean;
}

export default function FirstTimeGuide({
  onFinish,
  initiallyOpen = true,
}: FirstTimeGuideProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return initiallyOpen;
    try {
      return initiallyOpen && !localStorage.getItem(STORAGE_KEY);
    } catch {
      return initiallyOpen;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const prerequisites = [
    {
      id: "Users",
      icon: Users,
      title: "Add Users",
      description:
        "Add at least one user so you can assign a role  and manage a section of the school effectively.",
      action: "Go to Users",
      href: "/Home/userAccount/",
      color: "#667eea",
      colorEnd: "#764ba2",
      tip: "You can add users from the Users → users section. Fill in their profile details, and contact details.",
    },
    {
      id: "Subjects",
      icon: BookOpen,
      title: "Add Subjects",
      description:
        "Add at least one subject so you can assign a teacher.",
      action: "Go to Subjects",
      href: "/Home/Academics/subject",
      color: "#667eea",
      colorEnd: "#764ba2",
      tip: "You can add subjects from the Academics → subjects section. Fill in their profile details, and contact details.",
    },
    {
      id: "teachers",
      icon: Users,
      title: "Add Teachers",
      description:
        "Add at least one teacher so you can assign classes and manage subjects effectively.",
      action: "Go to Teachers",
      href: "/Home/profiles/teachers",
      color: "#667eea",
      colorEnd: "#764ba2",
      tip: "You can add teachers from the Management → Teachers section. Fill in their name, subject, and contact details.",
    },
    {
      id: "classes",
      icon: BookOpen,
      title: "Create Classes",
      description:
        "Create your class groups and attach teachers, subjects, and schedules.",
      action: "Go to Classes",
      href: "/Home/Academics/classes",
      color: "#f59e0b",
      colorEnd: "#d97706",
      tip: "After adding a teacher, create a class and assign them as the class teacher. You can also add multiple subjects per class.",
    },
    {
      id: "settings",
      icon: Settings,
      title: "Configure Settings",
      description:
        "Set up your grading system and academic calendar for your school.",
      action: "Go to Settings",
      href: "/Home/config",
      color: "#10b981",
      colorEnd: "#059669",
      tip: "Define your grading scale (e.g. A=80–100) and set the current academic year and term.",
    },
  ];

  const features = [
    { title: "Dashboard", desc: "Overview of classes and upcoming activities.", initial: "D" },
    { title: "Attendance", desc: "Mark attendance quickly for each class.", initial: "A" },
    { title: "Grades", desc: "Record and analyze student performance.", initial: "G" },
    { title: "Reports", desc: "Generate printable academic reports.", initial: "R" },
  ];

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {  }
  };

  const closeGuide = () => { persist(); setOpen(false); };
  const handleFinish = () => { persist(); setOpen(false); onFinish?.(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); closeGuide(); }
      if (e.key === "ArrowRight") { e.preventDefault(); tryGoNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Tab" && containerRef.current) {
        const els = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!els.length) return;
        const active = document.activeElement as HTMLElement;
        if (!e.shiftKey && active === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
        else if (e.shiftKey && active === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
      }
    };
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", onKey);
      setTimeout(() => containerRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 80);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [open, currentStep, completedSteps]);

  const markComplete = (id: string) => {
    if (completedSteps.includes(id)) return;
    setCompletedSteps((s) => [...s, id]);
    setTimeout(() => {
      setCurrentStep((c) => (c < prerequisites.length - 1 ? c + 1 : prerequisites.length));
    }, 280);
  };

  const tryGoNext = () => {
    const cur = prerequisites[currentStep];
    if (cur && !completedSteps.includes(cur.id)) return;
    setCurrentStep((c) => Math.min(c + 1, prerequisites.length));
  };

  const goPrev = () => setCurrentStep((c) => Math.max(0, c - 1));

  const handleActionClick = (pr: typeof prerequisites[0]) => {
    markComplete(pr.id);
    setNavigatingTo(pr.id);
    setTimeout(() => {
      window.location.href = pr.href;
    }, 400);
  };

  if (!open) return null;

  const progress = (currentStep / prerequisites.length) * 100;
  const cur = prerequisites[currentStep];

  return (
    <div
      className="ftg-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ftg-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeGuide(); }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .ftg-overlay {
          position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
          padding: 24px; z-index: 9999;
          background: rgba(8,12,20,0.55);
          backdrop-filter: blur(8px) saturate(130%);
          -webkit-backdrop-filter: blur(8px) saturate(130%);
        }

        .ftg-card {
          width: 100%; max-width: 940px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 80px rgba(8,15,30,0.5), 0 0 0 1px rgba(255,255,255,0.1);
          overflow: hidden;
          animation: ftg-pop 360ms cubic-bezier(.16,.9,.3,1);
          display: grid;
          grid-template-columns: 1fr 340px;
          font-family: 'DM Sans', sans-serif;
        }

        @keyframes ftg-pop {
          from { opacity: 0; transform: translateY(16px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        /* ── LEFT PANEL ── */
        .ftg-left { padding: 32px 36px; display: flex; flex-direction: column; gap: 0; }

        .ftg-header { display: flex; align-items: flex-start; justify-content: space-between; }

        .ftg-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 800; color: #0c0f1a; line-height: 1.2;
        }

        .ftg-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }

        .ftg-close-btn {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 7px; cursor: pointer; color: #64748b; flex-shrink: 0;
          transition: all .15s;
        }
        .ftg-close-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

        /* ── STEP TRACKER ── */
        .ftg-tracker { margin: 24px 0 20px; }

        .ftg-track-bar {
          height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; margin-bottom: 14px;
        }
        .ftg-track-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width .4s cubic-bezier(.4,0,.2,1);
        }

        .ftg-dots { display: flex; gap: 8px; align-items: center; }

        .ftg-dot {
          width: 32px; height: 32px; border-radius: 999px;
          display: inline-grid; place-items: center;
          font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 700;
          border: 2px solid #e2e8f0; background: white; color: #94a3b8;
          transition: all .25s;
        }
        .ftg-dot.done  { background: #10b981; border-color: #10b981; color: white; }
        .ftg-dot.active { background: linear-gradient(135deg,#667eea,#764ba2); border-color: transparent; color: white; box-shadow: 0 6px 20px rgba(102,126,234,.35); }
        .ftg-dot-finish { background: #fef9c3; border-color: #fde68a; color: #92400e; }
        .ftg-dot-finish.active { background: linear-gradient(135deg,#f59e0b,#d97706); border-color: transparent; color: white; box-shadow: 0 6px 20px rgba(245,158,11,.35); }

        .ftg-dot-label { font-size: 11px; color: #94a3b8; margin-top: 4px; text-align: center; }

        /* ── STEP BODY ── */
        .ftg-body { flex: 1; }

        .ftg-step-card {
          border: 2px solid #f1f5f9; border-radius: 16px; padding: 22px;
          animation: ftg-fadein .3s ease;
        }
        @keyframes ftg-fadein { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

        .ftg-step-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: grid; place-items: center; color: white; margin-bottom: 16px;
        }

        .ftg-step-title { font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 800; color: #0c0f1a; margin: 0 0 6px; }
        .ftg-step-desc  { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px; }

        .ftg-tip {
          background: #f8fafc; border-radius: 10px; padding: 12px 14px;
          font-size: 13px; color: #475569; line-height: 1.55;
          border-left: 3px solid #667eea; margin-bottom: 18px;
        }
        .ftg-tip strong { color: #0c0f1a; }

        .ftg-action-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 12px 20px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700;
          color: white; transition: all .2s; position: relative; overflow: hidden;
        }
        .ftg-action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.18); }
        .ftg-action-btn:active { transform: translateY(0); }
        .ftg-action-btn:disabled { opacity: .7; cursor: default; transform: none; }
        .ftg-action-btn.done-btn { background: #10b981 !important; cursor: default; }

        .ftg-skip-step {
          background: none; border: none; color: #94a3b8; font-size: 13px;
          cursor: pointer; padding: 0; margin-left: 12px; text-decoration: underline;
          text-underline-offset: 3px;
        }
        .ftg-skip-step:hover { color: #475569; }

        /* ── DONE STATE ── */
        .ftg-done-wrap { animation: ftg-fadein .35s ease; }
        .ftg-done-badge {
          width: 72px; height: 72px; border-radius: 999px;
          background: linear-gradient(135deg,#10b981,#059669);
          display: grid; place-items: center; color: white;
          box-shadow: 0 12px 30px rgba(16,185,129,.3);
          margin-bottom: 14px;
        }
        .ftg-done-title { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #0c0f1a; margin-bottom: 6px; }
        .ftg-done-sub   { font-size: 14px; color: #64748b; }

        .ftg-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
        .ftg-feature-item {
          background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px;
          transition: border-color .2s;
        }
        .ftg-feature-item:hover { border-color: #c7d2fe; }
        .ftg-feature-item .fi-title { font-weight: 700; font-size: 14px; color: #0c0f1a; }
        .ftg-feature-item .fi-desc  { font-size: 12px; color: #64748b; margin-top: 3px; }

        /* ── FOOTER ── */
        .ftg-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;
        }

        .btn {
          border-radius: 10px; padding: 9px 16px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px;
          border: 1px solid transparent; transition: all .15s;
        }
        .btn.ghost  { background: #f8fafc; color: #475569; border-color: #e2e8f0; }
        .btn.ghost:hover { background: #f1f5f9; }
        .btn.ghost:disabled { opacity: .4; cursor: default; }
        .btn.primary { background: linear-gradient(90deg,#667eea,#764ba2); color: white; border: none; }
        .btn.primary:hover { opacity: .9; }

        /* ── RIGHT PANEL ── */
        .ftg-right {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          border-left: 1px solid #f1f5f9;
          padding: 28px;
          display: flex; flex-direction: column;
        }

        .ftg-checklist-title {
          font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700;
          color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px;
        }

        .ftg-checklist-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; margin-bottom: 6px;
          transition: background .2s;
        }
        .ftg-checklist-item.is-current { background: #eef2ff; }
        .ftg-checklist-item.is-done    { background: #f0fdf4; }

        .ftg-check-icon {
          width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
          display: grid; place-items: center; font-size: 12px; font-weight: 700;
        }
        .ftg-check-icon.pending  { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }
        .ftg-check-icon.current  { background: linear-gradient(135deg,#667eea,#764ba2); color: white; }
        .ftg-check-icon.done-icon{ background: #10b981; color: white; }

        .ftg-cl-label { font-size: 14px; font-weight: 600; color: #0c0f1a; }
        .ftg-cl-sublabel { font-size: 12px; color: #94a3b8; }

        .ftg-cl-go {
          margin-left: auto; background: none; border: none; cursor: pointer;
          color: #667eea; padding: 4px; border-radius: 6px; display: grid; place-items: center;
        }
        .ftg-cl-go:hover { background: #eef2ff; }

        .ftg-hint-box {
          margin-top: auto; padding-top: 18px; border-top: 1px solid #f1f5f9;
          font-size: 12px; color: #94a3b8; line-height: 1.5;
        }

        @media (max-width: 900px) {
          .ftg-card { grid-template-columns: 1fr; max-width: 640px; }
          .ftg-right { border-left: none; border-top: 1px solid #f1f5f9; }
          .ftg-feature-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ftg-card" ref={containerRef}>

        <div className="ftg-left">

          <div className="ftg-header">
            <div>
              <div id="ftg-title" className="ftg-title">Get started in 3 steps</div>
              <div className="ftg-subtitle">Follow the checklist — takes less than 2 minutes.</div>
            </div>
            <button className="ftg-close-btn" aria-label="Close guide" onClick={closeGuide}>
              <X size={16} />
            </button>
          </div>

          <div className="ftg-tracker">
            <div className="ftg-track-bar">
              <div className="ftg-track-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="ftg-dots" role="list">
              {prerequisites.map((p, i) => {
                const done = completedSteps.includes(p.id);
                const active = i === currentStep;
                return (
                  <div key={p.id} role="listitem" style={{ textAlign: "center" }}>
                    <div className={`ftg-dot ${done ? "done" : ""} ${active && !done ? "active" : ""}`} title={p.title}>
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign: "center" }}>
                <div className={`ftg-dot ftg-dot-finish ${currentStep === prerequisites.length ? "active" : ""}`}>
                  <Sparkles size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="ftg-body">
            {currentStep < prerequisites.length ? (
              <div className="ftg-step-card" key={currentStep}>
                <div
                  className="ftg-step-icon"
                  style={{ background: `linear-gradient(135deg, ${cur.color}, ${cur.colorEnd})` }}
                >
                  <cur.icon size={24} />
                </div>
                <h3 className="ftg-step-title">{cur.title}</h3>
                <p className="ftg-step-desc">{cur.description}</p>

                <div className="ftg-tip">
                  <strong>💡 How to do it: </strong>{cur.tip}
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  {completedSteps.includes(cur.id) ? (
                    <button
                      className="ftg-action-btn done-btn"
                      disabled
                    >
                      <Check size={16} /> Done — moving on…
                    </button>
                  ) : (
                    <>
                      <button
                        data-autofocus
                        className="ftg-action-btn"
                        style={{ background: `linear-gradient(135deg, ${cur.color}, ${cur.colorEnd})` }}
                        onClick={() => handleActionClick(cur)}
                        disabled={navigatingTo === cur.id}
                      >
                        {navigatingTo === cur.id ? (
                          <>
                            <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "white", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                            Navigating…
                          </>
                        ) : (
                          <>
                            <cur.icon size={16} /> {cur.action} <ExternalLink size={14} />
                          </>
                        )}
                      </button>

                      <button
                        className="ftg-skip-step"
                        onClick={() => markComplete(cur.id)}
                        title="Mark as done without navigating"
                      >
                        Already done
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="ftg-done-wrap">
                <div className="ftg-done-badge"><Check size={32} /></div>
                <div className="ftg-done-title">You're all set 🎉</div>
                <div className="ftg-done-sub">Setup complete. Here's a quick look at what's available.</div>
                <div className="ftg-feature-grid">
                  {features.map((f, i) => (
                    <div key={i} className="ftg-feature-item">
                      <div className="fi-title">{f.title}</div>
                      <div className="fi-desc">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ftg-footer">
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn ghost" onClick={closeGuide}>Skip guide</button>
              <button
                className="btn ghost"
                onClick={() => { setCompletedSteps([]); setCurrentStep(0); setNavigatingTo(null); }}
                title="Start over"
              >
                Reset
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                {Math.min(currentStep + 1, prerequisites.length + 1)} / {prerequisites.length + 1}
              </span>
              <button className="btn ghost" onClick={goPrev} disabled={currentStep === 0}>← Back</button>
              {currentStep < prerequisites.length ? (
                <button
                  className="btn primary"
                  onClick={tryGoNext}
                  disabled={!completedSteps.includes(prerequisites[currentStep].id)}
                  title={!completedSteps.includes(prerequisites[currentStep].id) ? "Complete this step first" : ""}
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button className="btn primary" onClick={handleFinish}>
                  Go to Dashboard <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="ftg-right" aria-label="Checklist overview">
          <div className="ftg-checklist-title">Your checklist</div>

          {prerequisites.map((p, i) => {
            const done = completedSteps.includes(p.id);
            const isCurrent = i === currentStep;
            return (
              <div
                key={p.id}
                className={`ftg-checklist-item ${isCurrent && !done ? "is-current" : ""} ${done ? "is-done" : ""}`}
              >
                <div className={`ftg-check-icon ${done ? "done-icon" : isCurrent ? "current" : "pending"}`}>
                  {done ? <Check size={12} /> : i + 1}
                </div>
                <div>
                  <div className="ftg-cl-label">{p.title}</div>
                  <div className="ftg-cl-sublabel">{done ? "Completed ✓" : isCurrent ? "In progress" : "Not started"}</div>
                </div>
                {!done && (
                  <button
                    className="ftg-cl-go"
                    onClick={() => setCurrentStep(i)}
                    title={`Go to ${p.title}`}
                    aria-label={`Jump to step: ${p.title}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: 24, padding: "14px 16px", background: "#fefce8", borderRadius: 12, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>💡 Tip</div>
            <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.55 }}>
              Clicking <strong>Go to [page]</strong> will navigate you there and automatically mark the step as done.
            </div>
          </div>

          <div className="ftg-hint-box">
            <div>Press <kbd style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 11, border: "1px solid #e2e8f0" }}>←</kbd> <kbd style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 11, border: "1px solid #e2e8f0" }}>→</kbd> to navigate · <kbd style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 11, border: "1px solid #e2e8f0" }}>Esc</kbd> to close</div>
          </div>
        </aside>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}