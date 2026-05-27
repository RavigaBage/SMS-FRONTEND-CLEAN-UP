"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [counters, setCounters] = useState({ students: 0, staff: 0, years: 0, levels: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
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
    { id: "early-years", level: "Early Years", classes: "Crèche & Nursery", icon: "🌱", desc: "Nurturing curious minds through play-based learning in a warm, safe environment." },
    { id: "kindergarten", level: "Kindergarten", classes: "KG 1 – KG 2", icon: "🎨", desc: "Building foundational skills in literacy, numeracy and creativity." },
    { id: "primary", level: "Primary", classes: "Class 1 – Class 6", icon: "📚", desc: "A rigorous GES curriculum developing well-rounded, confident learners." },
    { id: "junior-high", level: "Junior High", classes: "Form 1 – Form 3", icon: "🎓", desc: "Preparing students for the BECE with academic excellence and character." },
  ];

  const subjects = [
    "Mathematics", "Integrated Science", "Social Studies", "English Language",
    "Computing", "RME", "Career Technology", "OWOP",
    "Creative Arts", "French", "Fante", "History",
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A0533] antialiased selection:bg-purple-200">
      
      {/* ==================== NAVIGATION ==================== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[70px] flex items-center justify-between px-6 md:px-12 lg:px-16 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8E4F0]" : "bg-slate-100/50 backdrop-blur-sm"
      }`}>
        <Link href="#" className="flex items-center gap-3 no-underline">
          <Image className="w-10 h-10 bg-[#4C1D95] rounded-xl object-cover shrink-0" src="/resources/logo.jpg" width={100} height={100} alt="theohans logo" />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[1.05rem] font-semibold text-[#1A0533]">Theohans Academy</span>
            <span className="text-[0.65rem] font-medium text-[#6B6280] uppercase tracking-widest">Vision &amp; Excellence</span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          <li><a href="#about" className="text-sm font-medium text-[#6B6280] hover:text-[#1A0533] transition-colors no-underline">About</a></li>
          <li><a href="#programs" className="text-sm font-medium text-[#6B6280] hover:text-[#1A0533] transition-colors no-underline">Programmes</a></li>
          <li><a href="#academics" className="text-sm font-medium text-[#6B6280] hover:text-[#1A0533] transition-colors no-underline">Academics</a></li>
          <li><a href="#contact" className="text-sm font-medium text-[#6B6280] hover:text-[#1A0533] transition-colors no-underline">Contact</a></li>
        </ul>

        <Link href="/auth/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4C1D95] text-white text-sm font-semibold rounded-lg shadow-[0_2px_8px_rgba(76,29,149,0.25)] hover:bg-[#6D28D9] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(76,29,149,0.35)] transition-all whitespace-nowrap no-underline">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="12" height="10" rx="2"/>
            <path d="M8 7v4M6 9l2-2 2 2"/>
          </svg>
          Student Portal
        </Link>

        <button className="md:hidden flex flex-col gap-1.5 p-1 bg-none border-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={`block w-5 h-0.5 bg-[#1A0533] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1A0533] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#1A0533] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`fixed top-[70px] left-0 right-0 z-40 bg-white border-b border-[#E8E4F0] px-6 py-5 flex flex-col gap-4 transition-all duration-300 pointer-events-none md:hidden ${
        menuOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0"
      }`}>
        <a href="#about" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#programs" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>Programmes</a>
        <a href="#academics" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>Academics</a>
        <a href="#contact" className="text-base font-medium text-[#1A0533] py-2 no-underline" onClick={() => setMenuOpen(false)}>Contact</a>
        <Link href="/auth/login" className="text-base font-semibold text-[#6D28D9] pt-2 no-underline" onClick={() => setMenuOpen(false)}>→ Student Portal</Link>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen pt-28 md:pt-36 pb-16 px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center overflow-hidden" id="home">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DDD6FE] hidden md:block z-0" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }} />
        
        <div className="relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-5 before:content-[''] before:block before:w-7 before:h-0.5 before:bg-[#7C3AED]">
            Est. 2016 · Kasoa, Ghana
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-none tracking-tight text-[#1A0533] mb-2">
            Theohans<br /><em className="italic text-[#6D28D9]">Academy</em>
          </h1>
          <p className="font-serif text-lg md:text-2xl italic text-[#6B6280] mb-7">— Vision and Excellence —</p>
          <p className="text-base leading-relaxed text-[#6B6280] max-w-md mb-10">
            A private school in Kasoa shaping the next generation of Ghanaian leaders.
            From Crèche through Form 3, we nurture every learner with care, purpose, and academic rigour.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3 bg-[#4C1D95] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(76,29,149,0.3)] hover:bg-[#6D28D9] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(76,29,149,0.4)] transition-all text-[0.95rem] no-underline">
              Apply for Admission
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </a>
            <a href="#programs" className="inline-flex items-center gap-2 px-7 py-3 bg-transparent text-[#4C1D95] font-semibold border-2 border-[#DDD6FE] rounded-xl hover:border-[#A78BFA] hover:bg-[#F5F3FF] transition-all text-[0.95rem] no-underline">
              View Programmes
            </a>
          </div>
        </div>

        {/* Hero visual info card */}
        <div className="hidden md:flex relative z-10 justify-center items-center">
          <div className="bg-white rounded-[20px] p-8 shadow-[0_20px_60px_rgba(76,29,149,0.12),0_4px_16px_rgba(76,29,149,0.08)] max-w-[380px] w-full">
            <div className="flex items-center gap-4 pb-5 border-b border-[#E8E4F0] mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-xl flex items-center justify-center font-serif text-2xl font-bold text-white shrink-0 overflow-hidden">
                <Image src="/resources/crest.jpg" width={100} height={100} alt="school crest" className="object-cover w-full h-full"/>
              </div>
              <div>
                <div className="font-serif text-lg font-semibold text-[#1A0533]">Theohans Academy</div>
                <div className="text-xs text-[#6B6280] mt-0.5">GES Accredited · Kasoa, Ghana</div>
              </div>
            </div>
            {[
              { icon: "📍", label: "Location", value: "Kasoa, Budumburam, Greater Accra" },
              { icon: "📞", label: "Phone", value: "0243 457 611" },
              { icon: "✉️", label: "Email", value: "theoacad@edu.gh" },
              { icon: "🏫", label: "Levels", value: "Crèche → Form 3 (8 Levels)" },
              { icon: "📅", label: "Academic Year", value: "September – July · 3 Terms" },
            ].map((item) => (
              <div className="flex items-start gap-3 py-2.5 border-b border-[#E8E4F0] last:border-b-0" key={item.label}>
                <div className="w-8 h-8 bg-[#F5F3FF] rounded-lg flex items-center justify-center text-sm shrink-0">{item.icon}</div>
                <div>
                  <div className="text-[0.7rem] text-[#6B6280] font-medium uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm text-[#1A0533] font-medium mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <div className="bg-[#4C1D95] py-12 px-6 md:px-12 lg:px-16" ref={statsRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1000px] mx-auto text-center">
          {[
            { num: counters.students, suffix: "+", label: "Enrolled Students" },
            { num: counters.staff, suffix: "", label: "Teaching Staff" },
            { num: counters.years, suffix: " Yrs", label: "Years of Excellence" },
            { num: counters.levels, suffix: "", label: "Academic Levels" },
          ].map((s) => (
            <div className="flex flex-col" key={s.label}>
              <div className="font-serif text-4xl md:text-6xl font-bold text-white leading-none tracking-tight">
                {s.num}<span className="text-2xl text-[#A78BFA]">{s.suffix}</span>
              </div>
              <div className="text-[0.8rem] font-medium text-purple-200 uppercase tracking-wider mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== ABOUT SECTION ==================== */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-12 lg:px-16" id="about">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="relative hidden md:block">
            <div className="absolute -top-5 -right-5 w-[85%] h-[85%] bg-[#F5F3FF] rounded-2xl z-0" />
            <div className="relative z-10 w-full aspect-[4/3] bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <Image src="/resources/flag.png" width={500} height={500} alt="school flag" className="object-cover w-full h-full" />
            </div>
            <div className="absolute z-20 bottom-4 left-6 bg-[#4C1D95] text-white p-4 rounded-xl shadow-md">
              <div className="font-serif text-2xl font-bold line-none leading-none">2016</div>
              <div className="text-[0.7rem] text-purple-200 mt-1">Year Founded</div>
            </div>
          </div>
          
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-3 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-[#7C3AED]">
              Who We Are
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A0533] mb-4">A School Built on Vision and Purpose</h2>
            <p className="text-base leading-relaxed text-[#6B6280] mb-4">
              Theohans Academy was founded in 2016 by Mr. Theophilus Inkum with a bold vision —
              to provide quality, affordable education to children in Kasoa and surrounding communities.
              Our motto, <em className="italic text-[#4C1D95]">Vision and Excellence</em>, is not just a phrase; it is the heartbeat of everything we do.
            </p>
            <p className="text-base leading-relaxed text-[#6B6280] mb-8">
              We follow the Ghana Education Service (GES) curriculum, taught entirely in English,
              creating an environment where curiosity is celebrated and every child can thrive.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["🌱 Holistic Development", "🇬🇭 GES Standard Approved", "💻 Computing Oriented", "🏆 Focus on Excellence"].map((pill) => (
                <div key={pill} className="flex items-center gap-2.5 p-3.5 bg-[#F5F3FF] border border-[#EDE9FE] rounded-xl text-sm font-medium text-[#1A0533]">
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROGRAMMES SECTION ==================== */}
      <section className="bg-[#F5F3FF] py-16 md:py-24 px-6 md:px-12 lg:px-16" id="programs">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-3 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-[#7C3AED]">
              Educational Pathways
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A0533]">Our Academic Programmes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog) => (
              <Link 
                href={`/programmes/${prog.id}`} 
                key={prog.id} 
                className="group relative bg-white rounded-2xl p-7 border border-[#E8E4F0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(76,29,149,0.12)] hover:border-[#DDD6FE] overflow-hidden no-underline"
              >
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                <span className="text-3xl mb-4 block">{prog.icon}</span>
                <h3 className="font-serif text-xl font-semibold text-[#1A0533] mb-1">{prog.level}</h3>
                <div className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#6D28D9] mb-3">{prog.classes}</div>
                <p className="text-xs leading-relaxed text-[#6B6280]">{prog.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ACADEMICS / SUBJECTS SECTION ==================== */}
      <section className="bg-white py-16 md:py-24 px-6 md:px-12 lg:px-16" id="academics">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-3 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-[#7C3AED]">
              Curriculum Core
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A0533]">Subjects We Offer</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {subjects.map((sub) => (
              <div 
                key={sub} 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E4F0] rounded-full text-sm font-medium text-[#1A0533] hover:border-[#A78BFA] hover:bg-[#F5F3FF] hover:text-[#4C1D95] hover:-translate-y-0.5 transition-all cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                {sub}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-lg text-xs font-semibold mt-8">
            📚 Ghana Education Service (GES) Standard Structure
          </div>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section className="bg-[#F5F3FF] py-16 md:py-24 px-6 md:px-12 lg:px-16" id="contact">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-3 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-[#7C3AED]">
              Get In Touch
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A0533]">Connect With Us</h2>
            
            <div className="flex flex-col gap-5 mt-10">
              {[
                { icon: "📍", label: "Our Location", value: "Kasoa, Budumburam, Greater Accra, Ghana" },
                { icon: "📞", label: "Phone Line", value: "0243 457 611" },
                { icon: "✉️", label: "Email Address", value: "theoacad@edu.gh" },
              ].map((item) => (
                <div className="flex items-start gap-4" key={item.label}>
                  <div className="w-11 h-11 bg-white border border-[#E8E4F0] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm">{item.icon}</div>
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#6B6280] mb-0.5">{item.label}</div>
                    <div className="text-base font-medium text-[#1A0533]">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#4C1D95] rounded-2xl p-10 text-white shadow-xl">
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-4">Admissions are Ongoing</h3>
            <p className="text-sm leading-relaxed text-purple-200/80 mb-8">
              Give your child the foundation of Vision and Excellence. Reach out today to schedule a school tour or secure an application form package.
            </p>
            <a href="tel:0243457611" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#4C1D95] font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm no-underline">
              Apply for Admission
            </a>
            
            <div className="flex gap-3 mt-7">
              {["Facebook", "Instagram"].map((platform) => (
                <a key={platform} href="#" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/20 transition-colors no-underline">
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#1E0547] text-white py-12 px-6 md:px-12 lg:px-16">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="font-serif text-xl font-semibold">Theohans Academy</div>
            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Vision &amp; Excellence</div>
          </div>
          <ul className="flex flex-wrap gap-6 list-none m-0 p-0">
            <li><a href="#about" className="text-xs text-white/50 hover:text-white transition-colors no-underline">About Us</a></li>
            <li><a href="#programs" className="text-xs text-white/50 hover:text-white transition-colors no-underline">Programmes</a></li>
            <li><a href="#academics" className="text-xs text-white/50 hover:text-white transition-colors no-underline">Academics</a></li>
            <li><a href="#contact" className="text-xs text-white/50 hover:text-white transition-colors no-underline">Contact</a></li>
          </ul>
        </div>

        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} Theohans Academy. All Rights Reserved.
          </div>
          <div className="text-[0.75rem] text-white/25 font-sans">
            GES Certified Institution Framework
          </div>
        </div>
      </footer>

    </div>
  );
}