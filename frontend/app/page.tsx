"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);

  const features = [
    {
      icon: "◈",
      label: "Student Lifecycle",
      title: "End-to-end student management",
      desc: "Admissions, enrollment, academic records, progression tracking — unified under one elegant system built for clarity.",
      stat: "98%",
      statLabel: "Enrollment accuracy",
    },
    {
      icon: "◉",
      label: "Faculty & Staff",
      title: "Smart staff coordination",
      desc: "Timetable management, payroll integration, performance reviews, and communication tools that remove administrative friction.",
      stat: "4×",
      statLabel: "Faster scheduling",
    },
    {
      icon: "◐",
      label: "Finance & Billing",
      title: "Transparent financial control",
      desc: "Fee invoicing, payment tracking, scholarships, and audit-ready reports — every naira accounted for, always.",
      stat: "100%",
      statLabel: "Audit compliance",
    },
    {
      icon: "◑",
      label: "Analytics & Reports",
      title: "Insight that drives decisions",
      desc: "Live dashboards, attendance trends, grade distributions, and board-ready reports generated in seconds.",
      stat: "60s",
      statLabel: "Board report generation",
    },
  ];

  const steps = [
    { n: "01", title: "Create your institution", body: "Register your school in under 3 minutes. Add your name, crest, and academic calendar. No technical knowledge required." },
    { n: "02", title: "Invite your team", body: "Send role-based invites to administrators, teachers, and finance staff. Permissions are pre-configured and ready to go." },
    { n: "03", title: "Import your data", body: "Upload existing student and staff records via CSV or our guided import wizard. We map the columns for you." },
    { n: "04", title: "Go live", body: "Your school is fully operational. Parents, students, and staff access their personalised portals from day one." },
  ];

  const testimonials = [
    { name: "Dr. Amara Osei", role: "Principal, Ridge International School", quote: "Scholaris replaced five different tools overnight. The clarity it brought to our operations was immediate." },
    { name: "Mrs. Fatima Al-Hassan", role: "Director, Crescent Academy Group", quote: "Our fee collection rate went from 71% to 96% in one term. The automated reminders alone paid for the subscription." },
    { name: "Mr. Kwame Boateng", role: "IT Coordinator, Sunrise College", quote: "I expected a weeks-long setup. We were fully live in 48 hours. The migration team was exceptional." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0f0f0f;
          --ink-2: #3a3a3a;
          --ink-3: #717171;
          --gold: #b8860b;
          --gold-light: #d4a017;
          --gold-bg: #fdf8ee;
          --rule: #e8e4dc;
          --white: #ffffff;
          --off: #fafaf8;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'Outfit', system-ui, sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--sans);
          background: var(--white);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .nav.scrolled {
          border-color: var(--rule);
          box-shadow: 0 2px 24px rgba(0,0,0,0.04);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: var(--ink);
        }
        .logo-mark {
          width: 32px; height: 32px;
          background: var(--ink);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .logo-mark::after {
          content: '';
          width: 14px; height: 14px;
          background: var(--gold);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          position: absolute;
        }
        .logo-name {
          font-family: var(--serif);
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .nav-links {
          display: flex; gap: 36px; align-items: center;
          list-style: none;
        }
        .nav-links a {
          font-size: 13.5px; font-weight: 400;
          color: var(--ink-2); text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--ink); }
        .nav-right { display: flex; gap: 12px; align-items: center; }
        .btn-ghost {
          padding: 8px 20px;
          border: 1px solid var(--rule);
          background: transparent;
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 13.5px;
          color: var(--ink-2);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .btn-ghost:hover { border-color: var(--ink-2); color: var(--ink); }
        .btn-primary {
          padding: 9px 22px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { background: #222; transform: translateY(-1px); }

        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 80px;
          position: relative; overflow: hidden;
          background: var(--white);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--rule) 1px, transparent 1px),
            linear-gradient(90deg, var(--rule) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.45;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 80%);
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border: 1px solid var(--gold);
          border-radius: 2px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          background: var(--gold-bg);
          margin-bottom: 32px;
          animation: fadeUp 0.7s ease both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero h1 {
          font-family: var(--serif);
          font-size: clamp(56px, 8vw, 96px);
          font-weight: 300;
          line-height: 1.0;
          text-align: center;
          letter-spacing: -0.01em;
          max-width: 900px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero h1 em {
          font-style: italic;
          color: var(--gold);
        }
        .hero-sub {
          font-size: 17px;
          font-weight: 300;
          color: var(--ink-2);
          line-height: 1.65;
          text-align: center;
          max-width: 520px;
          margin-top: 28px;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; gap: 14px; margin-top: 44px;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .btn-hero {
          padding: 14px 32px;
          background: var(--ink);
          color: var(--white);
          border: none; border-radius: 4px;
          font-family: var(--sans);
          font-size: 14.5px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .btn-hero:hover { background: #1a1a1a; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.14); }
        .btn-hero-outline {
          padding: 14px 32px;
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--rule);
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 14.5px; font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-hero-outline:hover { border-color: var(--ink); transform: translateY(-2px); }
        .hero-stats {
          display: flex; gap: 0; margin-top: 80px;
          border: 1px solid var(--rule);
          border-radius: 6px;
          overflow: hidden;
          animation: fadeUp 0.7s 0.4s ease both;
          background: var(--white);
        }
        .stat-item {
          padding: 22px 40px; text-align: center;
          border-right: 1px solid var(--rule);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num {
          font-family: var(--serif);
          font-size: 36px; font-weight: 600;
          color: var(--ink);
          display: block;
        }
        .stat-label {
          font-size: 12px; font-weight: 400;
          color: var(--ink-3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 2px; display: block;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .section-title {
          font-family: var(--serif);
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
        .section-title em { font-style: italic; }

        .divider {
          width: 100%;
          height: 1px;
          background: var(--rule);
        }

        .features-section {
          padding: 100px 48px;
          background: var(--off);
        }
        .features-inner {
          max-width: 1200px; margin: 0 auto;
        }
        .features-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; margin-top: 60px;
          border: 1px solid var(--rule);
          border-radius: 8px;
          overflow: hidden;
          background: var(--rule);
        }
        .feature-card {
          background: var(--white);
          padding: 44px 40px;
          cursor: pointer;
          transition: background 0.25s;
          position: relative;
        }
        .feature-card.active { background: var(--ink); }
        .feature-icon {
          font-size: 24px; color: var(--gold);
          margin-bottom: 20px; display: block;
          transition: color 0.25s;
        }
        .feature-card.active .feature-icon { color: var(--gold-light); }
        .feature-chip {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 10px; display: block;
          transition: color 0.25s;
        }
        .feature-card.active .feature-chip { color: rgba(255,255,255,0.5); }
        .feature-title {
          font-family: var(--serif);
          font-size: 26px; font-weight: 400;
          line-height: 1.2;
          margin-bottom: 14px;
          transition: color 0.25s;
        }
        .feature-card.active .feature-title { color: var(--white); }
        .feature-desc {
          font-size: 14.5px; line-height: 1.65;
          color: var(--ink-2);
          transition: color 0.25s;
        }
        .feature-card.active .feature-desc { color: rgba(255,255,255,0.7); }
        .feature-stat {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--rule);
          display: flex; align-items: baseline; gap: 8px;
          transition: border-color 0.25s;
        }
        .feature-card.active .feature-stat { border-color: rgba(255,255,255,0.12); }
        .feat-num {
          font-family: var(--serif);
          font-size: 40px; font-weight: 600;
          color: var(--gold);
          transition: color 0.25s;
        }
        .feature-card.active .feat-num { color: var(--gold-light); }
        .feat-label {
          font-size: 13px; color: var(--ink-3);
          transition: color 0.25s;
        }
        .feature-card.active .feat-label { color: rgba(255,255,255,0.5); }

        .onboarding-section { padding: 100px 48px; background: var(--white); }
        .onboarding-inner { max-width: 1200px; margin: 0 auto; }
        .steps-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 60px;
          border: 1px solid var(--rule);
          border-radius: 8px;
          overflow: hidden;
        }
        .step-card {
          padding: 44px 32px;
          border-right: 1px solid var(--rule);
          position: relative;
        }
        .step-card:last-child { border-right: none; }
        .step-num {
          font-family: var(--serif);
          font-size: 48px; font-weight: 300;
          color: var(--rule);
          line-height: 1;
          margin-bottom: 24px;
          display: block;
        }
        .step-title {
          font-size: 15px; font-weight: 600;
          margin-bottom: 12px; color: var(--ink);
          letter-spacing: -0.01em;
        }
        .step-body {
          font-size: 13.5px; line-height: 1.65;
          color: var(--ink-3); font-weight: 300;
        }
        .step-connector {
          position: absolute; right: -1px; top: 50%;
          transform: translateY(-50%);
          width: 28px; height: 28px;
          background: var(--gold);
          clip-path: polygon(0 50%, 50% 0, 100% 50%, 50% 100%);
          z-index: 2;
        }
        .step-card:last-child .step-connector { display: none; }

        .testimonials-section {
          padding: 100px 48px;
          background: var(--gold-bg);
        }
        .testimonials-inner { max-width: 1200px; margin: 0 auto; }
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 24px; margin-top: 60px;
        }
        .testimonial-card {
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 6px;
          padding: 36px 32px;
        }
        .quote-mark {
          font-family: var(--serif);
          font-size: 64px; line-height: 0.6;
          color: var(--gold);
          margin-bottom: 20px;
          display: block;
          opacity: 0.6;
        }
        .quote-text {
          font-family: var(--serif);
          font-size: 18px; font-weight: 300;
          font-style: italic;
          line-height: 1.6;
          color: var(--ink);
          margin-bottom: 28px;
        }
        .quote-name {
          font-size: 14px; font-weight: 600;
          color: var(--ink);
        }
        .quote-role {
          font-size: 12.5px; color: var(--ink-3);
          margin-top: 3px; font-weight: 300;
        }

        .pricing-section {
          padding: 100px 48px;
          background: var(--white);
        }
        .pricing-inner { max-width: 1200px; margin: 0 auto; }
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 2px; margin-top: 60px;
          border: 1px solid var(--rule);
          border-radius: 8px;
          overflow: hidden;
          background: var(--rule);
        }
        .price-card {
          background: var(--white);
          padding: 48px 36px;
          position: relative;
        }
        .price-card.featured { background: var(--ink); }
        .price-badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--gold);
          color: var(--white);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        .price-tier {
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 8px;
          display: block;
        }
        .price-card.featured .price-tier { color: rgba(255,255,255,0.45); }
        .price-amount {
          font-family: var(--serif);
          font-size: 48px; font-weight: 600;
          color: var(--ink); line-height: 1;
          display: flex; align-items: flex-start; gap: 4px;
        }
        .price-card.featured .price-amount { color: var(--white); }
        .price-currency {
          font-size: 20px; margin-top: 10px;
          font-weight: 300;
        }
        .price-period {
          font-size: 14px; color: var(--ink-3);
          margin-top: 6px; margin-bottom: 28px;
          font-weight: 300;
        }
        .price-card.featured .price-period { color: rgba(255,255,255,0.45); }
        .price-divider { height: 1px; background: var(--rule); margin-bottom: 28px; }
        .price-card.featured .price-divider { background: rgba(255,255,255,0.1); }
        .price-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .price-feature {
          font-size: 13.5px; color: var(--ink-2);
          display: flex; align-items: flex-start; gap: 10px;
          font-weight: 300;
        }
        .price-card.featured .price-feature { color: rgba(255,255,255,0.7); }
        .price-check { color: var(--gold); font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .btn-plan {
          display: block; width: 100%;
          margin-top: 36px;
          padding: 13px;
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          letter-spacing: 0.01em;
        }
        .btn-plan-outline {
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--rule);
        }
        .btn-plan-outline:hover { border-color: var(--ink); }
        .btn-plan-white {
          background: var(--white);
          color: var(--ink);
          border: none;
        }
        .btn-plan-white:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,255,255,0.3); }

        .cta-section {
          padding: 120px 48px;
          background: var(--ink);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(184,134,11,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,134,11,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .cta-content { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
        .cta-title {
          font-family: var(--serif);
          font-size: clamp(40px, 6vw, 64px);
          font-weight: 300;
          color: var(--white);
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .cta-title em { font-style: italic; color: var(--gold-light); }
        .cta-sub {
          font-size: 16px; color: rgba(255,255,255,0.55);
          font-weight: 300; line-height: 1.65;
          margin-bottom: 44px;
        }
        .cta-actions { display: flex; gap: 14px; justify-content: center; }
        .btn-cta-gold {
          padding: 14px 36px;
          background: var(--gold);
          color: var(--white);
          border: none; border-radius: 4px;
          font-family: var(--sans);
          font-size: 14.5px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cta-gold:hover { background: var(--gold-light); transform: translateY(-2px); }
        .btn-cta-outline {
          padding: 14px 36px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 14.5px; font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cta-outline:hover { border-color: rgba(255,255,255,0.4); color: var(--white); }

        footer {
          background: var(--off);
          border-top: 1px solid var(--rule);
          padding: 56px 48px 36px;
        }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px; margin-bottom: 48px;
        }
        .footer-brand p {
          font-size: 13.5px; color: var(--ink-3);
          line-height: 1.65; font-weight: 300;
          max-width: 280px; margin-top: 16px;
        }
        .footer-col h4 {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink); margin-bottom: 16px;
        }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul a {
          font-size: 13.5px; color: var(--ink-3);
          text-decoration: none; font-weight: 300;
          transition: color 0.2s;
        }
        .footer-col ul a:hover { color: var(--ink); }
        .footer-bottom {
          border-top: 1px solid var(--rule);
          padding-top: 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-copy { font-size: 12px; color: var(--ink-3); font-weight: 300; }
        .footer-legal { display: flex; gap: 24px; }
        .footer-legal a { font-size: 12px; color: var(--ink-3); text-decoration: none; transition: color 0.2s; }
        .footer-legal a:hover { color: var(--ink); }

        @media (max-width: 900px) {
          .nav { padding: 0 24px; }
          .nav-links { display: none; }
          .hero { padding: 100px 24px 60px; }
          .hero-stats { flex-wrap: wrap; }
          .stat-item { flex: 1; min-width: 140px; }
          .section, .features-section, .onboarding-section, .testimonials-section, .pricing-section { padding: 60px 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr 1fr; }
          .testimonials-grid, .pricing-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .cta-section { padding: 80px 24px; }
          .cta-actions { flex-direction: column; }
          footer { padding: 48px 24px 28px; }
        }
      `}</style>

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-logo" href="#">
          <div className="logo-mark" />
          <span className="logo-name">Scholaris</span>
        </a>
        <ul className="nav-links">
          {["Features", "Onboarding", "Pricing", "Resources"].map((l) => (
            <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="btn-ghost" onClick={() => router.push("/auth/login")}>Sign in</button>
          <button className="btn-primary" >Get started</button>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <div className="hero-grid" />
        <div className="hero-badge"><span className="hero-badge-dot" />Now serving 400+ institutions across Africa</div>
        <h1>The operating system<br />for <em>modern schools</em></h1>
        <p className="hero-sub">Scholaris unifies student records, staff management, finance, and communication into one elegant platform designed for educational institutions that demand excellence.</p>
        <div className="hero-actions">
          <button className="btn-hero" >Start free trial</button>
          <button className="btn-hero-outline" >Watch a demo →</button>
        </div>
        <div className="hero-stats">
          {[["400+","Institutions"],["120k+","Students managed"],["99.9%","Uptime SLA"],["48hrs","Avg. go-live time"]].map(([n,l]) => (
            <div className="stat-item" key={l}>
              <span className="stat-num">{n}</span>
              <span className="stat-label">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="features-section" id="features">
        <div className="features-inner">
          <p className="section-label">What Scholaris does</p>
          <h2 className="section-title">Every dimension of your<br /><em>institution, managed.</em></h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className={`feature-card${activeFeature === i ? " active" : ""}`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-chip">{f.label}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-stat">
                  <span className="feat-num">{f.stat}</span>
                  <span className="feat-label">{f.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="onboarding-section" id="onboarding">
        <div className="onboarding-inner">
          <p className="section-label">Getting started</p>
          <h2 className="section-title">Live in <em>four steps.</em><br />Seriously.</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <span className="step-num">{s.n}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-body">{s.body}</p>
                <div className="step-connector" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="testimonials-inner">
          <p className="section-label">Trusted by school leaders</p>
          <h2 className="section-title">What administrators<br /><em>say about Scholaris</em></h2>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <span className="quote-mark">"</span>
                <p className="quote-text">{t.quote}</p>
                <p className="quote-name">{t.name}</p>
                <p className="quote-role">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <p className="section-label">Transparent pricing</p>
          <h2 className="section-title">One price per school.<br /><em>No surprises.</em></h2>
          <div className="pricing-grid">
            {[
              {
                tier: "Starter", amount: "GH₵ 499", period: "per month · up to 500 students",
                features: ["Student & staff records","Timetable management","Basic fee tracking","Email support","2 admin accounts"],
                btn: "btn-plan-outline", btnText: "Get started free",
              },
              {
                tier: "Academy", amount: "GH₵ 1,299", period: "per month · up to 2,500 students",
                features: ["Everything in Starter","Advanced finance & invoicing","Parent & student portal","Analytics dashboard","Priority support · 10 admins"],
                btn: "btn-plan-white", btnText: "Start Academy trial",
                featured: true, badge: "Most popular",
              },
              {
                tier: "Enterprise", amount: "Custom", period: "billed annually · unlimited scale",
                features: ["Everything in Academy","Multi-campus management","Dedicated success manager","Custom integrations & API","SLA guarantee · Unlimited admins"],
                btn: "btn-plan-outline", btnText: "Contact sales →",
              },
            ].map((p, i) => (
              <div className={`price-card${p.featured ? " featured" : ""}`} key={i}>
                {p.badge && <span className="price-badge">{p.badge}</span>}
                <span className="price-tier">{p.tier}</span>
                <div className="price-amount">
                  <span>{p.amount}</span>
                </div>
                <p className="price-period">{p.period}</p>
                <div className="price-divider" />
                <ul className="price-features">
                  {p.features.map((f) => (
                    <li className="price-feature" key={f}>
                      <span className="price-check">✦</span>{f}
                    </li>
                  ))}
                </ul>
                <button className={`btn-plan ${p.btn}`}>{p.btnText}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-content">
          <h2 className="cta-title">Your school deserves<br /><em>better infrastructure.</em></h2>
          <p className="cta-sub">Join hundreds of institutions across Africa who have modernised their operations with Scholaris. Free 30-day trial. No credit card. No setup fees.</p>
          <div className="cta-actions">
            <button className="btn-cta-gold" >Create your school — it's free</button>
            <button className="btn-cta-outline" onClick={() => router.push("/auth/login")}>Sign into existing account</button>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="nav-logo" href="#">
                <div className="logo-mark" />
                <span className="logo-name">Scholaris</span>
              </a>
              <p>A complete school management platform built for institutions across Africa. Elegant, reliable, and trusted.</p>
            </div>
            {[
              { h: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { h: "Resources", links: ["Documentation", "API Reference", "Help Centre", "Migration Guide"] },
              { h: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            ].map((col) => (
              <div className="footer-col" key={col.h}>
                <h4>{col.h}</h4>
                <ul>{col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2025 Scholaris Technologies Ltd. All rights reserved.</span>
            <div className="footer-legal">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                <a key={l} href="#">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}