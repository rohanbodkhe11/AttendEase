
import type { User, Course, Student, AttendanceRecord } from './types';

export const mockUsers: User[] = [
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

export const pastAttendance: AttendanceRecord[] = [];

// Course data management with sessionStorage
export const getCourses = (): Course[] => {
  try {
    const storedCourses = sessionStorage.getItem('courses');
    if (storedCourses) {
      return JSON.parse(storedCourses);
    } else {
      sessionStorage.setItem('courses', JSON.stringify(courses));
      return courses;
    }
  } catch (error) {
    // If sessionStorage is not available (e.g., in SSR), return the initial in-memory data
    return courses;
  }
};

export const saveCourses = (newCourses: Course[]) => {
  try {
    courses = newCourses; // Also update in-memory cache for SSR
    sessionStorage.setItem('courses', JSON.stringify(courses));
  } catch (error) {
    console.error("Failed to save courses to sessionStorage", error);
  }
};


const generateAttendance = () => {
  if (pastAttendance.length > 0) return; // Don't generate if already populated
  const dates: string[] = [];
  for(let i=10; i>0; i--) {
    dates.push(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }

  getCourses().forEach(course => {
    students.filter(s => s.class === course.class).forEach(student => {
      dates.forEach(date => {
        // Alice has good attendance, Bob has okay, Charlie is often absent
        let isPresent = true;
        if (student.id === 'student2') isPresent = Math.random() > 0.2; // 80% present
        if (student.id === 'student3') isPresent = Math.random() > 0.6; // 40% present
        if (student.id === 'student1' && date === dates[dates.length - 1]) isPresent = false; // Alice was absent yesterday. Anomaly!
        
        pastAttendance.push({
          id: `att${pastAttendance.length + 1}`,
          courseId: course.id,
          studentId: student.id,
          date: date,
          isPresent: isPresent,
        });
      });
    });
  });
};

generateAttendance();

// Helper functions to query data
export const getStudentAttendance = (studentId: string): { course: Course; records: AttendanceRecord[] }[] => {
  return getCourses().map(course => ({
    course,
    records: pastAttendance.filter(att => att.studentId === studentId && att.courseId === course.id),
  }));
};

export const getCourseAttendance = (courseId: string): AttendanceRecord[] => {
  return pastAttendance.filter(att => att.courseId === courseId);
};

// User data management with sessionStorage
export const getUsers = (): User[] => {
  try {
    const storedUsers = sessionStorage.getItem('users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    } else {
      sessionStorage.setItem('users', JSON.stringify(mockUsers));
      return mockUsers;
    }
  } catch (error) {
    // If sessionStorage is not available (e.g., in SSR), return the initial in-memory data
    return mockUsers;
  }
};

export const saveUsers = (users: User[]) => {
  try {
    sessionStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to sessionStorage", error);
  }
};
