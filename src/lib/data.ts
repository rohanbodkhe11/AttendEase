
import type { User, Course, Student, AttendanceRecord, AttendanceReport } from './types';

// This will now act as our in-memory "database"
let users: User[] = [
  {
    id: 'student1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    class: 'SY CSE A',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'student2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    class: 'SY CSE A',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
   {
    id: 'student3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    class: 'SY CSE A',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'faculty1',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn@example.com',
    password: 'password123',
    role: 'faculty',
    department: 'Computer Science',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
];
let courses: Course[] = [];
let attendance: AttendanceRecord[] = [];
let courseStudents: Record<string, Student[]> = {};
let attendanceReports: AttendanceReport[] = [];


// --- Data Persistence Simulation ---
// In a real app, these would interact with a database.
// For this prototype, we'll use session storage to persist data across reloads on the client.
// We use a check for `typeof window` to ensure this code doesn't break server-side rendering.

function initializeData() {
  if (typeof window !== 'undefined') {
    const storedUsers = sessionStorage.getItem('users');
    if (storedUsers) users = JSON.parse(storedUsers);
    
    const storedCourses = sessionStorage.getItem('courses');
    if (storedCourses) courses = JSON.parse(storedCourses);
    
    const storedCourseStudents = sessionStorage.getItem('courseStudents');
    if (storedCourseStudents) courseStudents = JSON.parse(storedCourseStudents);

    const storedAttendance = sessionStorage.getItem('attendance');
    if (storedAttendance) attendance = JSON.parse(storedAttendance);

    const storedAttendanceReports = sessionStorage.getItem('attendanceReports');
    if (storedAttendanceReports) attendanceReports = JSON.parse(storedAttendanceReports);
  }
}

// Initialize data as soon as this module is loaded
initializeData();

function saveDataToSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('courses', JSON.stringify(courses));
    sessionStorage.setItem('courseStudents', JSON.stringify(courseStudents));
    sessionStorage.setItem('attendance', JSON.stringify(attendance));
    sessionStorage.setItem('attendanceReports', JSON.stringify(attendanceReports));
  }
}

// --- Student Management for Courses ---
export const getStudentsForCourse = (courseId: string): Student[] => {
    return courseStudents[courseId] || [];
}

export const saveStudentsForCourse = (courseId: string, students: Student[]) => {
    courseStudents[courseId] = students;
    saveDataToSession();
}


export const getStudents = (): Student[] => {
  return users.filter(u => u.role === 'student').map(u => ({
    id: u.id,
    name: u.name,
    rollNumber: `S${u.id.replace('student', '')}`, // Generate a sample roll number
    class: u.class || 'N/A'
  }));
}

// --- User Management ---
export const getUsers = (): User[] => {
  return users;
};

export const saveUsers = (newUsers: User[]) => {
  users = newUsers;
  saveDataToSession();
};


// --- Course Management ---
export const getCourses = (): Course[] => {
    return courses;
};

export const saveCourses = (newCourses: Course[]) => {
  courses = newCourses;
  saveDataToSession();
};


// --- Attendance Management ---
export const getAttendance = (): AttendanceRecord[] => {
    return attendance;
}

export const saveAttendance = (newAttendance: AttendanceRecord[]) => {
    attendance = newAttendance;
    saveDataToSession();
}


// --- Attendance Report Management ---
export const getAttendanceReports = (): AttendanceReport[] => {
    return attendanceReports;
}

export const getAttendanceReportById = (reportId: string): AttendanceReport | undefined => {
    return attendanceReports.find(r => r.id === reportId);
}

export const saveAttendanceReport = (report: AttendanceReport) => {
    attendanceReports.push(report);
    // Also save the individual records for historical data
    const newAttendanceRecords = report.attendance.map(att => ({
        id: `att-${report.id}-${att.studentId}`,
        courseId: report.courseId,
        studentId: att.studentId,
        date: report.date,
        isPresent: att.isPresent
    }));
    attendance.push(...newAttendanceRecords);
    saveDataToSession();
}


// --- Helper Functions for Data Querying ---
export const getStudentAttendance = (studentId: string): { course: Course; records: AttendanceRecord[] }[] => {
  return courses
    .filter(course => {
        const studentInCourse = getStudentsForCourse(course.id).some(s => s.id === studentId);
        return studentInCourse;
    })
    .map(course => ({
        course,
        records: attendance.filter(att => att.studentId === studentId && att.courseId === course.id),
    }));
};

export const getCourseAttendance = (courseId: string): AttendanceRecord[] => {
  return attendance.filter(att => att.courseId === courseId);
};
