
export type Role = 'student' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department?: string;
  class?: string;
  avatarUrl?: string;
  rollNumber?: string;
  mobileNumber?: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name:string;
  class: string;
}

export interface Course {
  id: string;
  name: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  classes: string[];
  totalLectures: number;
  description: string;
  type: 'Theory' | 'Practical';
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  isPresent: boolean;
  class: string;
}

export interface AttendanceReport {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  class: string;
  date: string;
  timeSlot: string;
  attendance: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    isPresent: boolean;
  }[];
}

export interface Notification {
  id: string;
  studentId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
