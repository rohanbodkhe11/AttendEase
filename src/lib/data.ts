
import type { User, Course, Student, AttendanceRecord } from './types';

// Initial seed data, which can be used if sessionStorage is not available or empty.
const initialUsers: User[] = [
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

export const students: Student[] = [
  { id: 'student1', rollNumber: 'S01', name: 'Alice Johnson', class: 'SY CSE A' },
  { id: 'student2', rollNumber: 'S02', name: 'Bob Williams', class: 'SY CSE A' },
  { id: 'student3', rollNumber: 'S03', name: 'Charlie Brown', class: 'SY CSE A' },
  { id: 'student4', rollNumber: 'S04', name: 'Diana Miller', class: 'SY CSE A' },
  { id: 'student5', rollNumber: 'S05', name: 'Ethan Davis', class: 'SY CSE A' },
  { id: 'student6', rollNumber: 'S06', name: 'Fiona Garcia', class: 'SY CSE A' },
];

let courses: Course[] = [];
let pastAttendance: AttendanceRecord[] = [];
let users: User[] = [...initialUsers];

// Course data management
export const getCourses = (): Course[] => {
  if (typeof window !== 'undefined') {
    const storedCourses = sessionStorage.getItem('courses');
    if (storedCourses) {
      return JSON.parse(storedCourses);
    }
    sessionStorage.setItem('courses', JSON.stringify([]));
  }
  return [];
};

export const saveCourses = (newCourses: Course[]) => {
  courses = newCourses;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('courses', JSON.stringify(courses));
    // When courses change, re-generate attendance for them.
    generateAttendance(newCourses);
  }
};

const generateAttendance = (currentCourses: Course[]) => {
  let newAttendance: AttendanceRecord[] = [];
    if (currentCourses.length === 0) {
      saveAttendance([]); // Clear attendance if no courses
      return;
  };
  
  const dates: string[] = [];
  for(let i=10; i>0; i--) {
    dates.push(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }

  currentCourses.forEach(course => {
    students.filter(s => s.class === course.class).forEach(student => {
      dates.forEach(date => {
        let isPresent = Math.random() > 0.15; // 85% chance of being present
        newAttendance.push({
          id: `att${newAttendance.length + 1}`,
          courseId: course.id,
          studentId: student.id,
          date: date,
          isPresent: isPresent,
        });
      });
    });
  });
  saveAttendance(newAttendance);
};

export const getAttendance = (): AttendanceRecord[] => {
    if (typeof window !== 'undefined') {
        const storedAttendance = sessionStorage.getItem('attendance');
        if (storedAttendance) {
            return JSON.parse(storedAttendance);
        }
         sessionStorage.setItem('attendance', JSON.stringify([]));
    }
    return [];
}

export const saveAttendance = (newAttendance: AttendanceRecord[]) => {
    pastAttendance = newAttendance;
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('attendance', JSON.stringify(pastAttendance));
    }
}


// Helper functions to query data
export const getStudentAttendance = (studentId: string): { course: Course; records: AttendanceRecord[] }[] => {
  const allCourses = getCourses();
  const allAttendance = getAttendance();
  return allCourses
    .filter(course => {
        const studentClass = getUsers().find(u => u.id === studentId)?.class;
        return course.class === studentClass;
    })
    .map(course => ({
        course,
        records: allAttendance.filter(att => att.studentId === studentId && att.courseId === course.id),
    }));
};

export const getCourseAttendance = (courseId: string): AttendanceRecord[] => {
  const allAttendance = getAttendance();
  return allAttendance.filter(att => att.courseId === courseId);
};

// User data management with sessionStorage
export const getUsers = (): User[] => {
  if (typeof window !== 'undefined') {
    const storedUsers = sessionStorage.getItem('users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    sessionStorage.setItem('users', JSON.stringify(users));
  }
  return users;
};

export const saveUsers = (newUsers: User[]) => {
  users = newUsers;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('users', JSON.stringify(users));
  }
};

// Initialize data on load
if (typeof window !== 'undefined') {
    if (!sessionStorage.getItem('courses')) {
        sessionStorage.setItem('courses', JSON.stringify([]));
    }
    if (!sessionStorage.getItem('attendance')) {
        sessionStorage.setItem('attendance', JSON.stringify([]));
    }
    if (!sessionStorage.getItem('users')) {
        sessionStorage.setItem('users', JSON.stringify(initialUsers));
    }
    courses = JSON.parse(sessionStorage.getItem('courses')!);
    pastAttendance = JSON.parse(sessionStorage.getItem('attendance')!);
    users = JSON.parse(sessionStorage.getItem('users')!);
}
