// frontend/src/types/profiles.ts

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export interface Student {
  id: number;
  user: User;
  first_name: string;
  last_name: string;
  fullName: string;
  date_of_birth: string | null;
  profileImage: string;
  email: string;
  classInfo: any,
  gender:String;
  gender_display:String;
  grade: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'inactive';
  parent?: {
    id: number;
    phone_number: string;
    address: string;
  };
}


export interface StudentListItem {
  id: number;
  fullName: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'inactive';
  profileImage: string;
}
