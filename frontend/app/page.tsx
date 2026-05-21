"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll(".fade-up");

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 2800);
  };

  const copyMomo = async () => {
    const num =
      document
        .getElementById("momo-num")
        ?.textContent?.replace(/\s/g, "") || "";

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(num);
    }

    showToast("MoMo number copied to clipboard");
  };

  const handleSubmit = () => {
    setSending(true);

    setTimeout(() => {
      setSending(false);

      showToast(
        "Thank you! Our admissions team will contact you within 24 hours."
      );
    }, 1400);
  };

  const handleLogin = () => {
    showToast("Redirecting to Theohans EduPortal…");
    router.push('/auth/login/')
  };

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        :root{
          --navy:#0b1f3a;
          --navy-mid:#162d52;
          --navy-light:#1e3d6e;
          --gold:#c49a3c;
          --gold-light:#e8c97a;
          --gold-pale:#fdf6e3;
          --gold-muted:#f5edd0;
          --white:#ffffff;
          --off-white:#fafaf8;
          --gray-50:#f7f7f5;
          --gray-100:#ededea;
          --gray-200:#d8d8d3;
          --gray-400:#9d9d97;
          --gray-600:#5e5e58;
          --gray-800:#2a2a26;
          --success:#2a6b3c;
          --success-bg:#eaf4ed;
          --text-body:#2a2a26;
          --text-mid:#5e5e58;
          --text-faint:#9d9d97;
          --radius-sm:6px;
          --radius-md:12px;
          --radius-lg:20px;
          --radius-xl:32px;
          --shadow-sm:0 1px 4px rgba(11,31,58,0.08);
          --shadow-md:0 4px 20px rgba(11,31,58,0.1);
          --shadow-lg:0 12px 48px rgba(11,31,58,0.14);
        }

        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--white);color:var(--text-body);-webkit-font-smoothing:antialiased;overflow-x:hidden}

        .container{max-width:1200px;margin:0 auto;padding:0 32px}
        .container-wide{max-width:1440px;margin:0 auto;padding:0 48px}
        .label{font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:var(--gold)}
        .section-title{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);font-weight:500;line-height:1.1;color:var(--navy)}
        .section-title em{font-style:italic;color:var(--gold)}
        .lead{font-size:17px;line-height:1.75;color:var(--text-mid);font-weight:300}
        .announce-bar{background:var(--navy);color:var(--gold-light);text-align:center;padding:10px 20px;font-size:13px;font-weight:400;letter-spacing:0.02em;position:relative;overflow:hidden}
        .announce-bar::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 200px,rgba(196,154,60,0.04) 200px,rgba(196,154,60,0.04) 201px)}
        .announce-bar strong{font-weight:600;color:var(--white)}
        .announce-bar a{color:var(--gold-light);text-decoration:underline;text-underline-offset:3px}
        nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--gray-100);transition:box-shadow 0.3s}
        nav.scrolled{box-shadow:var(--shadow-sm)}
        .nav-inner{display:flex;align-items:center;justify-content:space-between;height:72px;gap:32px}
        .nav-logo{display:flex;align-items:center;gap:12px;text-decoration:none;flex-shrink:0}
        .nav-logo-mark{width:42px;height:42px;background:var(--navy);border-radius:10px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
        .nav-logo-mark::after{content:'TH';font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold-light);line-height:1}
        .nav-logo-text{}
        .nav-logo-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:var(--navy);line-height:1.1;display:block}
        .nav-logo-sub{font-size:10px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-faint);display:block;margin-top:1px}
        .nav-links{display:flex;align-items:center;gap:2px;list-style:none;flex:1;justify-content:center}
        .nav-links a{font-size:13.5px;font-weight:500;color:var(--text-mid);text-decoration:none;padding:8px 14px;border-radius:var(--radius-sm);transition:color 0.2s,background 0.2s;white-space:nowrap}
        .nav-links a:hover{color:var(--navy);background:var(--gray-50)}
        .nav-links .has-dropdown{position:relative}
        .nav-ctas{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13.5px;border-radius:var(--radius-sm);padding:10px 20px;cursor:pointer;transition:all 0.2s;text-decoration:none;border:none;white-space:nowrap}
        .btn-ghost{background:transparent;color:var(--text-mid);border:1px solid var(--gray-200)}
        .btn-ghost:hover{background:var(--gray-50);color:var(--navy);border-color:var(--gray-400)}
        .btn-primary{background:var(--navy);color:var(--white)}
        .btn-primary:hover{background:var(--navy-light);transform:translateY(-1px);box-shadow:0 4px 16px rgba(11,31,58,0.25)}
        .btn-gold{background:var(--gold);color:var(--white)}
        .btn-gold:hover{background:#b5892c;transform:translateY(-1px);box-shadow:0 4px 16px rgba(196,154,60,0.4)}
        .btn-lg{padding:15px 32px;font-size:15px;border-radius:var(--radius-md)}
        .btn-outline-white{background:transparent;color:var(--white);border:1.5px solid rgba(255,255,255,0.5)}
        .btn-outline-white:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.8)}
        .btn svg,.btn-lg svg{flex-shrink:0;transition:transform 0.2s}
        .btn:hover svg{transform:translateX(2px)}
        .login-indicator{width:8px;height:8px;border-radius:50%;background:#3dd68c;display:inline-block;margin-right:2px;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero{position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:center;overflow:hidden;background:var(--navy)}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg-img{width:100%;height:100%;object-fit:cover;opacity:0.18}
        .hero-bg-pattern{position:absolute;inset:0;background-image:radial-gradient(circle at 20% 50%,rgba(196,154,60,0.12) 0%,transparent 60%),radial-gradient(circle at 80% 20%,rgba(30,61,110,0.8) 0%,transparent 50%)}
        .hero-grid-overlay{position:absolute;inset:0;background-image:linear-gradient(rgba(196,154,60,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(196,154,60,0.04) 1px,transparent 1px);background-size:80px 80px;opacity:0.5}
        .hero-content{position:relative;z-index:2;padding:120px 0 100px}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:10px;background:rgba(196,154,60,0.15);border:1px solid rgba(196,154,60,0.3);border-radius:100px;padding:6px 16px;margin-bottom:32px}
        .hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--gold-light);animation:pulse 2s infinite}
        .hero-eyebrow span{font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold-light)}
        .hero h1{font-family:'Playfair Display',serif;font-size:clamp(44px,6vw,82px);font-weight:500;line-height:1.05;color:var(--white);max-width:760px;margin-bottom:28px}
        .hero h1 em{font-style:italic;color:var(--gold-light)}
        .hero-sub{font-size:18px;line-height:1.7;color:rgba(255,255,255,0.7);max-width:560px;margin-bottom:48px;font-weight:300}
        .hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:72px}
        .hero-stats{display:flex;gap:0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-lg);overflow:hidden;backdrop-filter:blur(8px)}
        .hero-stat{flex:1;padding:24px 28px;border-right:1px solid rgba(255,255,255,0.08);text-align:center}
        .hero-stat:last-child{border-right:none}
        .hero-stat-num{font-family:'Playfair Display',serif;font-size:36px;font-weight:500;color:var(--white);line-height:1}
        .hero-stat-num sup{font-size:18px;color:var(--gold-light)}
        .hero-stat-label{font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-top:6px}
        .hero-scroll{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,0.35);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;z-index:2}
        .hero-scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,0.3),transparent);animation:scrollLine 2s ease-in-out infinite}
        @keyframes scrollLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.01%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
        .hero-floater{position:absolute;right:80px;top:50%;transform:translateY(-50%);z-index:2;display:flex;flex-direction:column;gap:12px;max-width:280px}
        .floater-card{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius-md);padding:16px 20px;backdrop-filter:blur(12px)}
        .floater-card-label{font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:6px}
        .floater-card-value{font-size:14px;font-weight:500;color:var(--white)}
        .floater-card-accred{display:flex;align-items:center;gap:8px}
        .floater-accred-badge{background:var(--gold);border-radius:6px;padding:4px 10px;font-size:10px;font-weight:700;color:var(--white);letter-spacing:0.05em}
        .floater-card-ranks{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        .rank-chip{background:rgba(196,154,60,0.2);border:1px solid rgba(196,154,60,0.35);border-radius:100px;padding:3px 12px;font-size:11px;color:var(--gold-light);font-weight:500}
        .marquee-section{background:var(--navy-mid);padding:18px 0;overflow:hidden;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05)}
        .marquee-track{display:flex;gap:0;animation:marquee 30s linear infinite}
        .marquee-item{display:flex;align-items:center;gap:12px;padding:0 40px;white-space:nowrap;flex-shrink:0}
        .marquee-item span{font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45)}
        .marquee-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);opacity:0.6;flex-shrink:0}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .trust-section{padding:60px 0;border-bottom:1px solid var(--gray-100)}
        .trust-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-faint);margin-bottom:32px}
        .trust-logos{display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
        .trust-logo{font-family:'Playfair Display',serif;font-size:14px;font-weight:500;color:var(--gray-400);letter-spacing:0.05em;opacity:0.7;transition:opacity 0.2s}
        .trust-logo:hover{opacity:1;color:var(--navy)}
        .trust-logo-badge{display:flex;align-items:center;gap:6px}
        .trust-logo-badge svg{opacity:0.5}

        .about-section{padding:112px 0;background:var(--white)}
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .about-visual{position:relative}
        .about-image-main{width:100%;aspect-ratio:4/5;background:var(--navy);border-radius:var(--radius-xl);overflow:hidden;position:relative}
        .about-image-main-inner{width:100%;height:100%;background:linear-gradient(160deg,var(--navy-mid) 0%,var(--navy) 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px}
        .about-image-placeholder{font-family:'Playfair Display',serif;font-size:28px;font-weight:400;color:rgba(255,255,255,0.25);text-align:center;line-height:1.4}
        .about-image-badge{position:absolute;bottom:24px;left:24px;background:var(--gold);border-radius:var(--radius-md);padding:16px 20px;box-shadow:var(--shadow-lg)}
        .about-image-badge-num{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:var(--white);line-height:1}
        .about-image-badge-text{font-size:11px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.1em;margin-top:2px}
        .about-floating-card{position:absolute;top:32px;right:-32px;background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-md);padding:16px 20px;box-shadow:var(--shadow-lg);min-width:200px}
        .about-floating-card-label{font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
        .about-floating-card-list{display:flex;flex-direction:column;gap:6px}
        .about-floating-card-item{font-size:13px;color:var(--text-mid);display:flex;align-items:center;gap:8px}
        .check-icon{width:16px;height:16px;border-radius:50%;background:var(--success-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .check-icon svg{width:10px;height:10px;color:var(--success)}
        .about-text{}
        .about-text .label{margin-bottom:14px;display:block}
        .about-text .section-title{margin-bottom:24px}
        .about-text .lead{margin-bottom:32px}
        .pillars{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:40px}
        .pillar{background:var(--gray-50);border-radius:var(--radius-md);padding:20px;border:1px solid var(--gray-100)}
        .pillar-icon{width:36px;height:36px;background:var(--navy);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
        .pillar-icon svg{width:18px;height:18px;color:var(--gold-light)}
        .pillar h4{font-family:'Playfair Display',serif;font-size:15px;font-weight:500;color:var(--navy);margin-bottom:6px}
        .pillar p{font-size:13px;line-height:1.6;color:var(--text-mid)}
        .programs-section{padding:112px 0;background:var(--off-white)}
        .programs-header{text-align:center;max-width:600px;margin:0 auto 64px}
        .programs-header .label{margin-bottom:12px;display:block}
        .programs-header .section-title{margin-bottom:16px}
        .programs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .program-card{background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-lg);overflow:hidden;transition:transform 0.25s,box-shadow 0.25s,border-color 0.25s;position:relative}
        .program-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:var(--gray-200)}
        .program-card.featured{border:2px solid var(--gold);background:linear-gradient(160deg,var(--gold-pale) 0%,var(--white) 60%)}
        .program-featured-badge{position:absolute;top:16px;right:16px;background:var(--gold);color:var(--white);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 12px;border-radius:100px}
        .program-header{height:140px;display:flex;align-items:flex-end;padding:24px;position:relative;overflow:hidden}
        .program-header-bg{position:absolute;inset:0}
        .program-p1 .program-header-bg{background:linear-gradient(135deg,#0b2040,#1a3a5c)}
        .program-p2 .program-header-bg{background:linear-gradient(135deg,#2a1a4a,#4a2a7a)}
        .program-p3 .program-header-bg{background:linear-gradient(135deg,#0a3020,#1a5a3a)}
        .program-p4 .program-header-bg{background:linear-gradient(135deg,#3a1a0a,#6a3010)}
        .program-p5 .program-header-bg{background:linear-gradient(135deg,#1a0a3a,#3a1a6a)}
        .program-p6 .program-header-bg{background:linear-gradient(135deg,#0a2a3a,#1a4a5a)}
        .program-header-pattern{position:absolute;inset:0;opacity:0.15;background-image:radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px);background-size:20px 20px}
        .program-age-tag{position:relative;z-index:1;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:100px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--white);letter-spacing:0.05em}
        .program-body{padding:24px}
        .program-body h3{font-family:'Playfair Display',serif;font-size:20px;font-weight:500;color:var(--navy);margin-bottom:8px;line-height:1.2}
        .program-body p{font-size:13.5px;line-height:1.65;color:var(--text-mid);margin-bottom:16px}
        .program-meta{display:flex;gap:16px}
        .program-meta-item{font-size:12px;color:var(--text-faint);display:flex;align-items:center;gap:5px}
        .program-meta-item svg{width:12px;height:12px;flex-shrink:0}
        .system-section{padding:112px 0;background:var(--navy);position:relative;overflow:hidden}
        .system-bg-pattern{position:absolute;inset:0;background-image:radial-gradient(circle at 10% 80%,rgba(196,154,60,0.08) 0%,transparent 50%),radial-gradient(circle at 90% 20%,rgba(30,61,110,0.5) 0%,transparent 50%);pointer-events:none}
        .system-section .label{color:var(--gold-light)}
        .system-section .section-title{color:var(--white);margin-bottom:16px}
        .system-section .lead{color:rgba(255,255,255,0.6);margin-bottom:64px}
        .system-header{text-align:center;max-width:640px;margin:0 auto 64px}
        .system-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:60px}
        .system-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-lg);padding:28px;transition:background 0.2s,border-color 0.2s}
        .system-card:hover{background:rgba(255,255,255,0.08);border-color:rgba(196,154,60,0.3)}
        .system-card-icon{width:44px;height:44px;background:rgba(196,154,60,0.15);border:1px solid rgba(196,154,60,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
        .system-card-icon svg{width:22px;height:22px;color:var(--gold-light)}
        .system-card h4{font-family:'Playfair Display',serif;font-size:17px;font-weight:500;color:var(--white);margin-bottom:10px;line-height:1.2}
        .system-card p{font-size:13px;line-height:1.65;color:rgba(255,255,255,0.5)}
        .system-login-cta{background:rgba(196,154,60,0.1);border:1px solid rgba(196,154,60,0.25);border-radius:var(--radius-xl);padding:48px;display:flex;align-items:center;justify-content:space-between;gap:32px;position:relative;overflow:hidden}
        .system-login-cta::before{content:'';position:absolute;right:-60px;top:50%;transform:translateY(-50%);width:300px;height:300px;border-radius:50%;background:rgba(196,154,60,0.06);pointer-events:none}
        .system-login-left{}
        .system-login-eyebrow{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
        .system-login-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:500;color:var(--white);line-height:1.2;margin-bottom:12px}
        .system-login-sub{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;max-width:460px}
        .system-login-right{display:flex;flex-direction:column;gap:12px;flex-shrink:0}
        .portal-btn{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius-md);padding:14px 20px;cursor:pointer;transition:all 0.2s;text-decoration:none;min-width:220px}
        .portal-btn:hover{background:rgba(255,255,255,0.12);border-color:rgba(196,154,60,0.4);transform:translateX(2px)}
        .portal-btn-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .portal-btn-icon.admin{background:rgba(196,154,60,0.2)}
        .portal-btn-icon.teacher{background:rgba(59,130,246,0.2)}
        .portal-btn-icon.parent{background:rgba(34,197,94,0.15)}
        .portal-btn-text{}
        .portal-btn-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:2px}
        .portal-btn-desc{font-size:11px;color:rgba(255,255,255,0.4);font-weight:400}
        .portal-btn-arrow{margin-left:auto;color:rgba(255,255,255,0.3);flex-shrink:0;transition:color 0.2s}
        .portal-btn:hover .portal-btn-arrow{color:var(--gold-light)}
        .academics-section{padding:112px 0;background:var(--white)}
        .academics-grid{display:grid;grid-template-columns:5fr 7fr;gap:80px;align-items:start}
        .academics-visual{background:var(--gray-50);border-radius:var(--radius-xl);padding:40px;border:1px solid var(--gray-100)}
        .curriculum-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:500;color:var(--navy);margin-bottom:8px}
        .curriculum-sub{font-size:13px;color:var(--text-mid);margin-bottom:28px;line-height:1.5}
        .curriculum-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--gray-100)}
        .curriculum-item:last-child{border-bottom:none}
        .curriculum-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .curriculum-item-text{}
        .curriculum-item-name{font-size:14px;font-weight:600;color:var(--navy)}
        .curriculum-item-desc{font-size:12px;color:var(--text-faint);margin-top:2px}
        .curriculum-item-badge{margin-left:auto;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:100px;flex-shrink:0}
        .badge-offered{background:var(--success-bg);color:var(--success)}
        .badge-ib{background:#ede8f5;color:#5b1e8a}
        .badge-cambridge{background:#e8f0fb;color:#1e4a8a}
        .grade-scale{margin-top:24px;background:var(--white);border-radius:var(--radius-md);padding:16px;border:1px solid var(--gray-100)}
        .grade-scale-title{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-faint);margin-bottom:12px}
        .grade-bar{height:8px;border-radius:100px;background:linear-gradient(90deg,#e24b4a,#ef9f27,#639922);margin-bottom:6px}
        .grade-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--text-faint);font-weight:500}
        .enroll-section{padding:112px 0;background:var(--off-white)}
        .enroll-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
        .enroll-text .label{display:block;margin-bottom:14px}
        .enroll-text .section-title{margin-bottom:20px}
        .enroll-text .lead{margin-bottom:40px}
        .enroll-steps{display:flex;flex-direction:column;gap:0}
        .enroll-step{display:flex;gap:20px;position:relative;padding-bottom:32px}
        .enroll-step:last-child{padding-bottom:0}
        .enroll-step-line{position:absolute;left:19px;top:40px;width:2px;height:calc(100% - 8px);background:linear-gradient(to bottom,var(--gold),transparent);pointer-events:none}
        .enroll-step:last-child .enroll-step-line{display:none}
        .step-num{width:40px;height:40px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--gold-light);flex-shrink:0;z-index:1;box-shadow:0 0 0 6px var(--off-white)}
        .step-content{}
        .step-content h4{font-size:16px;font-weight:600;color:var(--navy);margin-bottom:6px;line-height:1.2;margin-top:8px}
        .step-content p{font-size:13.5px;line-height:1.65;color:var(--text-mid)}
        .enroll-panel{display:flex;flex-direction:column;gap:20px}
        .payment-card{background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-xl);padding:32px;box-shadow:var(--shadow-md)}
        .payment-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .payment-card-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:500;color:var(--navy)}
        .momo-badge{display:flex;align-items:center;gap:8px;background:#fff8f0;border:1px solid #ffd6a0;border-radius:100px;padding:5px 14px}
        .momo-badge-dot{width:8px;height:8px;border-radius:50%;background:#ff8c00}
        .momo-badge-text{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#cc6600}
        .momo-info{background:linear-gradient(135deg,#fff8f0,#fff3e0);border:1px solid #ffe0b2;border-radius:var(--radius-md);padding:20px;margin-bottom:20px}
        .momo-number-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .momo-label{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#cc6600}
        .momo-number{font-family:'Playfair Display',serif;font-size:24px;font-weight:600;color:var(--navy);letter-spacing:0.08em}
        .momo-name{font-size:13px;color:var(--text-mid)}
        .momo-network{font-size:11px;font-weight:700;color:#ff8c00;text-transform:uppercase;letter-spacing:0.1em}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;background:var(--navy);color:var(--white);border:none;border-radius:6px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.2s}
        .copy-btn:hover{background:var(--navy-light)}
        .fee-table{width:100%;border-collapse:collapse}
        .fee-table tr{border-bottom:1px solid var(--gray-100)}
        .fee-table tr:last-child{border-bottom:none}
        .fee-table td{padding:10px 0;font-size:13.5px}
        .fee-table td:first-child{color:var(--text-mid)}
        .fee-table td:last-child{text-align:right;font-weight:600;color:var(--navy)}
        .fee-note{font-size:11px;color:var(--text-faint);margin-top:12px;line-height:1.5}
        .deadlines-card{background:var(--navy);border-radius:var(--radius-xl);padding:28px}
        .deadlines-card-title{font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:20px}
        .deadline-item{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07)}
        .deadline-item:last-child{border-bottom:none}
        .deadline-name{font-size:13.5px;color:rgba(255,255,255,0.8)}
        .deadline-date{font-size:12px;font-weight:600;color:var(--gold-light);background:rgba(196,154,60,0.15);padding:3px 10px;border-radius:100px}
        .facilities-section{padding:112px 0;background:var(--white)}
        .facilities-header{margin-bottom:64px}
        .facilities-header .label{margin-bottom:14px;display:block}
        .facilities-header .section-title{max-width:500px;margin-bottom:16px}
        .facilities-header .lead{max-width:480px}
        .facilities-bento{display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:auto;gap:16px}
        .facility-item{border-radius:var(--radius-lg);overflow:hidden;position:relative;background:var(--navy);display:flex;align-items:flex-end;padding:24px;min-height:200px}
        .facility-item::before{content:'';position:absolute;inset:0;opacity:0.3}
        .facility-item:nth-child(1){grid-column:span 3;grid-row:span 1;min-height:260px}
        .facility-item:nth-child(2){grid-column:span 2}
        .facility-item:nth-child(3){grid-column:span 1}
        .facility-item:nth-child(4){grid-column:span 2}
        .facility-item:nth-child(5){grid-column:span 4}
        .facility-bg-1{background:linear-gradient(160deg,#0b2a3a 0%,#0f3d1a 100%)}
        .facility-bg-2{background:linear-gradient(160deg,#2a0b3a 0%,#3a1f6a 100%)}
        .facility-bg-3{background:linear-gradient(160deg,#3a2a0b 0%,#5a3a10 100%)}
        .facility-bg-4{background:linear-gradient(160deg,#0b1f3a 0%,#1a3d6a 100%)}
        .facility-bg-5{background:linear-gradient(160deg,#0b3a2a 0%,#1a5a3a 100%)}
        .facility-pattern{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px);background-size:24px 24px;opacity:0.3}
        .facility-content{position:relative;z-index:1}
        .facility-icon{width:44px;height:44px;background:rgba(255,255,255,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;border:1px solid rgba(255,255,255,0.15)}
        .facility-icon svg{width:22px;height:22px;color:rgba(255,255,255,0.9)}
        .facility-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:500;color:var(--white);line-height:1.2}
        .facility-desc{font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;line-height:1.5}
        .testimonials-section{padding:112px 0;background:var(--off-white)}
        .testimonials-header{text-align:center;max-width:600px;margin:0 auto 64px}
        .testimonials-header .label{display:block;margin-bottom:12px}
        .testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .testimonial-card{background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-lg);padding:32px;transition:transform 0.2s,box-shadow 0.2s}
        .testimonial-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
        .testimonial-stars{display:flex;gap:3px;margin-bottom:20px}
        .star{width:14px;height:14px;color:var(--gold)}
        .testimonial-quote{font-family:'Cormorant Garamond',serif;font-size:18px;line-height:1.6;color:var(--text-body);margin-bottom:24px;font-style:italic}
        .testimonial-author{display:flex;align-items:center;gap:12px}
        .testimonial-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:15px;font-weight:700;flex-shrink:0}
        .ta-1{background:#e8f0fb;color:#1e4a8a}
        .ta-2{background:#eaf3de;color:#3b6d11}
        .ta-3{background:#faeeda;color:#854f0b}
        .ta-4{background:#ede8f5;color:#5b1e8a}
        .testimonial-name{font-size:14px;font-weight:600;color:var(--navy);margin-bottom:2px}
        .testimonial-role{font-size:12px;color:var(--text-faint)}
        .faculty-section{padding:112px 0;background:var(--white)}
        .faculty-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:56px}
        .faculty-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .faculty-card{background:var(--gray-50);border-radius:var(--radius-lg);padding:28px;text-align:center;border:1px solid var(--gray-100);transition:transform 0.2s,background 0.2s}
        .faculty-card:hover{transform:translateY(-3px);background:var(--white);box-shadow:var(--shadow-md)}
        .faculty-avatar{width:72px;height:72px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:24px;font-weight:700;border:3px solid var(--white)}
        .fa-1{background:#e8f0fb;color:#1e4a8a}
        .fa-2{background:#f5ebe8;color:#8a3b1e}
        .fa-3{background:#f0e8f5;color:#6b3fa0}
        .fa-4{background:#eaf3de;color:#3b6d11}
        .fa-5{background:#faeeda;color:#854f0b}
        .fa-6{background:#e8f5f0;color:#1e6b52}
        .fa-7{background:#f5e8ec;color:#8a1e3b}
        .fa-8{background:#e8f0fb;color:#1e4a8a}
        .faculty-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:500;color:var(--navy);margin-bottom:4px}
        .faculty-role{font-size:12px;color:var(--text-faint);margin-bottom:10px}
        .faculty-qual{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
        .qual-tag{font-size:10px;font-weight:600;letter-spacing:0.05em;color:var(--gold);background:var(--gold-muted);padding:2px 10px;border-radius:100px;text-transform:uppercase}
        .news-section{padding:112px 0;background:var(--off-white)}
        .news-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:56px}
        .news-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:20px}
        .news-card{background:var(--white);border:1px solid var(--gray-100);border-radius:var(--radius-lg);overflow:hidden;transition:transform 0.2s,box-shadow 0.2s}
        .news-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
        .news-image{height:220px;display:flex;align-items:flex-end;padding:20px;position:relative}
        .news-image-1{background:linear-gradient(160deg,#0b2a3a,#1a5a3a)}
        .news-image-2{background:linear-gradient(160deg,#2a0b1a,#5a1a3a)}
        .news-image-3{background:linear-gradient(160deg,#1a2a0b,#3a5a1a)}
        .news-image-pattern{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px);background-size:16px 16px}
        .news-tag{position:relative;z-index:1;background:var(--gold);color:var(--white);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 12px;border-radius:100px}
        .news-body{padding:24px}
        .news-body h3{font-family:'Playfair Display',serif;font-size:18px;font-weight:500;color:var(--navy);margin-bottom:10px;line-height:1.3}
        .news-card:nth-child(2) .news-body h3,.news-card:nth-child(3) .news-body h3{font-size:15px}
        .news-body p{font-size:13px;line-height:1.65;color:var(--text-mid);margin-bottom:16px}
        .news-meta{font-size:11px;color:var(--text-faint);display:flex;align-items:center;gap:12px}
        .news-meta-dot{width:3px;height:3px;border-radius:50%;background:var(--gray-200)}
        .events-card{background:var(--navy);border-radius:var(--radius-lg);overflow:hidden}
        .events-header-bar{background:rgba(196,154,60,0.2);border-bottom:1px solid rgba(196,154,60,0.2);padding:16px 24px}
        .events-title{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold)}
        .events-list{padding:8px 0}
        .event-item{display:flex;gap:16px;align-items:flex-start;padding:14px 24px;border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s}
        .event-item:last-child{border-bottom:none}
        .event-item:hover{background:rgba(255,255,255,0.04)}
        .event-date-block{background:rgba(196,154,60,0.15);border-radius:8px;padding:6px 10px;text-align:center;flex-shrink:0;min-width:46px}
        .event-date-day{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold-light);line-height:1}
        .event-date-month{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin-top:2px}
        .event-info h5{font-size:13px;font-weight:600;color:var(--white);margin-bottom:3px;line-height:1.3}
        .event-info p{font-size:11px;color:rgba(255,255,255,0.4)}
        .contact-section{padding:112px 0;background:var(--white)}
        .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px}
        .contact-text .label{display:block;margin-bottom:14px}
        .contact-text .section-title{margin-bottom:20px}
        .contact-text .lead{margin-bottom:40px}
        .contact-info-list{display:flex;flex-direction:column;gap:20px}
        .contact-info-item{display:flex;gap:16px;align-items:flex-start}
        .contact-info-icon{width:44px;height:44px;background:var(--gold-pale);border:1px solid #e8ddc8;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .contact-info-icon svg{width:20px;height:20px;color:var(--gold)}
        .contact-info-label{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-faint);margin-bottom:4px}
        .contact-info-value{font-size:15px;font-weight:500;color:var(--navy);line-height:1.4}
        .contact-info-sub{font-size:12px;color:var(--text-faint);margin-top:2px}
        .contact-form-card{background:var(--navy);border-radius:var(--radius-xl);padding:40px}
        .contact-form-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:400;color:var(--white);margin-bottom:6px}
        .contact-form-sub{font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:28px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .form-group{margin-bottom:14px}
        .form-label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px;display:block}
        .form-input,.form-select,.form-textarea{width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius-sm);padding:12px 16px;color:var(--white);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s,background 0.2s}
        .form-input::placeholder,.form-textarea::placeholder{color:rgba(255,255,255,0.3)}
        .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:rgba(196,154,60,0.5);background:rgba(255,255,255,0.1)}
        .form-select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' strokeWidth='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
        .form-select option{background:var(--navy)}
        .form-textarea{resize:vertical;min-height:100px}
        .form-submit{width:100%;background:var(--gold);color:var(--white);border:none;border-radius:var(--radius-sm);padding:14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:background 0.2s,transform 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .form-submit:hover{background:#b5892c;transform:translateY(-1px)}
        footer{background:var(--navy);padding:80px 0 0;position:relative;overflow:hidden}
        footer::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(196,154,60,0.06),transparent 70%);pointer-events:none}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;padding-bottom:56px;border-bottom:1px solid rgba(255,255,255,0.07)}
        .footer-brand{}
        .footer-brand-logo{display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .footer-brand-mark{width:44px;height:44px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold-light)}
        .footer-brand-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:500;color:var(--white)}
        .footer-brand-tagline{font-size:13px;line-height:1.65;color:rgba(255,255,255,0.4);margin-bottom:24px;max-width:320px}
        .footer-accreds{display:flex;gap:8px;flex-wrap:wrap}
        .footer-accred{background:rgba(196,154,60,0.1);border:1px solid rgba(196,154,60,0.2);border-radius:var(--radius-sm);padding:4px 12px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold-light)}
        .footer-col-title{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);margin-bottom:20px}
        .footer-links{display:flex;flex-direction:column;gap:10px;list-style:none}
        .footer-links a{font-size:13.5px;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .footer-links a:hover{color:var(--white)}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding:24px 0;gap:24px}
        .footer-copy{font-size:12px;color:rgba(255,255,255,0.3)}
        .footer-socials{display:flex;gap:10px}
        .social-btn{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);transition:background 0.2s,color 0.2s;cursor:pointer;text-decoration:none}
        .social-btn:hover{background:rgba(196,154,60,0.2);color:var(--gold-light);border-color:rgba(196,154,60,0.3)}
        .social-btn svg{width:15px;height:15px}
        .fade-up{opacity:0;transform:translateY(24px);transition:opacity 0.7s ease,transform 0.7s ease}
        .fade-up.visible{opacity:1;transform:translateY(0)}
        .fade-up-delay-1{transition-delay:0.1s}
        .fade-up-delay-2{transition-delay:0.2s}
        .fade-up-delay-3{transition-delay:0.3s}
        .fade-up-delay-4{transition-delay:0.4s}
        .toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--navy);color:var(--white);font-size:13.5px;font-weight:500;padding:12px 24px;border-radius:100px;box-shadow:var(--shadow-lg);opacity:0;transition:all 0.3s;z-index:9999;pointer-events:none;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,0.1)}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        .toast-icon{width:20px;height:20px;border-radius:50%;background:var(--success-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .toast-icon svg{width:12px;height:12px;color:var(--success)}
        @media(max-width:900px){
          .hero-floater{display:none}
          .about-grid,.enroll-grid,.contact-grid{grid-template-columns:1fr}
          .about-floating-card{display:none}
          .programs-grid{grid-template-columns:1fr 1fr}
          .system-grid{grid-template-columns:1fr 1fr}
          .testimonials-grid{grid-template-columns:1fr}
          .faculty-grid{grid-template-columns:1fr 1fr}
          .news-grid{grid-template-columns:1fr}
          .footer-grid{grid-template-columns:1fr 1fr}
          .hero-stats{flex-wrap:wrap}
          .nav-links{display:none}
          .academics-grid{grid-template-columns:1fr}
        }
        @media(max-width:600px){
          .container,.container-wide{padding:0 20px}
          .programs-grid,.system-grid,.faculty-grid,.footer-grid{grid-template-columns:1fr}
          .hero h1{font-size:36px}
          .form-row{grid-template-columns:1fr}
          .facilities-bento{grid-template-columns:1fr 1fr}
          .facility-item{grid-column:span 2!important;grid-row:span 1!important}
          .system-login-cta{flex-direction:column}
          .footer-bottom{flex-direction:column;text-align:center}
          .news-grid{grid-template-columns:1fr}
        }
      `}</style>

<div className="announce-bar">
  🎓 <strong>2025/2026 Admissions Open</strong> — Applications now being accepted for all year groups. <a href="#enroll">Apply before 30th June 2025</a> to secure early-bird fee waiver.
</div>

<nav id="main-nav">
  <div className="container">
    <div className="nav-inner">
      <a className="nav-logo" href="#">
        <div className="nav-logo-mark"></div>
        <div className="nav-logo-text">
          <span className="nav-logo-name">Theohans Academy</span>
          <span className="nav-logo-sub">Accra, Ghana · Est. 2009</span>
        </div>
      </a>
      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#programs">Programmes</a></li>
        <li><a href="#academics">Curriculum</a></li>
        <li><a href="#enroll">Admissions</a></li>
        <li><a href="#facilities">Campus</a></li>
        <li><a href="#news">News</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="nav-ctas">
        <a className="btn btn-ghost" href="#enroll">Apply Now</a>
        <a className="btn btn-primary" href="#portal" onClick={handleLogin}>
          <span className="login-indicator"></span>
          Staff Portal
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </a>
      </div>
    </div>
  </div>
</nav>

<section className="hero" id="home">
  <div className="hero-bg">
    <div className="hero-bg-pattern"></div>
    <div className="hero-grid-overlay"></div>
  </div>

  <div className="hero-floater">
    <div className="floater-card">
      <div className="floater-card-label">Accreditation Status</div>
      <div className="floater-card-accred">
        <div className="floater-accred-badge">IB WORLD SCHOOL</div>
        <span style={{fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>Authorised</span>
      </div>
    </div>
    <div className="floater-card">
      <div className="floater-card-label">Ranked Among</div>
      <div className="floater-card-ranks">
        <span className="rank-chip">#1 Accra</span>
        <span className="rank-chip">Top 10 W.Africa</span>
        <span className="rank-chip">Cambridge School</span>
      </div>
    </div>
    <div className="floater-card">
      <div className="floater-card-label">2024 University Acceptance</div>
      <div className="floater-card-value" style={{fontFamily:'Playfair Display,serif',fontSize:'22px',color:"#fff"}}>
        97% <span style={{fontSize:"13px",color:"rgba(255,255,255,0.45)",fontFamily:"inherit"}}>of graduates</span>
      </div>
    </div>
  </div>

  <div className="container">
    <div className="hero-content">
      <div className="hero-eyebrow">
        <div className="hero-eyebrow-dot"></div>
        <span>Accra's Premier  School</span>
      </div>
      <h1>
        Where <em>Excellence</em><br></br>
        Meets Ambition
      </h1>
      <p className="hero-sub">
        Cultivating world-class scholars, compassionate leaders, and innovative thinkers from Nursery through A-Level in the heart of Accra.
      </p>
      <div className="hero-actions">
        <a href="#enroll" className="btn btn-gold btn-lg">
          Apply for 2025/2026
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="#about" className="btn btn-outline-white btn-lg">
          Discover Our School
        </a>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-num">1,<sup style={{color:"var(--gold-light)"}}>200</sup></div>
          <div className="hero-stat-label">Students Enrolled</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num">42<sup>+</sup></div>
          <div className="hero-stat-label">Nationalities</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num">98<sup>%</sup></div>
          <div className="hero-stat-label">Pass Rate 2024</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-num">15<sup>+</sup></div>
          <div className="hero-stat-label">Years of Excellence</div>
        </div>
      </div>
    </div>
  </div>

  <div className="hero-scroll">
    <div className="hero-scroll-line"></div>
    <span>Scroll</span>
  </div>
</section>

<div className="marquee-section">
  <div className="marquee-track" id="marquee-track">
    <div className="marquee-item"><span>IB World School</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Cambridge Authorised Centre</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>WAEC Accredited</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Ghana Education Service</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>ISO 9001 Certified</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>British Council Partner</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Microsoft Showcase School</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Duke of Edinburgh Award Centre</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>IB World School</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Cambridge Authorised Centre</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>WAEC Accredited</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Ghana Education Service</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>ISO 9001 Certified</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>British Council Partner</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Microsoft Showcase School</span><span className="marquee-dot"></span></div>
    <div className="marquee-item"><span>Duke of Edinburgh Award Centre</span><span className="marquee-dot"></span></div>
  </div>
</div>

<div className="trust-section">
  <div className="container">
    <div className="trust-label">Our graduates attend universities worldwide</div>
    <div className="trust-logos">
      <span className="trust-logo">University of Ghana</span>
      <span className="trust-logo">KNUST</span>
      <span className="trust-logo">Oxford University</span>
      <span className="trust-logo">MIT</span>
      <span className="trust-logo">UCL London</span>
      <span className="trust-logo">McGill University</span>
      <span className="trust-logo">Université de Paris</span>
    </div>
  </div>
</div>

<section className="about-section" id="about">
  <div className="container">
    <div className="about-grid">
      <div className="about-visual fade-up">
        <div className="about-image-main">
          <div className="about-image-main-inner">
            <div style={{width:"80px",height:"80px",background:"rgba(196,154,60,0.15)",border:"1px solid rgba(196,154,60,0.3)",
            borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:"center"}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,60,0.8)" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div className="about-image-placeholder">Theohans<br></br><br></br>Academy</div>
          </div>
          <div className="about-image-badge">
            <div className="about-image-badge-num">Est.</div>
            <div className="about-image-badge-num" style={{fontSize:"40px"}}>2009</div>
            <div className="about-image-badge-text">Founded in Accra</div>
          </div>
        </div>
        <div className="about-floating-card">
          <div className="about-floating-card-label">Accreditations</div>
          <div className="about-floating-card-list">;
            <div className="about-floating-card-item">
              <div className="check-icon"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
              IB World School
            </div>
            <div className="about-floating-card-item">
              <div className="check-icon"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
              Cambridge Authorised Centre
            </div>
            <div className="about-floating-card-item">
              <div className="check-icon"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
              GES Licensed
            </div>
            <div className="about-floating-card-item">
              <div className="check-icon"><svg viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
              ISO 9001:2015 Certified
            </div>
          </div>
        </div>
      </div>
      <div className="about-text fade-up fade-up-delay-2">
        <span className="label">Our Story</span>
        <h2 className="section-title">A Legacy of <em>Learning</em>, Built on Purpose</h2>
        <p className="lead">Founded in 2009 in East Legon, Accra, Theohans Academy was born from a singular conviction: every child deserves a world-class education grounded in African identity and global ambition.</p>
        <p style={{fontSize:"15px",lineHeight:"1.75",color:"var(--text-mid)",marginBottom:"20px"}}>We bring together the rigour of the  Baccalaureate and Cambridge curricula with the warmth of a close-knit community — preparing students not just for university, but for purposeful lives.</p>
        <p style={{fontSize:"15px",lineHeight:"1.75",color:"var(--text-mid)"}}>Our 42-acre campus in East Legon houses state-of-the-art science labs, a 600-seat auditorium, Olympic-standard sports facilities, and a dedicated innovation hub — all within a nurturing, culturally rich environment.</p>
        <div className="pillars">
          <div className="pillar">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4>Academic Rigour</h4>
            <p>IB, Cambridge IGCSE and A-Level programmes delivering world-class outcomes.</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </div>
            <h4>Global Citizenship</h4>
            <p>42+ nationalities learning together, building bridges across cultures.</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44L5.5 8.5A2.5 2.5 0 0 1 8 6h1.5"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.54-11.06A2.5 2.5 0 0 0 16 6h-1.5"/></svg>
            </div>
            <h4>Character First</h4>
            <p>Developing integrity, resilience and service as foundations for leadership.</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/></svg>
            </div>
            <h4>Innovation Hub</h4>
            <p>STEM, robotics, coding and design thinking woven into daily learning.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="programs-section" id="programs">
  <div className="container">
    <div className="programs-header fade-up">
      <span className="label">Academic Programmes</span>
      <h2 className="section-title">Learning at Every <em>Stage</em></h2>
      <p style={{fontSize:"16px",color:"var(--text-mid)",lineHeight:"1.7"}}>From first steps to A-Level excellence — a seamless, coherent educational journey for every learner.</p>
    </div>
    <div className="programs-grid">
      <div className="program-card program-p1 fade-up">
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 2 – 5</span>
        </div>
        <div className="program-body">
          <h3>Early Years Foundation</h3>
          <p>Play-based, inquiry-led learning grounded in the EYFS framework. Nurturing curiosity, language, and social development from the very start.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Max 15/class
            </span>
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Full & Half day
            </span>
          </div>
        </div>
      </div>
      <div className="program-card program-p2 fade-up fade-up-delay-1">
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 5 – 11</span>
        </div>
        <div className="program-body">
          <h3>Primary — IB PYP</h3>
          <p>The IB Primary Years Programme encourages students to think independently, inquire deeply, and act with purpose. Core subjects plus French, ICT and Arts.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Max 22/class
            </span>
          </div>
        </div>
      </div>
      <div className="program-card program-p3 featured fade-up fade-up-delay-2">
        <span className="program-featured-badge">Most Popular</span>
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 11 – 14</span>
        </div>
        <div className="program-body">
          <h3>Lower Secondary — IB MYP</h3>
          <p>The Middle Years Programme develops academic challenge, long-term engagement, and -mindedness across 8 subject groups.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              IB Authorised
            </span>
          </div>
        </div>
      </div>
      <div className="program-card program-p4 fade-up">
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 14 – 16</span>
        </div>
        <div className="program-body">
          <h3>Cambridge IGCSE</h3>
          <p>Globally recognised Cambridge IGCSE qualifications preparing students for A-Level and IB Diploma pathways with rigorous assessment.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              30+ subjects
            </span>
          </div>
        </div>
      </div>
      <div className="program-card program-p5 fade-up fade-up-delay-1">
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 16 – 18</span>
        </div>
        <div className="program-body">
          <h3>IB Diploma Programme</h3>
          <p>The gold standard pre-university qualification. Extended Essay, Theory of Knowledge, CAS, and 6 subject groups taught by expert IB educators.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              97% pass rate
            </span>
          </div>
        </div>
      </div>
      <div className="program-card program-p6 fade-up fade-up-delay-2">
        <div className="program-header">
          <div className="program-header-bg"></div>
          <div className="program-header-pattern"></div>
          <span className="program-age-tag">Ages 16 – 18</span>
        </div>
        <div className="program-body">
          <h3>Cambridge A-Levels</h3>
          <p>Specialist A-Level study across Sciences, Humanities, Business, and Arts — widely accepted by universities across the world.</p>
          <div className="program-meta">
            <span className="program-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
              Cambridge Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="system-section" id="portal">
  <div className="system-bg-pattern"></div>
  <div className="container">
    <div className="system-header fade-up">
      <span className="label" style={{color:"var(--gold-light)"}}>School Management System</span>
      <h2 className="section-title" style={{color:"var(--white)"}}>Theohans <em style={{color:"var(--gold-light)"}}>EduPortal</em></h2>
      <p className="lead" style={{color:"rgba(255,255,255,0.55)"}}>Our integrated school management platform connects staff, students and parents — grades, attendance, fees, communications, all in one place.</p>
    </div>
    <div className="system-grid">
      <div className="system-card fade-up">
        <div className="system-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/></svg>
        </div>
        <h4>Real-Time Gradebook</h4>
        <p>Instant grade entry, automated GPA calculation, and report generation across all year groups.</p>
      </div>
      <div className="system-card fade-up fade-up-delay-1">
        <div className="system-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h4>Student Management</h4>
        <p>Complete student profiles, health records, emergency contacts and disciplinary tracking in one dashboard.</p>
      </div>
      <div className="system-card fade-up fade-up-delay-2">
        <div className="system-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h4>Parent Communication</h4>
        <p>Broadcast announcements, SMS alerts, meeting bookings and one-to-one messaging with families.</p>
      </div>
      <div className="system-card fade-up fade-up-delay-3">
        <div className="system-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
        <h4>Fee & Finance</h4>
        <p>Invoice generation, MoMo payment reconciliation, receipts and outstanding balance reports at a glance.</p>
      </div>
    </div>
    <div className="system-login-cta fade-up">
      <div className="system-login-left">
        <div className="system-login-eyebrow">Secure Portal Access</div>
        <div className="system-login-title">Sign in to Theohans EduPortal</div>
        <p className="system-login-sub">Authorised staff, teachers and administrators can access the full school management suite. Parents access a dedicated parent portal for fees, grades and communication.</p>
      </div>
      <div className="system-login-right">
        <a href="/admin/login" className="portal-btn">
          <div className="portal-btn-icon admin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="m15 19 2 2 4-4"/></svg>
          </div>
          <div className="portal-btn-text">
            <div className="portal-btn-name">Administrator Login</div>
            <div className="portal-btn-desc">Full system access</div>
          </div>
          <svg className="portal-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/teacher/login" className="portal-btn">
          <div className="portal-btn-icon teacher">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div className="portal-btn-text">
            <div className="portal-btn-name">Teacher / Staff Login</div>
            <div className="portal-btn-desc">Grades, attendance, classes</div>
          </div>
          <svg className="portal-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/parent/login" className="portal-btn">
          <div className="portal-btn-icon parent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="portal-btn-text">
            <div className="portal-btn-name">Parent Portal</div>
            <div className="portal-btn-desc">Track fees, grades & updates</div>
          </div>
          <svg className="portal-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>

<section className="academics-section" id="academics">
  <div className="container">
    <div className="academics-grid">
      <div className="academics-visual fade-up">
        <div className="curriculum-title">Curriculum Offerings</div>
        <div className="curriculum-sub">All programmes delivered by certified, specialist educators</div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#7f77dd"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">IB Primary Years Programme (PYP)</div>
            <div className="curriculum-item-desc">Ages 3–12 · Inquiry-based learning</div>
          </div>
          <span className="curriculum-item-badge badge-ib">IB</span>
        </div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#7f77dd"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">IB Middle Years Programme (MYP)</div>
            <div className="curriculum-item-desc">Ages 11–16 · 8 subject groups</div>
          </div>
          <span className="curriculum-item-badge badge-ib">IB</span>
        </div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#7f77dd"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">IB Diploma Programme (DP)</div>
            <div className="curriculum-item-desc">Ages 16–19 · University preparation</div>
          </div>
          <span className="curriculum-item-badge badge-ib">IB</span>
        </div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#378add"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">Cambridge IGCSE</div>
            <div className="curriculum-item-desc">Ages 14–16 · 30+ subjects available</div>
          </div>
          <span className="curriculum-item-badge badge-cambridge">Cambridge</span>
        </div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#378add"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">Cambridge A-Level</div>
            <div className="curriculum-item-desc">Ages 16–18 · Specialist study</div>
          </div>
          <span className="curriculum-item-badge badge-cambridge">Cambridge</span>
        </div>
        <div className="curriculum-item">
          <div className="curriculum-dot" style={{background:"#639922"}}></div>
          <div className="curriculum-item-text">
            <div className="curriculum-item-name">WASSCE (WAEC)</div>
            <div className="curriculum-item-desc">Senior High School · National qualification</div>
          </div>
          <span className="curriculum-item-badge badge-offered">Offered</span>
        </div>
        <div className="grade-scale">
          <div className="grade-scale-title">2024 Overall Pass Rate</div>
          <div className="grade-bar"></div>
          <div className="grade-labels"><span>Satisfactory</span><span>Good</span><span>Excellent · 98%</span></div>
        </div>
      </div>
      <div className="fade-up fade-up-delay-2">
        <span className="label">Curriculum & Academics</span>
        <h2 className="section-title" style={{marginBottom:"16px"}}>Rigorous. <em>Holistic.</em><br></br>Globally Recognised.</h2>
        <p className="lead" style={{marginBottom:"24px"}}>We believe that academic excellence must be matched with creativity, emotional intelligence and physical wellbeing — our curriculum delivers all three.</p>
        <p style={{fontSize:"15px",lineHeight:"1.75",color:"var(--text-mid)",marginBottom:"24px"}}>Our teachers are subject-matter experts drawn from Ghana, the UK, the US and across Africa, all trained in their respective IB or Cambridge pedagogy frameworks. Average teaching experience: 12 years.</p>
        <p style={{fontSize:"15px",lineHeight:"1.75",color:"var(--text-mid)",marginBottom:"40px"}}>Beyond the classroom, our co-curriculum spans 60+ clubs, sports teams, Model United Nations, robotics competitions, school orchestras, and community outreach programmes.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px"}}>
          <div style={{textAlign:"center",background:"var(--gray-50)",borderRadius:"var(--radius-md)",padding:"20px",border:"1px solid var(--gray-100)"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:"32px",fontWeight:"600",color:"var(--navy)"}}>60<span style={{fontSize:"16px",color:"var(--gold)"}}>+</span></div>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-faint)",marginTop:"4px"}}>Co-curricular Clubs</div>
          </div>
          <div style={{textAlign:"center",background:"var(--gray-50)",borderRadius:"var(--radius-md)",padding:"20px",border:"1px solid var(--gray-100)"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:"32px",fontWeight:"600",color:"var(--navy)"}}>12<span style={{fontSize:"16px",color:"var(--gold)"}}>yr</span></div>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-faint)",marginTop:"4px"}}>Avg. Teacher Exp.</div>
          </div>
          <div style={{textAlign:"center",background:"var(--gray-50)",borderRadius:"var(--radius-md)",padding:"20px",border:"1px solid var(--gray-100)"}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:"32px",fontWeight:"600",color:"var(--navy)"}}>8:1</div>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-faint)",marginTop:"4px"}}>Student–Teacher Ratio</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="enroll-section" id="enroll">
  <div className="container">
    <div className="enroll-grid">
      <div className="enroll-text">
        <span className="label">Admissions & Enrollment</span>
        <h2 className="section-title">Join the Theohans <em>Family</em></h2>
        <p className="lead">Enrolling your child at Theohans is straightforward. Our admissions team is here to guide you every step of the way — from inquiry through your child's first day.</p>
        <div className="enroll-steps">
          <div className="enroll-step">
            <div className="enroll-step-line"></div>
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>Submit an Enquiry</h4>
              <p>Complete the online enquiry form below or call our Admissions Office on <strong>+233 30 278 5500</strong>. A member of our team will respond within 24 hours.</p>
            </div>
          </div>
          <div className="enroll-step">
            <div className="enroll-step-line"></div>
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Campus Tour & Assessment</h4>
              <p>We invite families to a personalised campus tour. Students may complete a short assessment appropriate to the year group they are applying for.</p>
            </div>
          </div>
          <div className="enroll-step">
            <div className="enroll-step-line"></div>
            <div className="step-num">3</div>
            <div className="step-content">
              <h4>Receive Offer Letter</h4>
              <p>Successful applicants receive an official offer letter with details of the programme, fees, and required documents within 5 working days.</p>
            </div>
          </div>
          <div className="enroll-step">
            <div className="enroll-step-line"></div>
            <div className="step-num">4</div>
            <div className="step-content">
              <h4>Pay Acceptance Fee & Enrol</h4>
              <p>Confirm your place by paying the acceptance/registration fee via bank transfer or MTN Mobile Money. Submit required documents to complete enrolment.</p>
            </div>
          </div>
          <div className="enroll-step">
            <div className="step-num">5</div>
            <div className="step-content">
              <h4>Orientation & First Day</h4>
              <p>Attend our welcome orientation for new families. Your child joins their class with a dedicated buddy and full pastoral support from day one.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="enroll-panel fade-up fade-up-delay-2">
        
        <div className="payment-card">
          <div className="payment-card-header">
            <div className="payment-card-title">Pay School Fees</div>
            <div className="momo-badge">
              <div className="momo-badge-dot"></div>
              <span className="momo-badge-text">MoMo Active</span>
            </div>
          </div>
          <div className="momo-info">
            <div className="momo-number-row">
              <span className="momo-label">MTN MoMo Number</span>
              <span className="momo-network">MTN Ghana</span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
              <div className="momo-number" id="momo-num">0244 123 456</div>
              <button className="copy-btn" onClick={copyMomo}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
            <div className="momo-name">Theohans Academy Ltd.</div>
          </div>
          <div style={{marginBottom:"16px"}}>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--text-faint)",marginBottom:"10px"}}>2025/2026 Fee Schedule (GHS)</div>
            <table className="fee-table">
              <tr><td>Nursery / KG (per term)</td><td>GHS 4,500</td></tr>
              <tr><td>Primary Years 1–6 (per term)</td><td>GHS 6,200</td></tr>
              <tr><td>Lower Secondary / IGCSE</td><td>GHS 8,400</td></tr>
              <tr><td>IB Diploma / A-Level</td><td>GHS 11,000</td></tr>
              <tr><td>Registration / Acceptance Fee</td><td>GHS 800</td></tr>
              <tr><td style={{color:"var(--success)",fontWeight:"600"}}>Early-Bird Discount (before June 30)</td><td style={{color:"var(--success)",fontWeight:"600"}}>– GHS 500</td></tr>
            </table>
          </div>
          <div className="fee-note">* Fees are payable per term (3 terms/year). Sibling discounts of 10% apply from the second child. Scholarships available for exceptional applicants — enquire with admissions.</div>
        </div>
        <div className="deadlines-card">
          <div className="deadlines-card-title">Key Admissions Dates — 2025/2026</div>
          <div className="deadline-item"><span className="deadline-name">Applications Open</span><span className="deadline-date">1 April 2025</span></div>
          <div className="deadline-item"><span className="deadline-name">Early-Bird Deadline</span><span className="deadline-date">30 June 2025</span></div>
          <div className="deadline-item"><span className="deadline-name">Standard Deadline</span><span className="deadline-date">31 July 2025</span></div>
          <div className="deadline-item"><span className="deadline-name">Offer Letters Sent</span><span className="deadline-date">15 Aug 2025</span></div>
          <div className="deadline-item"><span className="deadline-name">Term 1 Begins</span><span className="deadline-date">8 Sept 2025</span></div>
        </div>
        <a href="#contact" className="btn btn-gold btn-lg" style={{width:"100%",justifyContent:"center",borderRadius:"var(--radius-md)"}}>
          Start Your Application
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>

<section className="facilities-section" id="facilities">
  <div className="container">
    <div className="facilities-header fade-up">
      <span className="label">Campus & Facilities</span>
      <h2 className="section-title">A World-Class <em>Campus</em></h2>
      <p className="lead">Our 42-acre East Legon campus is purpose-built for modern learning — inspiring spaces that energise students and educators alike.</p>
    </div>
    <div className="facilities-bento">
      <div className="facility-item facility-bg-1 fade-up" style={{gridColumn:"span 3",minHeight:"280px"}}>
        <div className="facility-pattern"></div>
        <div className="facility-content">
          <div className="facility-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div className="facility-name">Main Academic Building</div>
          <div className="facility-desc">60+ smart classrooms with interactive displays, fibre-optic internet and climate control across 6 floors</div>
        </div>
      </div>
      <div className="facility-item facility-bg-2 fade-up fade-up-delay-1" style={{gridColumn:"span 2"}}>
        <div className="facility-pattern"></div>
        <div className="facility-content">
          <div className="facility-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44L5.5 8.5A2.5 2.5 0 0 1 8 6h1.5M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.54-11.06A2.5 2.5 0 0 0 16 6h-1.5"/></svg>
          </div>
          <div className="facility-name">Library & Media Centre</div>
          <div className="facility-desc">40,000-volume collection, digital research lab and quiet study spaces</div>
        </div>
      </div>
      <div className="facility-item facility-bg-3 fade-up fade-up-delay-2" style={{gridColumn:"span 1"}}>
        <div className="facility-pattern"></div>
        <div className="facility-content">
          <div className="facility-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/></svg>
          </div>
          <div className="facility-name">Innovation Hub</div>
          <div className="facility-desc">Robotics, 3D printing, coding & design</div>
        </div>
      </div>
      <div className="facility-item facility-bg-4 fade-up" style={{gridColumn:"span 2"}}>
        <div className="facility-pattern"></div>
        <div className="facility-content">
          <div className="facility-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div className="facility-name">Science Laboratories</div>
          <div className="facility-desc">8 fully equipped labs for Physics, Chemistry, Biology and IB science courses</div>
        </div>
      </div>
      <div className="facility-item facility-bg-5 fade-up fade-up-delay-2" style={{gridColumn:"span 4"}}>
        <div className="facility-pattern"></div>
        <div className="facility-content" style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>
          <div>
            <div className="facility-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div className="facility-name">Sports & Athletics</div>
            <div className="facility-desc">Olympic pool, football pitches, basketball courts, athletics track & gym</div>
          </div>
          <div>
            <div className="facility-icon" style={{background:"rgba(255,255,255,0.1)"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div className="facility-name">Performing Arts Centre</div>
            <div className="facility-desc">600-seat auditorium, music studios and dance studio</div>
          </div>
          <div>
            <div className="facility-icon" style={{background:"rgba(255,255,255,0.1)"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="facility-name">Medical & Wellness Centre</div>
            <div className="facility-desc">On-campus clinic, school nurse and counsellors available daily</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="testimonials-section">
  <div className="container">
    <div className="testimonials-header fade-up">
      <span className="label">What Our Community Says</span>
      <h2 className="section-title">Voices of <em>Theohans</em></h2>
    </div>
    <div className="testimonials-grid">
      <div className="testimonial-card fade-up">
        <div className="testimonial-stars">
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <p className="testimonial-quote">"Theohans didn't just prepare my daughter academically — it shaped who she is. She arrived at UCL with confidence, curiosity, and a work ethic we are immensely proud of."</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar ta-1">AO</div>
          <div>
            <div className="testimonial-name">Adjoa Owusu-Mensah</div>
            <div className="testimonial-role">Parent · Class of 2022</div>
          </div>
        </div>
      </div>
      <div className="testimonial-card fade-up fade-up-delay-1">
        <div className="testimonial-stars">
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <p className="testimonial-quote">"The IB programme here is genuinely world-class. I've taught in London, Singapore and Nairobi — Theohans's students are among the most engaged and capable I've ever worked with."</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar ta-2">DK</div>
          <div>
            <div className="testimonial-name">Dr David Kimani</div>
            <div className="testimonial-role">IB Chemistry Teacher · 8 years</div>
          </div>
        </div>
      </div>
      <div className="testimonial-card fade-up fade-up-delay-2">
        <div className="testimonial-stars">
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <svg className="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <p className="testimonial-quote">"I transferred from a school in Lagos in Year 9 and was nervous. By Week 2, I felt completely at home. The teachers are exceptional and my friends here are from 11 different countries!"</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar ta-3">CB</div>
          <div>
            <div className="testimonial-name">Chidi Balogun</div>
            <div className="testimonial-role">Student · Year 11 · Nigeria</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="faculty-section" id="faculty">
  <div className="container">
    <div className="faculty-header fade-up">
      <div>
        <span className="label">Our Educators</span>
        <h2 className="section-title" style={{marginTop:"8px"}}>Meet the <em>Faculty</em></h2>
      </div>
      <a href="#" className="btn btn-ghost">View All Staff →</a>
    </div>
    <div className="faculty-grid">
      <div className="faculty-card fade-up">
        <div className="faculty-avatar fa-1">EP</div>
        <div className="faculty-name">Dr Ekua Prempeh</div>
        <div className="faculty-role">Head of School</div>
        <div className="faculty-qual"><span className="qual-tag">PhD Education</span><span className="qual-tag">IB</span></div>
      </div>
      <div className="faculty-card fade-up fade-up-delay-1">
        <div className="faculty-avatar fa-2">JO</div>
        <div className="faculty-name">Mr James Osei</div>
        <div className="faculty-role">Head of Secondary</div>
        <div className="faculty-qual"><span className="qual-tag">MEd</span><span className="qual-tag">Cambridge</span></div>
      </div>
      <div className="faculty-card fade-up fade-up-delay-2">
        <div className="faculty-avatar fa-3">SN</div>
        <div className="faculty-name">Ms Sarah Nkrumah</div>
        <div className="faculty-role">IB Coordinator</div>
        <div className="faculty-qual"><span className="qual-tag">IB DP</span><span className="qual-tag">BSc</span></div>
      </div>
      <div className="faculty-card fade-up fade-up-delay-3">
        <div className="faculty-avatar fa-4">KA</div>
        <div className="faculty-name">Mr Kwame Asante</div>
        <div className="faculty-role">Head of Primary</div>
        <div className="faculty-qual"><span className="qual-tag">IB PYP</span><span className="qual-tag">PGCE</span></div>
      </div>
    </div>
  </div>
</section>

<section className="news-section" id="news">
  <div className="container">
    <div className="news-header fade-up">
      <div>
        <span className="label">News & Events</span>
        <h2 className="section-title" style={{marginTop:"8px"}}>Life at <em>Theohans</em></h2>
      </div>
      <a href="#" className="btn btn-ghost">All News →</a>
    </div>
    <div className="news-grid">
      <div className="news-card fade-up">
        <div className="news-image news-image-1">
          <div className="news-image-pattern"></div>
          <span className="news-tag">Achievement</span>
        </div>
        <div className="news-body">
          <h3>Theohans Students Claim Top Honours at West Africa IB Results 2024</h3>
          <p>Our IB Diploma Class of 2024 achieved a record mean score of 36/45, with 4 students scoring 44 or above — placing us among the top schools in West Africa for the second consecutive year.</p>
          <div className="news-meta"><span>3 June 2024</span><span className="news-meta-dot"></span><span>5 min read</span></div>
        </div>
      </div>
      <div className="news-card fade-up fade-up-delay-1">
        <div className="news-image news-image-2">
          <div className="news-image-pattern"></div>
          <span className="news-tag">Campus</span>
        </div>
        <div className="news-body">
          <h3>New Innovation Hub Opens its Doors</h3>
          <p>Our GHS 2.4M STEM Innovation Hub — housing robotics labs, 3D printing suites and a green-tech workshop — officially opened in January 2025.</p>
          <div className="news-meta"><span>18 Jan 2025</span><span className="news-meta-dot"></span><span>3 min read</span></div>
        </div>
      </div>
      <div className="news-card fade-up fade-up-delay-2">
        <div className="news-image news-image-3">
          <div className="news-image-pattern"></div>
          <span className="news-tag">Sports</span>
        </div>
        <div className="news-body">
          <h3>Football Team Wins National Inter-School Championship</h3>
          <p>Theohans U-17 football team are national champions after a thrilling 3–1 final against Achimota School in Kumasi.</p>
          <div className="news-meta"><span>14 Mar 2025</span><span className="news-meta-dot"></span><span>2 min read</span></div>
        </div>
      </div>
    </div>
    <div className="events-card fade-up" style={{marginTop:"20px"}}>
      <div className="events-header-bar"><div className="events-title">Upcoming Events — Term 3, 2025</div></div>
      <div className="events-list" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
        <div className="event-item">
          <div className="event-date-block"><div className="event-date-day">12</div><div className="event-date-month">Jun</div></div>
          <div className="event-info"><h5>Sports Day 2025</h5><p>All year groups · Main Sports Field</p></div>
        </div>
        <div className="event-item">
          <div className="event-date-block"><div className="event-date-day">20</div><div className="event-date-month">Jun</div></div>
          <div className="event-info"><h5>Year 13 Graduation Ceremony</h5><p>Auditorium · 5:00 PM · Formal dress</p></div>
        </div>
        <div className="event-item">
          <div className="event-date-block"><div className="event-date-day">30</div><div className="event-date-month">Jun</div></div>
          <div className="event-info"><h5>Admissions Deadline — Early Bird</h5><p>2025/2026 Intake · Early-bird closes</p></div>
        </div>
        <div className="event-item">
          <div className="event-date-block"><div className="event-date-day">8</div><div className="event-date-month">Sept</div></div>
          <div className="event-info"><h5>First Day of Term 1 — 2025/26</h5><p>New Academic Year · All students</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="contact-section" id="contact">
  <div className="container">
    <div className="contact-grid">
      <div className="contact-text fade-up">
        <span className="label">Get in Touch</span>
        <h2 className="section-title">We Would Love to <em>Hear</em> from You</h2>
        <p className="lead">Whether you are enquiring about admissions, fees, or visiting the campus — our team is ready to help.</p>
        <div className="contact-info-list">
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div className="contact-info-label">Campus Address</div>
              <div className="contact-info-value">14 Aviation Road, East Legon<br></br>Accra, Greater Accra, Ghana</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div className="contact-info-label">Phone</div>
              <div className="contact-info-value">+233 30 278 5500</div>
              <div className="contact-info-sub">Admissions: +233 24 900 1234 · WhatsApp available</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <div className="contact-info-label">Email</div>
              <div className="contact-info-value">admissions@morousman045@gmail.com</div>
              <div className="contact-info-sub">General: info@morousman045@gmail.com</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div className="contact-info-label">Office Hours</div>
              <div className="contact-info-value">Mon – Fri · 7:30 AM – 4:30 PM</div>
              <div className="contact-info-sub">Saturday · 9:00 AM – 12:00 PM (Admissions only)</div>
            </div>
          </div>
        </div>
      </div>
      <div className="contact-form-card fade-up fade-up-delay-2">
        <div className="contact-form-title">Enquire or Apply</div>
        <div className="contact-form-sub">Fill in your details and our admissions team will be in touch within 24 hours.</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Parent / Guardian Name</label>
            <input className="form-input" type="text" placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" placeholder="+233 …" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="your@email.com" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Child's Name</label>
            <input className="form-input" type="text" placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Year Group Applying For</label>
            <select className="form-select form-input">
              <option value="" disabled selected>Select year group</option>
              <option>Nursery / KG</option>
              <option>Primary Year 1</option>
              <option>Primary Year 2</option>
              <option>Primary Year 3</option>
              <option>Primary Year 4</option>
              <option>Primary Year 5</option>
              <option>Primary Year 6</option>
              <option>Year 7 (Lower Secondary)</option>
              <option>Year 8</option>
              <option>Year 9</option>
              <option>Year 10 (IGCSE)</option>
              <option>Year 11 (IGCSE)</option>
              <option>Year 12 (IB DP / A-Level)</option>
              <option>Year 13 (IB DP / A-Level)</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Message (optional)</label>
          <textarea className="form-textarea form-input" placeholder="Any questions or specific requirements…"></textarea>
        </div>
        <button className="form-submit" onClick={handleSubmit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          Submit Enquiry
        </button>
      </div>
    </div>
  </div>
</section>

<footer>
  <div className="container">
    <div className="footer-grid">
      <div className="footer-brand">
        <div className="footer-brand-logo">
          <div className="footer-brand-mark">P</div>
          <div>
            <div className="footer-brand-name">Theohans Academy</div>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:"2px"}}>Est. 2009 · Accra, Ghana</div>
          </div>
        </div>
        <p className="footer-brand-tagline">Cultivating world-class scholars, compassionate leaders and innovative thinkers. Excellence is our standard; your child's future is our mission.</p>
        <div className="footer-accreds">
          <span className="footer-accred">IB World School</span>
          <span className="footer-accred">Cambridge Centre</span>
          <span className="footer-accred">GES Licensed</span>
          <span className="footer-accred">ISO 9001</span>
        </div>
      </div>
      <div>
        <div className="footer-col-title">Programmes</div>
        <ul className="footer-links">
          <li><a href="#">Early Years (EYFS)</a></li>
          <li><a href="#">Primary IB PYP</a></li>
          <li><a href="#">Secondary IB MYP</a></li>
          <li><a href="#">Cambridge IGCSE</a></li>
          <li><a href="#">IB Diploma</a></li>
          <li><a href="#">Cambridge A-Level</a></li>
          <li><a href="#">WASSCE</a></li>
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Admissions</div>
        <ul className="footer-links">
          <li><a href="#">How to Apply</a></li>
          <li><a href="#">Fee Schedule</a></li>
          <li><a href="#">Scholarships</a></li>
          <li><a href="#">Virtual Tour</a></li>
          <li><a href="#">Open Days</a></li>
          <li><a href="#">FAQs</a></li>
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Quick Links</div>
        <ul className="footer-links">
          <li><a href="/admin/login">Administrator Login</a></li>
          <li><a href="/teacher/login">Teacher Portal</a></li>
          <li><a href="/parent/login">Parent Portal</a></li>
          <li><a href="#">Academic Calendar</a></li>
          <li><a href="#">Library Catalogue</a></li>
          <li><a href="#">Staff Vacancies</a></li>
          <li><a href="#">Safeguarding Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="footer-copy">© 2025 Theohans Academy. All rights reserved. · Accra, Ghana · VAT Reg: GH-VAT-123456 · GES Licence: GES/ACC/2009/0041</div>
      <div className="footer-socials">
        <a href="#" className="social-btn" title="Facebook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="#" className="social-btn" title="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="#" className="social-btn" title="X / Twitter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l16 16M20 4 4 20"/></svg>
        </a>
        <a href="#" className="social-btn" title="LinkedIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="#" className="social-btn" title="YouTube">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>

<div className="toast" id="toast">
  <div className="toast-icon">
    <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  </div>
  <span id="toast-msg">Copied!</span>
</div>


    </>
  );
}