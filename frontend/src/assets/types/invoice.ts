
export interface InvoiceStudent {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: "male" | "female" | "other";
  gender_display: string;
  address: string;
  nationality: string;
  religion: string;
  blood_group: string;
  medical_conditions: string;
  status: "active" | "inactive" | "graduated" | "suspended";
  status_display: string;
  admission_date: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
  class_info: string | null;
}


export interface InvoiceItem {
  id: number;
  description: string;
  amount: string; 
}


export type InvoiceStatus =
  | "unpaid"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

export type InvoiceTerm = "1" | "2" | "3" | "annual";


export interface Invoice {
  id: number;
  invoice_number: string;
  student: InvoiceStudent;
  student_id?: number; 
  academic_year: string;
  term: InvoiceTerm;
  term_display: string;
  total_amount: string;
  amount_paid: string;
  balance: string;
  due_date: string;
  status: InvoiceStatus;
  status_display: string;
  items: InvoiceItem[];
  generated_by: number | null;
  generated_by_username: string | null;
  created_at: string;
  updated_at: string;
}


export interface InvoiceListResponse {
  results: Invoice[];
  count: number;
  next: string | null;
  previous: string | null;
}


export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | "all";
  term?: InvoiceTerm | "all";
  academic_year?: string;
  page?: number;
}


export interface InvoiceSummary {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
  paidCount: number;
}
