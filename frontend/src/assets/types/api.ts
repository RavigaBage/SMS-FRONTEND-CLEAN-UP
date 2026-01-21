// frontend/src/types/api.ts
export interface ApiResponse<T> {
  responseCode: number;      // 0 = Success, 1-8 = Specific Errors [cite: 24]
  responseMessage: string;    // User-safe message [cite: 67]
  data: T | null;            // The actual content (Profile, Grades, etc.) [cite: 10]
  dataCount: number;         // Total number of records [cite: 68]
}