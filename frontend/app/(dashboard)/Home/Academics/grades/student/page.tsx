import { Suspense } from "react";
import GradeEntryClient from "@/src/assets/components/management/GradeEntryClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading grades…</div>}>
      <GradeEntryClient />
    </Suspense>
  );
}
