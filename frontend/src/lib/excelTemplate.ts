import ExcelJS from "exceljs";

function applyHeaderStyle(sheet: ExcelJS.Worksheet, color = "FF0891B2") {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 26;
}

function applyRowStyle(sheet: ExcelJS.Worksheet, rowIndex: number) {
  const row = sheet.getRow(rowIndex);
  row.height = 20;
  row.alignment = { vertical: "middle" };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: rowIndex % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF" },
  };
  row.font = { italic: true, color: { argb: "FF94A3B8" } };
  row.eachCell((cell) => {
    cell.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };
  });
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadStudentTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = [
    { header: "first_name",       key: "first_name",       width: 18 },
    { header: "last_name",        key: "last_name",        width: 18 },
    { header: "middle_name",      key: "middle_name",      width: 18 },
    { header: "admission_number", key: "admission_number", width: 24 },
    { header: "date_of_birth",    key: "date_of_birth",    width: 16 },
    { header: "admission_date",   key: "admission_date",   width: 16 },
    { header: "gender",           key: "gender",           width: 12 },
    { header: "status",           key: "status",           width: 12 },
    { header: "class_obj",        key: "class_obj",        width: 12 },
    { header: "address",          key: "address",          width: 35 },
  ];

  applyHeaderStyle(sheet, "FF0891B2");

  sheet.addRow({
    first_name: "Kofi", last_name: "Mensah", middle_name: "Adu",
    admission_number: "2024SNS001", date_of_birth: "2010-03-12",
    admission_date: "2024-09-01", gender: "male", status: "active",
    class_obj: 1, address: "14 Ring Road, Accra",
  });

  applyRowStyle(sheet, 2);
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await downloadWorkbook(workbook, "student_import_template.xlsx");
}

export async function downloadTeacherTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Teachers");

  sheet.columns = [
    { header: "user_id",              key: "user_id",              width: 12 },
    { header: "first_name",           key: "first_name",           width: 18 },
    { header: "last_name",            key: "last_name",            width: 18 },
    { header: "specialization",       key: "specialization",       width: 22 },
    { header: "subject_ids",          key: "subject_ids",          width: 20 },
    { header: "qualifications",       key: "qualifications",       width: 30 },
    { header: "years_of_experience",  key: "years_of_experience",  width: 20 },
    { header: "phone_number",         key: "phone_number",         width: 18 },
    { header: "emergency_contact",    key: "emergency_contact",    width: 18 },
  ];

  applyHeaderStyle(sheet, "FF0D9488");

  sheet.addRow({
    user_id: 5,
    first_name: "Kwame", last_name: "Asante",
    specialization: "Mathematics",
    subject_ids: "1,2,3",
    qualifications: "B.Ed Mathematics, M.Sc Applied Mathematics",
    years_of_experience: 8,
    phone_number: "+233201234567",
    emergency_contact: "+233209876543",
  });

  applyRowStyle(sheet, 2);

  const noteRow = sheet.addRow(["NOTE: subject_ids = comma-separated IDs e.g. 1,2,3. user_id must be an existing user with role=teacher."]);
  noteRow.font = { bold: true, color: { argb: "FFDC2626" }, italic: true };
  noteRow.height = 18;

  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await downloadWorkbook(workbook, "teacher_import_template.xlsx");
}

export async function downloadStaffTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Staff");

  sheet.columns = [
    { header: "first_name",       key: "first_name",       width: 18 },
    { header: "last_name",        key: "last_name",        width: 18 },
    { header: "email",            key: "email",            width: 28 },
    { header: "staff_type",       key: "staff_type",       width: 18 },
    { header: "gender",           key: "gender",           width: 12 },
    { header: "phone_number",     key: "phone_number",     width: 18 },
    { header: "address",          key: "address",          width: 30 },
    { header: "specialization",   key: "specialization",   width: 22 },
    { header: "date_of_birth",    key: "date_of_birth",    width: 16 },
    { header: "employment_date",  key: "employment_date",  width: 18 },
    { header: "national_id",      key: "national_id",      width: 20 },
    { header: "health_info",      key: "health_info",      width: 25 },
    { header: "photo_url",        key: "photo_url",        width: 35 },
  ];

  applyHeaderStyle(sheet, "FF7C3AED");

  sheet.addRow({
    first_name: "Ama", last_name: "Owusu",
    email: "ama.owusu@school.edu.gh",
    staff_type: "admin_staff",
    gender: "female",
    phone_number: "+233244112233",
    address: "7 Labadi Road, Accra",
    specialization: "Administration",
    date_of_birth: "1985-06-20",
    employment_date: "2020-01-15",
    national_id: "GH-2020-AB1234567",
    health_info: "None",
    photo_url: "",
  });

  applyRowStyle(sheet, 2);

  const noteRow = sheet.addRow(["NOTE: staff_type options: headmaster | bursar | admin_staff | support_staff"]);
  noteRow.font = { bold: true, color: { argb: "FFDC2626" }, italic: true };
  noteRow.height = 18;

  sheet.views = [{ state: "frozen", ySplit: 1 }];

  await downloadWorkbook(workbook, "staff_import_template.xlsx");
}