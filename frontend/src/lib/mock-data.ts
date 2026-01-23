// frontend/src/lib/mock-data.ts

export const mockStudentProfile = {
  responseCode: 0, // Success [cite: 24]
  responseMessage: "Request completed successfully", // [cite: 9]
  dataCount: 1, // [cite: 11]
  data: {
    // Profile Header Info
    fullName: "Alex Johnson",
    studentId: "2023-8492",
    gradeLevel: "Grade 10-B",
    stream: "Science Stream",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    
    // Stats Cards
    currentGpa: 3.8,
    gpaTrend: "+0.2%",
    attendancePercentage: 96,
    pendingTasks: 2,
    
    // Personal Details (Left Column)
    personalDetails: {
      dateOfBirth: "14 March 2008",
      phone: "+233 20 123 4567",
      email: "alex.j@student.edu",
      address: "Airport Residential, Accra, GA-184-0125",
      guardianName: "Sarah Johnson (Mother)"
    },

    // Academic History Table (Right Column)
    academicHistory: [
      { subjectName: "Mathematics", teacherName: "Mr. Addo", gradeLetter: "A", midTerm: "92%", status: "Pass" },
      { subjectName: "Physics", teacherName: "Ms. Lartey", gradeLetter: "B+", midTerm: "88%", status: "Pass" },
      { subjectName: "English Lit", teacherName: "Mrs. Asare", gradeLetter: "A-", midTerm: "90%", status: "Pass" },
      { subjectName: "History", teacherName: "Mr. Osei", gradeLetter: "C", midTerm: "76%", status: "Review" }
    ],
    
    quickNote: "Alex shows strong leadership skills in group projects but needs to focus on timely submission of assignments."
  } 
};

export const mockValidationError = {
  "responseCode": 1,
  "responseMessage": "Validation failed",
  "data": {
    "studentId": "Student ID must be in format YYYY-XXXX"
  },
  "dataCount": 0
};

export const mockNotFoundError = {
  "responseCode": 6,
  "responseMessage": "Requested resource does not exist",
  "data": null,
  "dataCount": 0
};