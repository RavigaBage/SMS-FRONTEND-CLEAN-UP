import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Check,
  AlertCircle,
  Users,
  BookOpen,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

interface FirstTimeGuideProps {
  onFinish?: () => void;
  initiallyOpen?: boolean;
}

export default function FirstTimeGuide({
  onFinish,
  initiallyOpen = true
}: FirstTimeGuideProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const prerequisites = [
    {
      id: 'teachers',
      icon: Users,
      title: 'Add Teachers',
      description:
        'We Advice that administrators add at least one teacher so you can assign classes and manage subjects.',
      action: 'Next Step'
    },
    {
      id: 'classes',
      icon: BookOpen,
      title: 'Create Classes',
      description:
        'Create your class groups and attach teachers, subjects and schedules.',
      action: 'Next Step'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Configure Settings',
      description:
        'Adjust grading system, and the academic calendar for your school.',
      action: 'Finish'
    }
  ];
  const features = [
    { title: 'Dashboard', desc: 'Overview of classes and upcoming activities.' },
    { title: 'Attendance', desc: 'Quickly mark attendance for each class.' },
    { title: 'Grades', desc: 'Record and analyze student performance.' },
    { title: 'Reports', desc: 'Generate printable academic reports.' }
  ];

  // Focus trap helpers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeGuide();
      }

      // Arrow nav
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }

      // Manage Tab focus trap
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(Boolean);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      document.addEventListener('keydown', onKey);
      // autofocus first actionable element
      setTimeout(() => {
        containerRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
      }, 80);
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      // restore previous focus
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, currentStep]);

  const closeGuide = () => {
    setOpen(false);
  };

  const handleFinish = () => {
    setOpen(false);
    if (onFinish) onFinish();
  };

  const markComplete = (id: string) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps((s) => [...s, id]);
      // automatically advance if not last step
      setTimeout(() => {
        if (currentStep < prerequisites.length - 1) {
          setCurrentStep((c) => c + 1);
        } else {
          // if was last step, move to final screen
          setCurrentStep(prerequisites.length);
        }
      }, 250);
    }
  };

  const goNext = () => {
    // require current to be completed
    if (currentStep < prerequisites.length) {
      const curId = prerequisites[currentStep].id;
      if (!completedSteps.includes(curId)) return;
    }
    setCurrentStep((c) => Math.min(c + 1, prerequisites.length));
  };

  const goPrev = () => {
    setCurrentStep((c) => Math.max(0, c - 1));
  };

  if (!open) return null;

  return (
    <div
      className="ftg-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ftg-title"
      onMouseDown={(e) => {
        // clicking backdrop closes
        if (e.target === e.currentTarget) closeGuide();
      }}
    >
      <style>{`
        /* Clean, compact guide modal with blurred backdrop */
        .ftg-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 9999;
          background: rgba(10,11,13,0.45);
          backdrop-filter: blur(6px) saturate(120%);
          -webkit-backdrop-filter: blur(6px) saturate(120%);
        }

        .ftg-card {
          width: 100%;
          max-width: 920px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,251,0.98));
          border-radius: 14px;
          box-shadow: 0 18px 60px rgba(8,15,30,0.45);
          overflow: hidden;
          transform-origin: center;
          animation: ftg-pop 320ms cubic-bezier(.2,.9,.3,1);
          display: grid;
          grid-template-columns: 1fr 360px;
        }

        @keyframes ftg-pop {
          from { opacity: 0; transform: translateY(12px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Left: content area */
        .ftg-left {
          padding: 28px 32px;
        }

        .ftg-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
        }

        #ftg-title {
          font-size:20px;
          font-weight:700;
          color:#0f172a;
        }

        .ftg-sub {
          font-size:13px;
          color:#475569;
          margin-top:6px;
        }

        .ftg-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding:8px;
          border-radius:8px;
          color:#64748b;
        }
        .ftg-close:hover { background: rgba(15,23,42,0.04); color:#0f172a; }

        .ftg-progress {
          display:flex;
          gap:12px;
          margin:20px 0 18px;
          align-items:center;
        }

        .ftg-bar {
          position:relative;
          height:8px;
          background: #f1f5f9;
          border-radius:999px;
          flex:1;
          overflow:hidden;
        }

        .ftg-fill {
          position:absolute;
          left:0; top:0; bottom:0;
          background: linear-gradient(90deg,#667eea,#764ba2);
          width: 0%;
          transition: width .35s ease;
        }

        .ftg-steps {
          display:flex;
          gap:10px;
          align-items:center;
        }

        .ftg-step-dot {
          width:30px;height:30px;border-radius:999px;
          display:inline-grid; place-items:center;
          background: white; border: 2px solid #e6eefc;
          color:#94a3b8; font-weight:700;
        }
        .ftg-step-dot.active {
          background: linear-gradient(135deg,#667eea,#764ba2);
          color:white; box-shadow: 0 8px 28px rgba(102,126,234,0.22);
        }
        .ftg-step-dot.done { background:#10b981; color:white; border-color:#10b981; }

        .ftg-card-body { margin-top:10px; }

        .ftg-alert {
          display:flex; gap:12px; align-items:flex-start;
          background: linear-gradient(180deg,#fffbeb,#fef3c7);
          border:1px solid #fde68a; padding:12px; border-radius:10px;
          color:#92400e; margin-bottom:14px; font-size:14px;
        }

        .ftg-prereq {
          background: white; border: 1px solid #f1f5f9;
          padding:18px; border-radius:12px; margin-bottom:14px;
          display:flex; gap:14px; align-items:flex-start;
        }

        .ftg-prereq .icon {
          width:52px; height:52px; border-radius:12px;
          display:grid;place-items:center;color:white;font-weight:700;
          flex-shrink:0;
        }

        .ftg-prereq h4 { margin:0; font-size:16px; color:#0f172a; font-weight:700; }
        .ftg-prereq p { margin:6px 0 0; color:#64748b; font-size:14px; line-height:1.45; }

        .ftg-action {
          margin-top:14px;
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:10px; cursor:pointer;
          color:white; font-weight:600; border: none;
        }

        .ftg-action:hover { transform: translateX(6px); }

        /* Right column: completion / features */
        .ftg-right {
          padding:26px;
          border-left:1px solid #f1f5f9;
          background: linear-gradient(180deg, rgba(250,250,251,0.95), rgba(255,255,255,0.95));
        }
        .ftg-ready {
          text-align:center;
        }
        .ftg-success-badge {
          width:84px;height:84px;border-radius:999px;margin:0 auto 10px;
          display:grid;place-items:center;color:white;font-weight:700;
          background: linear-gradient(135deg,#10b981,#059669);
          box-shadow: 0 12px 30px rgba(5,102,85,0.12);
        }
        .ftg-features { margin-top:14px; display:grid; gap:10px; }
        .ftg-feature {
          background: #fff; border:1px solid #eef2ff; padding:12px; border-radius:10px;
        }
        .ftg-footer {
          display:flex; gap:12px; justify-content:space-between; align-items:center;
          margin-top:16px;
        }

        .btn {
          border-radius:10px; padding:10px 14px; cursor:pointer; font-weight:700; border:none;
        }
        .btn.ghost { background:white; color:#475569; border:1px solid #eef2ff; }
        .btn.primary { background: linear-gradient(90deg,#667eea,#764ba2); color:white; }

        @media (max-width: 980px) {
          .ftg-card { grid-template-columns: 1fr; max-width:760px; }
          .ftg-right { border-left: none; border-top:1px solid #f1f5f9; }
        }
      `}</style>

      <div className="ftg-card" ref={containerRef}>
        {/* LEFT: main interactive stepper */}
        <div className="ftg-left">
          <div className="ftg-head">
            <div>
              <div id="ftg-title">Quick setup guide</div>
              <div className="ftg-sub">A short, guided checklist — completes in less than 2 minutes.</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#64748b' }}>
                Step {Math.min(currentStep + 1, prerequisites.length + 1)} / {prerequisites.length + 1}
              </div>
              <button
                className="ftg-close"
                aria-label="Close guide"
                onClick={() => closeGuide()}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="ftg-progress" aria-hidden>
            <div className="ftg-bar" style={{ width: '100%' }}>
              <div
                className="ftg-fill"
                style={{
                  width: `${(currentStep / (prerequisites.length)) * 100}%`
                }}
              />
            </div>

            <div className="ftg-steps" role="list">
              {prerequisites.map((p, i) => {
                const done = completedSteps.includes(p.id);
                const active = i === currentStep;
                return (
                  <div key={p.id} role="listitem" style={{ textAlign: 'center' }}>
                    <div
                      className={`ftg-step-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                      title={p.title}
                    >
                      {done ? <Check size={16} /> : i + 1}
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign: 'center' }}>
                <div className={`ftg-step-dot ${currentStep === prerequisites.length ? 'active' : ''}`}>
                  <Sparkles size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="ftg-card-body">
            {currentStep < prerequisites.length ? (
              <>
                <div className="ftg-alert" role="note">
                  <AlertCircle size={18} />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Before you begin</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      Complete steps in order. Use keyboard arrows ← → to navigate and Esc to close.
                    </div>
                  </div>
                </div>

                {/* Show current prerequisite card */}
                {prerequisites.slice(currentStep, currentStep + 1).map((pr) => {
                  const Icon = pr.icon;
                  const done = completedSteps.includes(pr.id);
                  return (
                    <div className="ftg-prereq" key={pr.id}>
                      <div
                        className="icon"
                        style={{
                          background: done ? '#10b981' : 'linear-gradient(135deg,#667eea,#764ba2)'
                        }}
                      >
                        <Icon size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4>{pr.title}</h4>
                        <p>{pr.description}</p>

                        <div style={{ marginTop: 12 }}>
                          <button
                            data-autofocus
                            className="ftg-action"
                            style={{
                              background: done ? '#10b981' : 'linear-gradient(135deg,#667eea,#764ba2)'
                            }}
                            onClick={() => markComplete(pr.id)}
                          >
                            {done ? (
                              <>
                                <Check size={16} /> Completed
                              </>
                            ) : (
                              <>
                                {pr.action} <ChevronRight size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              /* Final / Ready pane */
              <div style={{ paddingTop: 6 }}>
                <div style={{ textAlign: 'left', marginBottom: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>You're all set 🎉</div>
                  <div style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>
                    You finished the quick setup. Below are a few things you can explore next.
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {features.map((f, idx) => (
                    <div key={idx} style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #eef2ff'
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, display: 'grid',
                        placeItems: 'center', background: '#f8fafc', color: '#0f172a', fontWeight: 700
                      }}>{f.title.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{f.title}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ftg-footer">
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn ghost"
                onClick={() => {
                  // quick skip/close
                  closeGuide();
                }}
              >
                Skip
              </button>

              <button
                className="btn ghost"
                onClick={() => {
                  // reset progress
                  setCompletedSteps([]);
                  setCurrentStep(0);
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={goPrev} disabled={currentStep === 0}>
                ← Previous
              </button>

              {currentStep < prerequisites.length ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    // only allow next if current is completed
                    const cur = prerequisites[currentStep].id;
                    if (!completedSteps.includes(cur)) return;
                    goNext();
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  className="btn primary"
                  onClick={() => {
                    handleFinish();
                  }}
                >
                  Start using app <Sparkles size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: summary / status column */}
        <aside className="ftg-right" aria-hidden={false}>
          {currentStep < prerequisites.length ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {prerequisites[currentStep].title}
                </div>
                <div style={{ marginLeft: 'auto', color: '#64748b' }}>
                  {completedSteps.includes(prerequisites[currentStep].id) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Check size={16} color="#10b981" /> Done
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>In progress</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
                {prerequisites[currentStep].description}
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Checklist
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {prerequisites.map((p) => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: completedSteps.includes(p.id) ? '#f0fdf4' : 'transparent',
                      padding: '8px', borderRadius: 8
                    }}>
                      <div style={{
                        width:18, height:18, borderRadius:6, display:'grid', placeItems:'center',
                        background: completedSteps.includes(p.id) ? '#10b981' : '#eef2ff', color: completedSteps.includes(p.id)?'white':'#64748b'
                      }}>
                        {completedSteps.includes(p.id) ? <Check size={12} /> : <small>{p.title.charAt(0)}</small>}
                      </div>
                      <div style={{ fontSize:13, color: '#475569' }}>{p.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="ftg-ready">
              <div className="ftg-success-badge"><Check size={36} /></div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Setup complete</div>
              <div style={{ color: '#64748b', marginTop: 8 }}>
                Nice work — your system is ready. Continue to the dashboard to start managing classes.
              </div>

              <div style={{ marginTop: 16 }} className="ftg-features">
                {features.map((f, i) => (
                  <div key={i} className="ftg-feature">
                    <div style={{ fontWeight: 700 }}>{f.title}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
