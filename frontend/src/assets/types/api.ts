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
  fullName: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  profileImage: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'inactive';
  // Note: Parent data is nested per the serializer
  parent?: {
    id: number;
    phone_number: string;
    address: string;
  };
}