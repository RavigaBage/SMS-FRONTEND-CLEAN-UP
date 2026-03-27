import * as XLSX from "xlsx";

export const downloadStudentTemplate = () => {
    // 1. Define headers with example data
  const headers = [
    {
      "admission_number": "STU001",
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "Kofi",
      "date_of_birth": "2010-05-15", // ISO format is safest for Django
      "gender": "male",
      "address": "123 Street, Accra",
      "nationality": "Ghanaian",
      "class_id": "1" // Remind them they need the ID
    }
  ];

  // 2. Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students_Template");

  // 3. Set column widths so it looks professional
  const wscols = [
    { wch: 20 }, // admission_number
    { wch: 15 }, // first_name
    { wch: 15 }, // last_name
    { wch: 15 }, // middle_name
    { wch: 15 }, // date_of_birth
    { wch: 10 }, // gender
    { wch: 25 }, // address
    { wch: 15 }, // nationality
    { wch: 10 }, // class_id
  ];
  worksheet["!cols"] = wscols;

  // 4. Trigger download
  XLSX.writeFile(workbook, "Student_Import_Template.xlsx");
};