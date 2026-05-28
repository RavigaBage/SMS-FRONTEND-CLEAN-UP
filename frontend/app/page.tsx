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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ name: string; admNum: string } | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    surname: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    has_normal_health: true,
    health_condition_details: "",
    has_normal_hearing: true,
    hearing_condition_details: "",
    has_psychological_trauma: false,
    psychological_trauma_details: "",
    mother_status: "alive",
    father_status: "alive",
    parents_relationship_status: "living_together",
    fees_payer_name: "",
    fees_payer_phone: "",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      return formData.first_name.trim() !== "" && formData.surname.trim() !== "" && formData.date_of_birth !== "" && formData.gender !== "" && formData.religion !== "";
    }
    if (step === 2) {
      return formData.fees_payer_name.trim() !== "" && formData.fees_payer_phone.trim() !== "";
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert("Please fill all required fields before proceeding.");
    }
  };

  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const handleFormSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...formData,
      health_condition_details: formData.has_normal_health ? null : formData.health_condition_details,
      hearing_condition_details: formData.has_normal_hearing ? null : formData.hearing_condition_details,
      psychological_trauma_details: formData.has_psychological_trauma ? formData.psychological_trauma_details : null,
    };

    try {
      const response = await fetch("/api/admission/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();

        const structuralError = Object.keys(errData)
          .map((key) => `${key}: ${errData[key].join(", ")}`)
          .join(" | ");
        throw new Error(structuralError || "Submission failed. Please check your inputs.");
      }

      const data = await response.json();
      setSuccessData({
        name: `${data.first_name} ${data.surname}`,
        admNum: data.admission_number,
      });
      

      setFormData({
        first_name: "",
        middle_name: "",
        surname: "",
        date_of_birth: "",
        gender: "",
        religion: "",
        has_normal_health: true,
        health_condition_details: "",
        has_normal_hearing: true,
        hearing_condition_details: "",
        has_psychological_trauma: false,
        psychological_trauma_details: "",
        mother_status: "alive",
        father_status: "alive",
        parents_relationship_status: "living_together",
        fees_payer_name: "",
        fees_payer_phone: "",
      });
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeResetModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setSuccessData(null);
    setSubmitError(null);
  };

  const programs = [
    { id: "early-years", level: "Early Years", classes: "Crèche & Nursery", icon: "🌱", desc: "Nurturing curious minds through play-based learning in a warm, safe environment." },
    { id: "kindergarten", level: "Kindergarten", classes: "KG 1 – KG 2", icon: "🎨", desc: "Building foundational skills in literacy, numeracy and creativity." },
    { id: "primary", level: "Primary", classes: "Class 1 – Class 6", icon: "📚", desc: "A rigorous GES curriculum developing well-rounded, confident learners." },
    { id: "junior-high", level: "Junior High", classes: "Form 1 – Form 3", icon: "🎓", desc: "Preparing students for the BECE with academic excellence and character." },
  ];

  const subjects = [
    "Mathematics", "English Language", "Integrated Science", "Social Studies", 
    "Computing (ICT)", "RME", "Career Technology", "OWOP", 
    "Creative Arts", "French", "Fante / Asante Twi", "History"
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A0533] antialiased selection:bg-purple-200">
      
      {/* ==================== NAVIGATION ==================== */}
      <nav className={`fixed top-0 left-0 right-0 z-40 h-[70px] flex items-center justify-between px-6 md:px-12 lg:px-16 transition-all duration-300 ${
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

     <div className={`fixed top-[70px] left-0 right-0 z-30 bg-white border-b border-[#E8E4F0] px-6 py-5 flex flex-col gap-4 transition-all duration-300 pointer-events-none md:hidden ${
        menuOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0"
      }`}>
        <a href="#about" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#programs" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>Programmes</a>
        <a href="#academics" className="text-base font-medium text-[#1A0533] py-2 border-b border-[#E8E4F0] no-underline" onClick={() => setMenuOpen(false)}>Academics</a>
        <a href="#contact" className="text-base font-medium text-[#1A0533] py-2 no-underline" onClick={() => setMenuOpen(false)}>Contact</a>
        <Link href="/auth/login" className="text-base font-semibold text-[#6D28D9] pt-2 no-underline" onClick={() => setMenuOpen(false)}>→ Student Portal</Link>
      </div>


      <section className="relative min-h-screen pt-28 md:pt-36 pb-16 px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center overflow-hidden" id="home">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DDD6FE] hidden md:block z-0" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }} />
        
        <div className="relative z-10">
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#4C1D95] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(76,29,149,0.3)] hover:bg-[#6D28D9] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(76,29,149,0.4)] transition-all text-[0.95rem] border-none cursor-pointer"
            >
              Apply for Admission
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <a href="#programs" className="inline-flex items-center gap-2 px-7 py-3 bg-transparent text-[#4C1D95] font-semibold border-2 border-[#DDD6FE] rounded-xl hover:border-[#A78BFA] hover:bg-[#F5F3FF] transition-all text-[0.95rem] no-underline">
              View Programmes
            </a>
          </div>
        </div>


        <div className="hidden md:flex relative z-10 justify-center items-center">
          <div className="bg-white rounded-[20px] p-8 shadow-[0_20px_60px_rgba(76,29,149,0.12),0_4px_16px_rgba(76,29,149,0.08)] max-w-[380px] w-full">
            <div className="flex items-center gap-4 pb-5 border-b border-[#E8E4F0] mb-5">
              <div className="w-14 h-14 bg-[#4C1D95] rounded-xl flex items-center justify-center font-serif text-2xl font-bold text-white shrink-0 overflow-hidden">
                <Image src="/resources/crest.jpg" width={100} height={100} alt="school crest" className="object-cover w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <div className="font-serif text-lg font-semibold text-[#1A0533]">Theohans Academy</div>
                <div className="text-xs text-[#6B6280] mt-0.5">GES Accredited · Kasoa, Ghana</div>
              </div>
            </div>
            {[
              { icon: "📍", label: "Location", value: "Kasoa, Budumburam, Central Region" },
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


      <section className="bg-white py-16 md:py-24 px-6 md:px-12 lg:px-16" id="about">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="relative hidden md:block">
            <div className="absolute -top-5 -right-5 w-[85%] h-[85%] bg-[#F5F3FF] rounded-2xl z-0" />
            <div className="relative z-10 w-full aspect-[4/3] bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <Image src="/resources/flag.png" width={500} height={500} alt="school flag" className="object-cover w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
              Our motto, <em className="italic text-[#4C1D95]">Vision and Excellence</em>, is the heartbeat of everything we do.
            </p>
            <p className="text-base leading-relaxed text-[#6B6280] mb-8">
              We precisely follow the Ghana Education Service (GES) standard structures, creating an inclusive atmosphere where structural foundations and modern computational elements blend flawlessly.
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
              <div 
                key={prog.id} 
                className="group relative bg-white rounded-2xl p-7 border border-[#E8E4F0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(76,29,149,0.12)] hover:border-[#DDD6FE] overflow-hidden"
              >
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                <span className="text-3xl mb-4 block">{prog.icon}</span>
                <h3 className="font-serif text-xl font-semibold text-[#1A0533] mb-1">{prog.level}</h3>
                <div className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#6D28D9] mb-3">{prog.classes}</div>
                <p className="text-xs leading-relaxed text-[#6B6280]">{prog.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
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

      
      <section className="bg-[#F5F3FF] py-16 md:py-24 px-6 md:px-12 lg:px-16" id="contact">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6D28D9] mb-3 before:content-[''] before:block before:w-6 before:h-0.5 before:bg-[#7C3AED]">
              Get In Touch
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1A0533]">Connect With Us</h2>
            
            <div className="flex flex-col gap-5 mt-10">
              {[
                { icon: "📍", label: "Our Location", value: "Kasoa, Budumburam, Central Region, Ghana" },
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
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-4">Online Admissions are Ongoing</h3>
            <p className="text-sm leading-relaxed text-purple-200/80 mb-8">
              Give your child the foundation of Vision and Excellence. Fill out our simplified online submission workspace directly to register for enrollment setup.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#4C1D95] font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm border-none cursor-pointer"
            >
              Start Admission Form
            </button>
            
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

      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            
      
            <div className="bg-[#4C1D95] text-white p-6 shrink-0">
              <button 
                onClick={closeResetModal}
                className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-lg transition-colors"
              >
                ✕
              </button>
              <h3 className="font-serif text-2xl font-bold m-0">Application for Admission</h3>
              <p className="text-xs text-purple-200 mt-1 m-0 uppercase tracking-wider">Theohans Portal Framework Hub</p>
              
      
              {!successData && (
                <div className="flex items-center gap-2 mt-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        currentStep >= step ? "bg-white text-[#4C1D95]" : "bg-purple-800 text-purple-300"
                      }`}>
                        {step}
                      </div>
                      <span className={`text-xs font-medium hidden sm:inline ${currentStep === step ? "text-white" : "text-purple-300"}`}>
                        {step === 1 ? "Applicant Info" : step === 2 ? "Parent & Fees" : "Medical Status"}
                      </span>
                      {step < 3 && <div className={`flex-1 h-0.5 ${currentStep > step ? "bg-white" : "bg-purple-800"}`} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

      
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <p className="m-0 text-xs break-all">{submitError}</p>
                </div>
              )}

              {successData ? (
      
                <div className="text-center py-8 px-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">✓</div>
                  <h4 className="font-serif text-2xl font-bold text-slate-900 m-0">Application Submitted!</h4>
                  <p className="text-sm text-slate-600 max-w-sm mt-2 mb-6">
                    Admission framework record initialized successfully for <strong className="text-slate-900">{successData.name}</strong>.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full max-w-sm mb-8">
                    <span className="text-[0.7rem] uppercase tracking-widest font-bold text-slate-500 block">Your Admission Number</span>
                    <span className="text-2xl font-mono font-bold text-[#4C1D95] block mt-1 tracking-wider">{successData.admNum}</span>
                  </div>
                  <button 
                    onClick={closeResetModal}
                    className="px-6 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors border-none cursor-pointer"
                  >
                    Close Window Portal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                  
      
                  {currentStep === 1 && (
                    <div className="flex flex-col gap-5">
                      <div className="border-b border-slate-100 pb-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900 m-0">Applicant's Name (in full)</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">Surname <span className="text-red-500">*</span></label>
                          <input required type="text" name="surname" value={formData.surname} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" placeholder="e.g. Osei" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
                          <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" placeholder="e.g. Ama" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">Middle Name (if any)</label>
                          <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" placeholder="e.g. Akosua" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                          <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">Gender <span className="text-red-500">*</span></label>
                          <select required name="gender" value={formData.gender} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900">
                            <option value="">-- Select Gender --</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-700">Religion <span className="text-red-500">*</span></label>
                          <select required name="religion" value={formData.religion} onChange={handleInputChange} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900">
                            <option value="">-- Select Religion --</option>
                            <option value="christian">Christian</option>
                            <option value="muslim">Muslim</option>
                            <option value="traditional">Traditionalist</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

      
                  {currentStep === 2 && (
                    <div className="flex flex-col gap-5">
                      <div className="border-b border-slate-100 pb-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900 m-0">Parental Framework &amp; Fees Sponsorship</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-slate-700">Mother Status</label>
                          <div className="flex gap-3">
                            {["alive", "deceased", "unknown"].map((status) => (
                              <button key={status} type="button" onClick={() => handleRadioChange("mother_status", status)} className={`flex-1 py-2 text-xs font-medium capitalize rounded-xl border transition-all cursor-pointer ${formData.mother_status === status ? "bg-[#4C1D95] text-white border-[#4C1D95]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-slate-700">Father Status</label>
                          <div className="flex gap-3">
                            {["alive", "deceased", "unknown"].map((status) => (
                              <button key={status} type="button" onClick={() => handleRadioChange("father_status", status)} className={`flex-1 py-2 text-xs font-medium capitalize rounded-xl border transition-all cursor-pointer ${formData.father_status === status ? "bg-[#4C1D95] text-white border-[#4C1D95]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs font-semibold text-slate-700">Both parents are:</label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { value: "living_together", label: "Living Together" },
                            { value: "separated", label: "Separated" },
                            { value: "divorced", label: "Divorced" }
                          ].map((item) => (
                            <button key={item.value} type="button" onClick={() => handleRadioChange("parents_relationship_status", item.value)} className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${formData.parents_relationship_status === item.value ? "bg-[#4C1D95] text-white border-[#4C1D95]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 mt-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">Who pays applicant's school fees?</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-700">Sponsor Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="fees_payer_name" value={formData.fees_payer_name} onChange={handleInputChange} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" placeholder="e.g. Mrs. Osei" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-700">Sponsor Phone Number <span className="text-red-500">*</span></label>
                            <input required type="tel" name="fees_payer_phone" value={formData.fees_payer_phone} onChange={handleInputChange} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900" placeholder="e.g. 020xxxxxxx" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                       {currentStep === 3 && (
                    <div className="flex flex-col gap-5">
                      <div className="border-b border-slate-100 pb-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900 m-0">Applicant's Health &amp; Psychological Profile</h4>
                      </div>

      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label className="text-xs font-semibold text-slate-800">Applicant has normal, clear general health?</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleRadioChange("has_normal_health", true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_normal_health === true ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"}`}>Yes</button>
                            <button type="button" onClick={() => handleRadioChange("has_normal_health", false)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_normal_health === false ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200"}`}>No</button>
                          </div>
                        </div>
                        {!formData.has_normal_health && (
                          <textarea required name="health_condition_details" value={formData.health_condition_details} onChange={handleInputChange} className="p-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900 min-h-[60px]" placeholder="Please specify food allergies, eye metrics, or ongoing medical requirements..." />
                        )}
                      </div>

      
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label className="text-xs font-semibold text-slate-800">Applicant has normal structural hearing capacity?</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleRadioChange("has_normal_hearing", true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_normal_hearing === true ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"}`}>Yes</button>
                            <button type="button" onClick={() => handleRadioChange("has_normal_hearing", false)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_normal_hearing === false ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200"}`}>No</button>
                          </div>
                        </div>
                        {!formData.has_normal_hearing && (
                          <textarea required name="hearing_condition_details" value={formData.hearing_condition_details} onChange={handleInputChange} className="p-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900 min-h-[60px]" placeholder="Please specify hearing metric variations or requirements..." />
                        )}
                      </div>

      
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label className="text-xs font-semibold text-slate-800">Does applicant have any history of significant psychological trauma?</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleRadioChange("has_psychological_trauma", true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_psychological_trauma === true ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200"}`}>Yes</button>
                            <button type="button" onClick={() => handleRadioChange("has_psychological_trauma", false)} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formData.has_psychological_trauma === false ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"}`}>No</button>
                          </div>
                        </div>
                        {formData.has_psychological_trauma && (
                          <textarea required name="psychological_trauma_details" value={formData.psychological_trauma_details} onChange={handleInputChange} className="p-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-[#7C3AED] focus:outline-none transition-all text-slate-900 min-h-[60px]" placeholder="Please add precise details to optimize tracking care modules..." />
                        )}
                      </div>

                            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mt-2 text-xs leading-relaxed">
                        <strong>Notice:</strong> Parents/guardians are to note that fees paid are not refundable. Fees should be paid in full on the first day of school admission parameters.
                      </div>
                    </div>
                  )}

                        <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-4 shrink-0">
                    {currentStep > 1 ? (
                      <button type="button" onClick={handlePrevStep} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors border-none cursor-pointer">
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 3 ? (
                      <button type="button" onClick={handleNextStep} className="px-6 py-2.5 bg-[#4C1D95] text-white text-sm font-semibold rounded-xl hover:bg-[#6D28D9] transition-all border-none cursor-pointer shadow-md">
                        Continue
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className="px-7 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all border-none cursor-pointer shadow-md flex items-center gap-2">
                        {isSubmitting ? "Processing Submission..." : "Submit Admission Request"}
                      </button>
                    )}
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}