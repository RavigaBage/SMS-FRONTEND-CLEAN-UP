import { notFound } from "next/navigation";
import Link from "next/link";
import {curriculumData} from "@/src/data/curricullum";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(curriculumData).map((slug) => ({ slug }));
}

export default async function ProgrammePage({ params }: PageProps) {
  const { slug } = await params;
  const programme = curriculumData[slug];

  if (!programme) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/#programs" className="hover:text-purple-700 transition">
            Academic Programmes
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">{programme.title}</span>
        </nav>

      
        <header className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl bg-purple-50 p-3 rounded-xl">{programme.icon}</span>
            <div>
              <span className="text-xs font-semibold tracking-wider text-purple-700 uppercase block">
                {programme.levelRange}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mt-0.5">
                {programme.title}
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
            {programme.tagline}
          </p>
        </header>

      
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            GES Certified Curriculum Subjects
            <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
              {programme.subjects.length} Subjects
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programme.subjects.map((subject, index) => (
              <div 
                key={index} 
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all duration-200 flex items-start gap-4 group"
              >
              
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-purple-900 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Standard Ghana Education Service approved module framework.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}