import { fetchWithAuth } from "@/src/lib/apiClient";

interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

interface StudentType {
  id: number;
  user: UserType;
  parent: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: "active" | "inactive" | "graduated" | string;
}



// API functions

// Type Definitions
interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

interface StudentType {
  id: number;
  user: UserType;
  parent: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: "active" | "inactive" | "graduated" | string;
}



interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

interface StudentType {
  id: number;
  user: UserType;
  parent: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: "active" | "inactive" | "graduated" | string;
}

export interface ResultType {
  id?: number;
  student?: StudentType;
  student_id?: number;
  class_id?: number;
  subject_id?: number;
  assessment_score: number;
  assessment_total: number;
  test_score: number;
  test_total: number;
  exam_score: number;
  exam_total: number;
  weighted_assessment: number;
  weighted_test: number;
  weighted_exam: number;
  total_score: number;
  grade_letter: string;
  grade_date?: string;
  subject_rank?: string;
  academic_year?: string;
  term?: string;
  remarks?:string;
}
  const buildPayload = (
    studentId: number, classId: number, subjectId: number,
    academicYear: string, term: string, data: Partial<ResultType>
  ) => ({
    student_id:           studentId,
    class_id:             classId,
    subject_id:           subjectId,
    academic_year:        academicYear,
    term:                 term,
    assessment_score:     data.assessment_score     ?? 0,
    assessment_total:     data.assessment_total     ?? 0,
    test_score:           data.test_score           ?? 0,
    test_total:           data.test_total           ?? 0,
    exam_score:           data.exam_score           ?? 0,
    exam_total:           data.exam_total           ?? 0,
    weighted_assessment:  data.weighted_assessment  ?? 0,
    weighted_test:        data.weighted_test        ?? 0,
    weighted_exam:        data.weighted_exam        ?? 0,
    total_score:          data.total_score          ?? 0,
    grade_letter:         data.grade_letter         ?? 'F',
    remarks:              data.remarks              ?? '' ,  // ← add this
  });
// API Methods
export const gradeApi = {

  getGradeByParams: async ({
    studentId,
    classId,
    subjectId,
    academicYear,
    term,
  }: {
    studentId: number;
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
  }): Promise<ResultType> => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/grades/by-params/?student=${studentId}&class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to fetch grade");
    }
    return (await res.json()).grade;
  },


  createGrade: async ({
    studentId,
    classId,
    subjectId,
    academicYear,
    term,
    data,
  }: {
    studentId: number;
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
    data: Partial<ResultType>;
  }): Promise<ResultType> => {


    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/grades/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload(studentId, classId, subjectId, academicYear, term, data)),
      }
    );
    
    if (!res.ok) {
      const error = await res.json();
      console.error("Create grade error:", error);
      throw new Error(error.detail || JSON.stringify(error) || "Failed to create grade");
    }
    return await res.json();
  },

  /**
   * Update an existing grade by its parameters
   */
  updateGradeByParams: async ({
    studentId,
    classId,
    subjectId,
    academicYear,
    term,
    data,
  }: {
    studentId: number;
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
    data: Partial<ResultType>;
  }): Promise<ResultType> => {
    const payload = {
      student_id: studentId,
      class_id: classId,
      subject_id: subjectId,
      academic_year: academicYear,
      term: term,
      assessment_score: data.assessment_score || 0,
      assessment_total: data.assessment_total || 0,
      test_score: data.test_score || 0,
      test_total: data.test_total || 0,
      exam_score: data.exam_score || 0,
      exam_total: data.exam_total || 0,
      weighted_assessment: data.weighted_assessment || 0,
      weighted_test: data.weighted_test || 0,
      weighted_exam: data.weighted_exam || 0,
      total_score: data.total_score || 0,
      grade_letter: data.grade_letter || 'F',
    };
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/grades/by-params/?student=${studentId}&class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload(studentId, classId, subjectId, academicYear, term, data)),
      }
    );
    if (!res.ok) {
      const error = await res.json();
      console.error("Update grade error:", error);
      throw new Error(error.detail || JSON.stringify(error) || "Failed to update grade");
    }
    return await res.json();
  },


  saveGrade: async ({
    studentId,
    classId,
    subjectId,
    academicYear,
    term,
    data,
    isNewGrade,
  }: {
    studentId: number;
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
    data: Partial<ResultType>;
    isNewGrade: boolean;
  }): Promise<ResultType> => {
    if (isNewGrade) {
      return gradeApi.createGrade({
        studentId,
        classId,
        subjectId,
        academicYear,
        term,
        data,
      });
    } else {
      return gradeApi.updateGradeByParams({
        studentId,
        classId,
        subjectId,
        academicYear,
        term,
        data,
      });
    }
  },
};