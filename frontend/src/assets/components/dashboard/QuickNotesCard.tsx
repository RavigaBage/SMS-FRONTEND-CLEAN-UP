
import { StickyNote } from "lucide-react";

export function QuickNotes({ note }: { note: string }) {
  return (
    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-amber-800">
        <StickyNote size={18} />
        <h3 className="font-bold text-sm uppercase tracking-wider">Quick Notes</h3>
      </div>
      <p className="text-sm italic text-amber-900 leading-relaxed">
        "{note || "No notes available for this student."}"
      </p>
      <div className="mt-4 flex justify-end">
        <button className="text-[10px] font-bold text-amber-700 hover:underline uppercase">
          Add New Note
        </button>
      </div>
    </div>
  );
}