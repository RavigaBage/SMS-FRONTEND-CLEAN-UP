// frontend/src/lib/mock-student-management.ts

export const mockStudentManagement = {
  responseCode: 0,
  responseMessage: "Student records fetched successfully",
  dataCount: 128, // Matches the "Showing 1 to 5 of 128" in the image
  data: [
    { id: "#STU001", fullName: "Sophia Williams", email: "sophia.w@school.edu", grade: "Grade 10 - A", enrollmentDate: "Aug 15, 2023", status: "Active", profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia" },
    { id: "#STU002", fullName: "Lucas Miller", email: "l.miller@school.edu", grade: "Grade 12 - B", enrollmentDate: "Sep 01, 2023", status: "Inactive", profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
    { id: "#STU003", fullName: "Olivia Jones", email: "olivia.j@school.edu", grade: "Grade 10 - A", enrollmentDate: "Aug 22, 2023", status: "Active", profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia" },
    { id: "#STU004", fullName: "Ethan Brown", email: "ethan.b@school.edu", grade: "Grade 9 - C", enrollmentDate: "Oct 10, 2023", status: "Suspended", profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan" },
    { id: "#STU005", fullName: "Ava Wilson", email: "ava.w@school.edu", grade: "Grade 11 - A", enrollmentDate: "Aug 18, 2023", status: "Active", profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava" },
  ]
};