import { Suspense } from "react";
import InvoiceEntryClient from "@/src/assets/components/management/InvoiceEntryClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading Invoices…</div>}>
      <InvoiceEntryClient />
    </Suspense>
  );
}
