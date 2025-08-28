
import type { User, Course, Student, AttendanceRecord, AttendanceReport, Notification } from './types';

// This will now act as our in-memory "database"
let users: User[] = [];
let courses: Course[] = [];
let attendance: AttendanceRecord[] = [];
let courseStudents: Record<string, Student[]> = {};
let attendanceReports: AttendanceReport[] = [];
let notifications: Notification[] = [];

// Flag to ensure initialization only runs once
let isInitialized = false;

// --- Data Persistence Simulation ---
function saveDataToSession() {
  // This function is a placeholder for a real database.
  // In this prototype, data is only stored in-memory for the session.
}

// --- Notification Management ---
export const getNotificationsForStudent = (studentId: string): Notification[] => {
    return notifications.filter(n => n.studentId === studentId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const saveNotifications = (newNotifications: Notification[]) => {
    notifications.push(...newNotifications);
    saveDataToSession();
    console.log("Saved notifications:", newNotifications); // For debugging
}

// --- Student Management for Courses ---
export const getStudentsForCourse = (courseId: string): Student[] => {
    return courseStudents[courseId] || [];
}

export const saveStudentsForCourse = (courseId: string, students: Student[]) => {
    courseStudents[courseId] = students;
    saveDataToSession();
}

export const addStudentsToClass = (className: string, newStudents: { name: string, rollNumber: string }[]): { added: number, skipped: number } => {
    const allUsers = getUsers(); // Get current users
    const existingStudentsInClass = allUsers.filter(u => u.role === 'student' && u.class === className);
    const newUsers: User[] = [];
    let addedCount = 0;
    let skippedCount = 0;

    newStudents.forEach(student => {
        const studentExists = existingStudentsInClass.some(u => u.rollNumber === student.rollNumber);
        if (!studentExists) {
            const newUser: User = {
                id: `user-${Date.now()}-${student.rollNumber}`,
                name: student.name,
                rollNumber: student.rollNumber,
                email: `${student.name.toLowerCase().replace(/\s/g,'.')}.${student.rollNumber}@example.com`,
                password: 'password123',
                role: 'student',
                class: className,
                department: 'Imported',
                avatarUrl: 'https://placehold.co/100x100.png',
            };
            newUsers.push(newUser);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    if (newUsers.length > 0) {
        users = [...users, ...newUsers];
        saveDataToSession();
    }

    return { added: addedCount, skipped: skippedCount };
}


export const getStudentsByClass = (className: string): Student[] => {
  return users.filter(u => u.role === 'student' && u.class === className).map(u => ({
    id: u.id,
    name: u.name,
    rollNumber: u.rollNumber || `S${u.id.replace('student', '')}`, // Generate a sample roll number
    class: u.class || 'N/A'
  }));
}

export const getStudents = (): Student[] => {
  return users.filter(u => u.role === 'student').map(u => ({
    id: u.id,
    name: u.name,
    rollNumber: u.rollNumber || `S${u.id.replace('student', '')}`, // Generate a sample roll number
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
        isPresent: att.isPresent,
        class: report.class,
    }));
    attendance.push(...newAttendanceRecords);
    saveDataToSession();
}


// --- Helper Functions for Data Querying ---
export const getStudentAttendance = (studentId: string): { course: Course; records: AttendanceRecord[] }[] => {
  const student = users.find(u => u.id === studentId);
  if (!student) return [];
  
  return courses
    .filter(course => Array.isArray(course.classes) && course.classes.includes(student.class || ''))
    .map(course => ({
        course,
        records: attendance.filter(att => att.studentId === studentId && att.courseId === course.id),
    }));
};

export const getCourseAttendance = (courseId: string): AttendanceRecord[] => {
  return attendance.filter(att => att.courseId === courseId);
};

function initializeData() {
  if (isInitialized) {
    return;
  }

  users = [
    {
      id: 'student1',
      rollNumber: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE A',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543210'
    },
    {
      id: 'student2',
      rollNumber: '2',
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE A',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543211'
    },
     {
      id: 'student3',
      rollNumber: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE B',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543212'
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

  const defaultCourse: Course = {
    id: 'course-1',
    name: 'Data Structures',
    courseCode: 'CS301',
    facultyId: 'faculty1',
    facultyName: 'Dr. Evelyn Reed',
    classes: ['SE CSE A', 'SE CSE B'],
    totalLectures: 40,
    description: 'An introductory course on fundamental data structures.',
    type: 'Theory',
  };
  courses = [defaultCourse];

  // Correctly get students for the default course
  const allStudents = getUsers().filter(u => u.role === 'student');
  courseStudents[defaultCourse.id] = allStudents
    .filter(s => defaultCourse.classes.includes(s.class || ''))
    .map(u => ({
        id: u.id,
        rollNumber: u.rollNumber || `S${u.id.replace('student','')}`,
        name: u.name,
        class: u.class || 'N/A'
    }));

  saveDataToSession();
  isInitialized = true;
}

// Initialize data as soon as this module is loaded
initializeData();
