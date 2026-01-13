import '../../styles/global.css'
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Class & Timetable Management</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </Head>
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

    {/* <script id="tailwind-config">
            tailwind.config = {
                darkMode: "class",
                theme: {
                    extend: {
                        colors: {
                            "primary": "#13b6ec",
                            "background-light": "#f6f8f8",
                            "background-dark": "#101d22",
                            "surface-light": "#ffffff",
                            "surface-dark": "#18282e",
                        },
                        fontFamily: {
                            "display": ["Lexend", "sans-serif"]
                        },
                        borderRadius: {
                            "DEFAULT": "0.375rem", 
                            "lg": "0.5rem", 
                            "xl": "0.75rem", 
                            "2xl": "1rem",
                            "full": "9999px"
                        },
                    },
                },
            }
        </script> */}


    <div class="flex h-full w-full overflow-hidden">

      <aside class="w-20 lg:w-64 flex-shrink-0 flex flex-col bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-20">

      <div class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
      <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <span class="material-symbols-outlined text-[24px]">school</span>
      </div>
      <span class="ml-3 font-bold text-lg hidden lg:block tracking-tight text-slate-900 dark:text-white">EduManage</span>
      </div>

      <nav class="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors group" href="#">
      <span class="material-symbols-outlined text-[24px] group-hover:text-primary">dashboard</span>
      <span class="text-sm font-medium hidden lg:block">Dashboard</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors group" href="#">
      <span class="material-symbols-outlined text-[24px] group-hover:text-primary">groups</span>
      <span class="text-sm font-medium hidden lg:block">Students</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors group" href="#">
      <span class="material-symbols-outlined text-[24px] group-hover:text-primary">badge</span>
      <span class="text-sm font-medium hidden lg:block">Staff</span>
      </a>

      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary dark:text-primary font-medium" href="#">
      <span class="material-symbols-outlined text-[24px] fill-1">calendar_month</span>
      <span class="text-sm hidden lg:block">Timetable</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-colors group" href="#">
      <span class="material-symbols-outlined text-[24px] group-hover:text-primary">assignment</span>
      <span class="text-sm font-medium hidden lg:block">Exams</span>
      </a>
      </nav>

      <div class="p-3 border-t border-slate-100 dark:border-slate-800">
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" href="#">
      <span class="material-symbols-outlined text-[24px]">settings</span>
      <span class="text-sm font-medium hidden lg:block">Settings</span>
      </a>
      <div class="mt-4 flex items-center gap-3 px-3 hidden lg:flex">
      <div class="size-8 rounded-full bg-center bg-cover border border-slate-200 dark:border-slate-600" data-alt="User profile picture" ></div>
      <div class="flex flex-col overflow-hidden">
      <span class="text-sm font-medium text-slate-900 dark:text-white truncate">Alex Morgan</span>
      <span class="text-xs text-slate-500 dark:text-slate-400 truncate">Admin</span>
      </div>
      </div>
      </div>
      </aside>

      <main class="flex-1 flex flex-col min-w-0 h-full bg-background-light dark:bg-background-dark overflow-hidden">

      <header class="h-auto z-10 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
      <div class="flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 md:py-4 gap-4">
      <div class="flex flex-col gap-1">
      <h1 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Timetable Management</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">Class Schedule · Grade 10A · Term 1, 2024</p>
      </div>
      <div class="flex items-center gap-3">
      <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
      <span class="material-symbols-outlined text-[20px]">print</span>
      <span class="hidden sm:inline">Export</span>
      </button>
      <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-200 dark:shadow-none transition-all">
      <span class="material-symbols-outlined text-[20px]">save</span>
      <span>Save Changes</span>
      </button>
      </div>
      </div>

      <div class="px-4 md:px-6 pb-4 flex flex-wrap items-center gap-3 md:gap-6">

      <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Viewing</span>
      <select class="form-select bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary">
      <option>Grade 10A</option>
      <option>Grade 10B</option>
      <option>Grade 11A</option>
      </select>
      </div>
      <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-transparent whitespace-nowrap">
      <span class="material-symbols-outlined text-[16px]">check</span>
                                  All Subjects
                              </button>
      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium whitespace-nowrap transition-colors">
                                  Science Dept
                              </button>
      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium whitespace-nowrap transition-colors">
                                  Math Dept
                              </button>
      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium whitespace-nowrap transition-colors">
                                  Humanities
                              </button>
      </div>
      </div>
      </header>

      <div class="flex-1 flex overflow-hidden">

      <div class="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/50 dark:bg-background-dark scroll-smooth">
      <div class="min-w-[800px] h-full flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">

      <div class="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 sticky top-0 z-10 backdrop-blur-sm">
      <div class="p-3 text-center border-r border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
      </div>
      <div class="p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Monday</p>
      </div>
      <div class="p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 bg-primary/5">
      <p class="text-sm font-bold text-primary">Tuesday</p>
      <div class="h-1 w-1 bg-primary rounded-full mx-auto mt-1"></div>
      </div>
      <div class="p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Wednesday</p>
      </div>
      <div class="p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Thursday</p>
      </div>
      <div class="p-3 text-center">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Friday</p>
      </div>
      </div>

      <div class="flex-1 overflow-y-auto">

      <div class="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 dark:border-slate-800 min-h-[120px]">
      <div class="p-3 text-xs font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                          08:00
                                      </div>

      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative group/cell">
      <div class="h-full w-full bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all group/card">
      <div class="flex justify-between items-start">
      <span class="text-xs font-bold text-blue-800 dark:text-blue-200">Mathematics</span>
      <span class="material-symbols-outlined text-[14px] text-blue-400 opacity-0 group-hover/card:opacity-100">drag_indicator</span>
      </div>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Anderson
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-blue-500/80 dark:text-blue-400/80 font-medium bg-blue-100/50 dark:bg-blue-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Rm 101
                                              </div>
      </div>
      </div>

      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative bg-slate-50/30">
      <div class="h-full w-full bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all group/card">
      <div class="flex justify-between items-start">
      <span class="text-xs font-bold text-teal-800 dark:text-teal-200">Physics</span>
      <span class="material-symbols-outlined text-[14px] text-teal-400 opacity-0 group-hover/card:opacity-100">drag_indicator</span>
      </div>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Curie
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-teal-500/80 dark:text-teal-400/80 font-medium bg-teal-100/50 dark:bg-teal-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Lab 2
                                              </div>
      </div>
      </div>

      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded flex items-center justify-center text-slate-300 dark:text-slate-600 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
      <span class="material-symbols-outlined text-[20px]">add</span>
      </div>
      </div>

      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <div class="flex justify-between items-start">
      <span class="text-xs font-bold text-blue-800 dark:text-blue-200">Mathematics</span>
      </div>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Anderson
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-blue-500/80 dark:text-blue-400/80 font-medium bg-blue-100/50 dark:bg-blue-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Rm 101
                                              </div>
      </div>
      </div>

      <div class="p-2 relative">
      <div class="h-full w-full bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <div class="flex justify-between items-start">
      <span class="text-xs font-bold text-amber-800 dark:text-amber-200">History</span>
      </div>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Zinn
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-amber-500/80 dark:text-amber-400/80 font-medium bg-amber-100/50 dark:bg-amber-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Rm 104
                                              </div>
      </div>
      </div>
      </div>

      <div class="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 dark:border-slate-800 min-h-[120px]">
      <div class="p-3 text-xs font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                          09:00
                                      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-purple-800 dark:text-purple-200">English Lit</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Woolf
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative bg-slate-50/30">
      <div class="h-full w-full bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all group/card">
      <div class="flex justify-between items-start">
      <span class="text-xs font-bold text-rose-800 dark:text-rose-200">Chemistry</span>
      <div class="flex items-center justify-center size-5 bg-white dark:bg-slate-800 rounded-full shadow-sm opacity-0 group-hover/card:opacity-100">
      <span class="material-symbols-outlined text-[14px] text-slate-400">more_horiz</span>
      </div>
      </div>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. White
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-rose-500/80 dark:text-rose-400/80 font-medium bg-rose-100/50 dark:bg-rose-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Lab 1
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-emerald-800 dark:text-emerald-200">Biology</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Franklin
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-teal-800 dark:text-teal-200">Physics</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Curie
                                              </div>
      </div>
      </div>
      <div class="p-2 relative">
      <div class="h-full w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded flex items-center justify-center text-slate-300 dark:text-slate-600">
                                              Free Period
                                          </div>
      </div>
      </div>

      <div class="grid grid-cols-[80px_1fr] border-b border-slate-100 dark:border-slate-800 h-[40px]">
      <div class="p-2 text-xs font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                          10:00
                                      </div>
      <div class="bg-stripes flex items-center justify-center">
      <span class="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase bg-surface-light dark:bg-surface-dark px-3 py-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">Recess Break</span>
      </div>
      </div>

      <div class="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 dark:border-slate-800 min-h-[120px]">
      <div class="p-3 text-xs font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                          10:30
                                      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-amber-800 dark:text-amber-200">History</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Zinn
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative bg-slate-50/30">

      <div class="h-full w-full bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/50 rounded p-2.5 relative overflow-hidden group/conflict">
      <div class="absolute top-0 right-0 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-bl text-[9px] font-bold z-10">CONFLICT</div>
      <div class="absolute inset-0 bg-red-50 dark:bg-red-900/10 opacity-50 z-0"></div>
      <div class="relative z-10 opacity-60 grayscale group-hover/conflict:grayscale-0 group-hover/conflict:opacity-100 transition-all">
      <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Geography</span>
      <div class="text-[10px] text-slate-500">Mr. Polo</div>
      </div>
      <div class="relative z-10 mt-2 p-1 bg-red-50 dark:bg-red-900/30 rounded border border-red-100 dark:border-red-800">
      <span class="text-[10px] font-bold text-red-700 dark:text-red-300 block">Double Booked</span>
      <span class="text-[9px] text-red-600 dark:text-red-400">Mr. Polo has Class 9B</span>
      </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-pink-800 dark:text-pink-200">Art &amp; Design</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-pink-600 dark:text-pink-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Kahlo
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-pink-500/80 dark:text-pink-400/80 font-medium bg-pink-100/50 dark:bg-pink-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Studio A
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded flex items-center justify-center text-slate-300 dark:text-slate-600">
                                              Free
                                          </div>
      </div>
      <div class="p-2 relative">
      <div class="h-full w-full bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-rose-800 dark:text-rose-200">Chemistry</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. White
                                              </div>
      </div>
      </div>
      </div>

      <div class="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] min-h-[120px]">
      <div class="p-3 text-xs font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                          11:30
                                      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-orange-800 dark:text-orange-200">PE</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-orange-600 dark:text-orange-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Coach Carter
                                              </div>
      <div class="mt-1 flex items-center gap-1 text-[10px] text-orange-500/80 dark:text-orange-400/80 font-medium bg-orange-100/50 dark:bg-orange-800/30 px-1.5 py-0.5 rounded w-fit">
                                                  Gym
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative bg-slate-50/30">
      <div class="h-full w-full bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-amber-800 dark:text-amber-200">History</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Zinn
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-purple-800 dark:text-purple-200">English Lit</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Ms. Woolf
                                              </div>
      </div>
      </div>
      <div class="p-2 border-r border-slate-100 dark:border-slate-800 relative">
      <div class="h-full w-full bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-cyan-800 dark:text-cyan-200">Geography</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Polo
                                              </div>
      </div>
      </div>
      <div class="p-2 relative">
      <div class="h-full w-full bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded p-2.5 cursor-pointer hover:shadow-md transition-all">
      <span class="text-xs font-bold text-blue-800 dark:text-blue-200">Mathematics</span>
      <div class="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-300">
      <span class="material-symbols-outlined text-[14px]">person</span>
                                                  Mr. Anderson
                                              </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>

      <aside class="w-72 bg-surface-light dark:bg-surface-dark border-l border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 hidden xl:flex shadow-xl z-10">
      <div class="flex items-center justify-between">
      <h3 class="font-bold text-slate-800 dark:text-white">Unscheduled</h3>
      <span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full font-medium">12 Classes</span>
      </div>

      <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
      <input class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary text-slate-700 dark:text-white placeholder:text-slate-400" placeholder="Search subjects..." type="text"/>
      </div>

      <div class="flex-1 overflow-y-auto pr-1 space-y-3">
      <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 mb-3">Math Department</p>
      <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary cursor-grab active:cursor-grabbing group">
      <div class="flex justify-between items-start">
      <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Calculus II</span>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary text-[18px]">drag_pan</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">2 periods / week</p>
      </div>
      <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary cursor-grab active:cursor-grabbing group">
      <div class="flex justify-between items-start">
      <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Geometry</span>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary text-[18px]">drag_pan</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">1 period / week</p>
      </div>
      <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-3">Science Department</p>
      <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary cursor-grab active:cursor-grabbing group">
      <div class="flex justify-between items-start">
      <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Physics Lab</span>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary text-[18px]">drag_pan</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">Lab needs scheduling</p>
      </div>
      <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary cursor-grab active:cursor-grabbing group">
      <div class="flex justify-between items-start">
      <span class="text-sm font-bold text-slate-800 dark:text-slate-200">Biology Intro</span>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary text-[18px]">drag_pan</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">Grade 10 Joint</p>
      </div>

      <div class="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
      <div class="flex items-start gap-2">
      <span class="material-symbols-outlined text-primary text-[20px]">info</span>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                          Drag items onto the grid to schedule them. Conflicts will be highlighted in red.
                                      </p>
      </div>
      </div>
      </div>
      </aside>
      </div>
      </main>
    </div>
    </>
  );
}

