"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from 'next/image';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [counters, setCounters] = useState({ students: 0, staff: 0, years: 0, levels: 0 });
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const targets = { students: 150, staff: 13, years: new Date().getFullYear() - 2016, levels: 8 };
          const duration = 1800;
          const steps = 60;
          let step = 0;
          const interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3);
            setCounters({
              students: Math.round(targets.students * ease),
              staff: Math.round(targets.staff * ease),
              years: Math.round(targets.years * ease),
              levels: Math.round(targets.levels * ease),
            });
            if (step >= steps) clearInterval(interval);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const programs = [
    { level: "Early Years", classes: "Crèche & Nursery", icon: "🌱", desc: "Nurturing curious minds through play-based learning in a warm, safe environment." },
    { level: "Kindergarten", classes: "KG 1 – KG 2", icon: "🎨", desc: "Building foundational skills in literacy, numeracy and creativity." },
    { level: "Primary", classes: "Class 1 – Class 6", icon: "📚", desc: "A rigorous GES curriculum developing well-rounded, confident learners." },
    { level: "Junior High", classes: "Form 1 – Form 3", icon: "🎓", desc: "Preparing students for the BECE with academic excellence and character." },
  ];

  const subjects = [
    "Mathematics", "Integrated Science", "Social Studies", "English Language",
    "Computing", "RME", "Career Technology", "OWOP",
    "Creative Arts", "French", "Fante", "History",
  ];

  return (
    <>
      <Head>
        <title>Theohans Academy — Vision and Excellence</title>
        <meta name="description" content="Theohans Academy, Kasoa — Crèche to Form 3. A private school committed to Vision and Excellence since 2016." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --violet-950: #1E0547;
          --violet-900: #2D0A6B;
          --violet-800: #4C1D95;
          --violet-700: #6D28D9;
          --violet-600: #7C3AED;
          --violet-400: #A78BFA;
          --violet-200: #DDD6FE;
          --violet-100: #EDE9FE;
          --violet-50:  #F5F3FF;
          --white: #FFFFFF;
          --ink: #1A0533;
          --muted: #6B6280;
          --border: #E8E4F0;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          background: var(--white);
          color: var(--ink);
          overflow-x: hidden;
        }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 70px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.35s, box-shadow 0.35s, border-bottom 0.35s;
        }
        .nav.scrolled {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 0.65rem; text-decoration: none;
        }
        .nav-logo-badge {
          width: 38px; height: 38px;
          background: var(--violet-800);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-weight: 700; font-size: 1.1rem;
          color: var(--white);
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .nav-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .nav-logo-name {
          font-family: var(--font-display);
          font-size: 1.05rem; font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .nav-logo-sub {
          font-size: 0.65rem; font-weight: 500;
          color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .nav-links {
          display: flex; align-items: center; gap: 2rem;
          list-style: none;
        }
        .nav-links a {
          font-size: 0.875rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--ink); }
        .btn-portal {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.55rem 1.25rem;
          background: var(--violet-800);
          color: var(--white);
          font-size: 0.85rem; font-weight: 600;
          border-radius: 8px; text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(76,29,149,0.25);
          white-space: nowrap;
        }
        .btn-portal:hover {
          background: var(--violet-700);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(76,29,149,0.35);
        }
        .btn-portal svg { width: 14px; height: 14px; flex-shrink: 0; }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 4px;
          background: none; border: none;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--ink); border-radius: 2px;
          transition: all 0.3s;
        }

        .hero {
          min-height: 100vh;
          padding: clamp(6rem, 12vh, 9rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 8vh, 6rem);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 55%; height: 100%;
          background: linear-gradient(160deg, var(--violet-50) 0%, var(--violet-100) 60%, var(--violet-200) 100%);
          clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%);
          z-index: 0;
        }

        .hero-content { position: relative; z-index: 1; }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--violet-700);
          margin-bottom: 1.25rem;
        }
        .hero-eyebrow::before {
          content: '';
          display: block; width: 28px; height: 2px;
          background: var(--violet-600);
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 700;
          line-height: 1.0;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 0.4rem;
        }
        .hero-title em {
          font-style: italic;
          color: var(--violet-700);
        }

        .hero-motto {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          font-style: italic;
          color: var(--muted);
          margin-bottom: 1.75rem;
        }

        .hero-desc {
          font-size: 1rem; line-height: 1.75;
          color: var(--muted);
          max-width: 460px;
          margin-bottom: 2.5rem;
        }

        .hero-cta {
          display: flex; flex-wrap: wrap; gap: 0.875rem; align-items: center;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          background: var(--violet-800);
          color: var(--white);
          font-size: 0.95rem; font-weight: 600;
          border-radius: 10px; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(76,29,149,0.3);
        }
        .btn-primary:hover {
          background: var(--violet-700);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(76,29,149,0.4);
        }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          background: transparent;
          color: var(--violet-800);
          font-size: 0.95rem; font-weight: 600;
          border: 2px solid var(--violet-200);
          border-radius: 10px; text-decoration: none;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: var(--violet-400);
          background: var(--violet-50);
        }

        /* Hero visual card */
        .hero-visual {
          position: relative; z-index: 1;
          display: flex; justify-content: center; align-items: center;
        }
        .hero-card {
          background: var(--white);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(76,29,149,0.12), 0 4px 16px rgba(76,29,149,0.08);
          max-width: 380px; width: 100%;
        }
        .hero-card-header {
          display: flex; align-items: center; gap: 1rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }
        .school-crest {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, var(--violet-800), var(--violet-600));
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 1.6rem; font-weight: 700;
          color: var(--white);
          flex-shrink: 0;
        }
        .hero-card-title {
          font-family: var(--font-display);
          font-size: 1.2rem; font-weight: 600;
          color: var(--ink);
        }
        .hero-card-sub {
          font-size: 0.8rem; color: var(--muted); margin-top: 2px;
        }
        .info-row {
          display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--border);
        }
        .info-row:last-child { border-bottom: none; }
        .info-icon {
          width: 32px; height: 32px;
          background: var(--violet-50);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; flex-shrink: 0;
        }
        .info-label { font-size: 0.7rem; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; }
        .info-value { font-size: 0.9rem; color: var(--ink); font-weight: 500; margin-top: 1px; }

        .stats-bar {
          background: var(--violet-800);
          padding: 3rem clamp(1.5rem, 5vw, 4rem);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1000px; margin: 0 auto;
          text-align: center;
        }
        .stat-item {}
        .stat-number {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .stat-suffix {
          font-size: 1.5rem; color: var(--violet-400);
        }
        .stat-label {
          font-size: 0.8rem; font-weight: 500;
          color: var(--violet-300, #C4B5FD);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-top: 0.5rem;
        }
        .stat-divider {
          width: 1px; background: rgba(255,255,255,0.15);
          align-self: stretch; margin: auto;
        }

        section { padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem); }

        .section-label {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--violet-700);
          margin-bottom: 0.75rem;
        }
        .section-label::before {
          content: ''; display: block;
          width: 24px; height: 2px;
          background: var(--violet-600);
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 1rem;
        }
        .section-desc {
          font-size: 1rem; line-height: 1.8;
          color: var(--muted);
          max-width: 560px;
        }

        .about { background: var(--white); }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .about-visual {
          position: relative;
        }
        .about-bg-block {
          position: absolute;
          top: -20px; right: -20px;
          width: 85%; height: 85%;
          background: var(--violet-50);
          border-radius: 20px;
          z-index: 0;
        }
        .about-photo-placeholder {
          position: relative; z-index: 1;
          width: 100%;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, var(--violet-100) 0%, var(--violet-200) 100%);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 5rem;
          box-shadow: 0 20px 50px rgba(76,29,149,0.15);
        }
        .about-tag {
          position: absolute; z-index: 2;
          bottom: -16px; left: 24px;
          background: var(--violet-800);
          color: var(--white);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(76,29,149,0.35);
        }
        .about-tag-year {
          font-family: var(--font-display);
          font-size: 1.8rem; font-weight: 700; line-height: 1;
        }
        .about-tag-text { font-size: 0.7rem; color: var(--violet-300, #C4B5FD); margin-top: 2px; }
        .about-content { }
        .about-features {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1rem; margin-top: 2.5rem;
        }
        .feature-pill {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: var(--violet-50);
          border: 1px solid var(--violet-100);
          border-radius: 10px;
          font-size: 0.85rem; font-weight: 500; color: var(--ink);
        }
        .feature-pill span { font-size: 1rem; }

        .programs { background: var(--violet-50); }
        .programs-header {
          max-width: 1200px; margin: 0 auto 3rem;
          display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem;
        }
        .programs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px; margin: 0 auto;
        }
        .program-card {
          background: var(--white);
          border-radius: 16px;
          padding: 1.75rem;
          border: 1px solid var(--border);
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          position: relative; overflow: hidden;
        }
        .program-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--violet-700), var(--violet-400));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
        }
        .program-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(76,29,149,0.12);
          border-color: var(--violet-200);
        }
        .program-card:hover::before { transform: scaleX(1); }
        .program-icon {
          font-size: 2rem; margin-bottom: 1rem;
          display: block;
        }
        .program-level {
          font-family: var(--font-display);
          font-size: 1.25rem; font-weight: 600;
          color: var(--ink); margin-bottom: 0.25rem;
        }
        .program-classes {
          font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--violet-600); margin-bottom: 0.875rem;
        }
        .program-desc {
          font-size: 0.875rem; line-height: 1.65;
          color: var(--muted);
        }

        .subjects { background: var(--white); }
        .subjects-inner { max-width: 1200px; margin: 0 auto; }
        .subjects-header { margin-bottom: 3rem; }
        .subjects-grid {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
        }
        .subject-tag {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 100px;
          font-size: 0.9rem; font-weight: 500;
          color: var(--ink);
          transition: all 0.2s;
          cursor: default;
        }
        .subject-tag:hover {
          border-color: var(--violet-400);
          background: var(--violet-50);
          color: var(--violet-800);
          transform: translateY(-1px);
        }
        .subject-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--violet-500, #8B5CF6);
          flex-shrink: 0;
        }
        .curriculum-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--violet-800);
          color: var(--white);
          border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          margin-top: 2rem;
        }

        .contact { background: var(--violet-50); }
        .contact-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: start;
        }
        .contact-info { }
        .contact-items { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2.5rem; }
        .contact-item {
          display: flex; align-items: flex-start; gap: 1rem;
        }
        .contact-icon-wrap {
          width: 44px; height: 44px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(76,29,149,0.06);
        }
        .contact-item-label {
          font-size: 0.7rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted); margin-bottom: 3px;
        }
        .contact-item-value {
          font-size: 0.95rem; font-weight: 500; color: var(--ink);
        }
        .contact-cta-card {
          background: var(--violet-800);
          border-radius: 20px;
          padding: 2.5rem;
          color: var(--white);
        }
        .contact-cta-title {
          font-family: var(--font-display);
          font-size: 1.9rem; font-weight: 700;
          line-height: 1.1; margin-bottom: 1rem;
        }
        .contact-cta-desc {
          font-size: 0.9rem; line-height: 1.7;
          color: rgba(255,255,255,0.7);
          margin-bottom: 2rem;
        }
        .btn-white {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          background: var(--white);
          color: var(--violet-800);
          font-size: 0.9rem; font-weight: 700;
          border-radius: 10px; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .social-links {
          display: flex; gap: 0.75rem; margin-top: 1.75rem;
        }
        .social-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.9rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--white);
          font-size: 0.8rem; font-weight: 500;
          border-radius: 8px; text-decoration: none;
          transition: all 0.2s;
        }
        .social-btn:hover { background: rgba(255,255,255,0.2); }

        footer {
          background: var(--violet-950);
          padding: 3rem clamp(1.5rem, 5vw, 4rem) 2rem;
        }
        .footer-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 2rem;
        }
        .footer-logo-name {
          font-family: var(--font-display);
          font-size: 1.2rem; font-weight: 600;
          color: var(--white);
        }
        .footer-logo-sub {
          font-size: 0.7rem; color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-top: 2px;
        }
        .footer-links {
          display: flex; gap: 2rem; list-style: none; flex-wrap: wrap;
        }
        .footer-links a {
          font-size: 0.85rem; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--white); }
        .footer-bottom {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .footer-copy {
          font-size: 0.8rem; color: rgba(255,255,255,0.35);
        }
        .footer-reg {
          font-size: 0.75rem; color: rgba(255,255,255,0.25);
          font-family: var(--font-body);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.34s; }
        .delay-4 { animation-delay: 0.46s; }
        .delay-5 { animation-delay: 0.58s; }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .hero { grid-template-columns: 1fr; }
          .hero::before { display: none; }
          .hero-visual { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-divider { display: none; }
          .about-grid { grid-template-columns: 1fr; }
          .about-visual { display: none; }
          .programs-grid { grid-template-columns: repeat(2, 1fr); }
          .contact-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .programs-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .about-features { grid-template-columns: 1fr; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
        }

        .mobile-menu {
          position: fixed; top: 70px; left: 0; right: 0; z-index: 99;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1.25rem 1.5rem;
          display: flex; flex-direction: column; gap: 1rem;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.3s, opacity 0.3s;
          pointer-events: none;
        }
        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .mobile-menu a {
          font-size: 1rem; font-weight: 500;
          color: var(--ink); text-decoration: none;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .mobile-menu a:last-child { border-bottom: none; }
      `}</style>

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <Image className="nav-logo-badge" src="/resources/logo.jpg" width={100} height={100} alt="theohans logo" />

          <div className="nav-logo-text">
            <span className="nav-logo-name">Theohans Academy</span>
            <span className="nav-logo-sub">Vision &amp; Excellence</span>
          </div>
        </a>

        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#programs">Programmes</a></li>
          <li><a href="#academics">Academics</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <a href="/auth/login" className="btn-portal">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="12" height="10" rx="2"/>
            <path d="M8 7v4M6 9l2-2 2 2"/>
          </svg>
          Student Portal
        </a>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#programs" onClick={() => setMenuOpen(false)}>Programmes</a>
        <a href="#academics" onClick={() => setMenuOpen(false)}>Academics</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <a href="/auth/login" style={{ color: "var(--violet-700)", fontWeight: 600 }}>→ Student Portal</a>
      </div>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-eyebrow fade-up delay-1">Est. 2016 · Kasoa, Ghana</div>
          <h1 className="hero-title fade-up delay-2">
            Theohans<br /><em>Academy</em>
          </h1>
          <p className="hero-motto fade-up delay-3">— Vision and Excellence —</p>
          <p className="hero-desc fade-up delay-4">
            A private school in Kasoa shaping the next generation of Ghanaian leaders.
            From Crèche through Form 3, we nurture every learner with care, purpose, and academic rigour.
          </p>
          <div className="hero-cta fade-up delay-5">
            <a href="#contact" className="btn-primary">
              Apply for Admission
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </a>
            <a href="#programs" className="btn-secondary">View Programmes</a>
          </div>
        </div>

        <div className="hero-visual fade-up delay-3">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="school-crest"><Image src="/resources/crest.jpg" width={100} height={100} alt="school crest"/></div>
              <div>
                <div className="hero-card-title">Theohans Academy</div>
                <div className="hero-card-sub">GES Accredited · Kasoa, Ghana</div>
              </div>
            </div>
            {[
              { icon: "📍", label: "Location", value: "Kasoa, Budumburam, Greater Accra" },
              { icon: "📞", label: "Phone", value: "0243 457 611" },
              { icon: "✉️", label: "Email", value: "theoacad@edu.gh" },
              { icon: "🏫", label: "Levels", value: "Crèche → Form 3 (8 Levels)" },
              { icon: "📅", label: "Academic Year", value: "September – July · 3 Terms" },
            ].map((item) => (
              <div className="info-row" key={item.label}>
                <div className="info-icon">{item.icon}</div>
                <div>
                  <div className="info-label">{item.label}</div>
                  <div className="info-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-bar" ref={statsRef}>
        <div className="stats-grid">
          {[
            { num: counters.students, suffix: "+", label: "Enrolled Students" },
            { num: counters.staff, suffix: "", label: "Teaching Staff" },
            { num: counters.years, suffix: " Yrs", label: "Years of Excellence" },
            { num: counters.levels, suffix: "", label: "Academic Levels" },
          ].map((s, i) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-number">
                {s.num}<span className="stat-suffix">{s.suffix}</span>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="about" id="about">
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-bg-block" />
            <div className="about-photo-placeholder"><Image src="/resources/flag.png" width={500} height={500} alt="school flag"/></div>
            <div className="about-tag">
              <div className="about-tag-year">2016</div>
              <div className="about-tag-text">Year Founded</div>
            </div>
          </div>
          <div className="about-content">
            <div className="section-label">Who We Are</div>
            <h2 className="section-title">A School Built on Vision and Purpose</h2>
            <p className="section-desc">
              Theohans Academy was founded in 2016 by Mr. Theophilus Inkum with a bold vision —
              to provide quality, affordable education to children in Kasoa and surrounding communities.
              Our motto, <em>Vision and Excellence</em>, is not just a phrase; it is the heartbeat of everything we do.
            </p>
            <p className="section-desc" style={{ marginTop: "1rem" }}>
              We follow the Ghana Education Service (GES) curriculum, taught entirely in English,
              creating an environment where curiosity is celebrated and every child can thrive.
            </p>
            <div className="about-features">
              {[
                { icon: "🎓", text: "GES Accredited" },
                { icon: "🌍", text: "English Instruction" },
                { icon: "👦", text: "Max 30 per Class" },
                { icon: "🏡", text: "Day School" },
                { icon: "📋", text: "3-Term Calendar" },
                { icon: "🏆", text: "Phoenix House System" },
              ].map((f) => (
                <div className="feature-pill" key={f.text}>
                  <span>{f.icon}</span> {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="programs" id="programs">
        <div className="programs-header">
          <div>
            <div className="section-label">Academic Programmes</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Crèche to Form 3
            </h2>
          </div>
          <p className="section-desc" style={{ maxWidth: 360 }}>
            Every stage of your child's education journey covered under one roof.
          </p>
        </div>
        <div className="programs-grid">
          {programs.map((p) => (
            <div className="program-card" key={p.level}>
              <span className="program-icon">{p.icon}</span>
              <div className="program-level">{p.level}</div>
              <div className="program-classes">{p.classes}</div>
              <p className="program-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="subjects" id="academics">
        <div className="subjects-inner">
          <div className="subjects-header">
            <div className="section-label">Curriculum</div>
            <h2 className="section-title">Subjects Offered</h2>
            <p className="section-desc">
              A broad GES-aligned curriculum designed to develop well-rounded, critical thinkers
              prepared for the BECE and beyond.
            </p>
          </div>
          <div className="subjects-grid">
            {subjects.map((s) => (
              <div className="subject-tag" key={s}>
                <span className="subject-dot" />
                {s}
              </div>
            ))}
          </div>
          <div className="curriculum-badge">
            ✓ &nbsp;Ghana Education Service (GES) Curriculum
          </div>
        </div>
      </section>
      <section className="contact" id="contact">
        <div className="contact-inner">
          <div className="contact-info">
            <div className="section-label">Get in Touch</div>
            <h2 className="section-title">Visit or Contact Us</h2>
            <p className="section-desc">
              We'd love to hear from you. Whether you're enquiring about admissions or just
              want to learn more about our school, our doors are always open.
            </p>
            <div className="contact-items">
              {[
                { icon: "📍", label: "Address", value: "Kasoa, Budumburam, Central Region, Ghana" },
                { icon: "📞", label: "Main Office", value: "0243 457 611" },
                { icon: "📞", label: "Admin / WhatsApp", value: "0547 928 553" },
                { icon: "🚨", label: "Emergency", value: "0594 403 175" },
                { icon: "✉️", label: "General Email", value: "theoacad@edu.gh" },
                { icon: "✉️", label: "Admissions Email", value: "morousman045@gmail.com" },
              ].map((c) => (
                <div className="contact-item" key={c.label}>
                  <div className="contact-icon-wrap">{c.icon}</div>
                  <div>
                    <div className="contact-item-label">{c.label}</div>
                    <div className="contact-item-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="contact-cta-card">
              <h3 className="contact-cta-title">Ready to Enrol Your Child?</h3>
              <p className="contact-cta-desc">
                Admissions are open. Join a community of 150+ students building their future
                at Theohans Academy. Contact Mrs. Hannah Inkum, Head of Admissions, to begin.
              </p>
              <a href="mailto:morousman045@gmail.com" className="btn-white">
                Start Admission Process →
              </a>
              <div className="social-links">
                <a
                  href="https://www.facebook.com/Theohans-Academy"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                >
                  📘 Facebook
                </a>
                <a
                  href="https://www.youtube.com/@Theohansacademy"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                >
                  ▶ YouTube
                </a>
              </div>
            </div>
            <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "var(--white)", borderRadius: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>School Registration</p>
              <p style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>BN 268392016</p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>Registered with the Ghana Education Service</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div>
            <div className="nav-logo-badge" style={{ marginBottom: "0.6rem" }}>THA</div>
            <div className="footer-logo-name">Theohans Academy</div>
            <div className="footer-logo-sub">Vision &amp; Excellence · Est. 2016</div>
          </div>
          <ul className="footer-links">
            <li><a href="#about">About</a></li>
            <li><a href="#programs">Programmes</a></li>
            <li><a href="#academics">Academics</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="/auth/login" style={{ color: "var(--violet-400)" }}>Student Portal</a></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Theohans Academy. All rights reserved.</p>
          <p className="footer-reg">Kasoa, Budumburam · GES Reg. BN 268392016</p>
        </div>
      </footer>
    </>
  );
}