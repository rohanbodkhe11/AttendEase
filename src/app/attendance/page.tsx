
"use client";

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, getStudentsForCourse, saveStudentsForCourse, getAttendance, saveAttendanceReport, getStudentsByClass } from '@/lib/data';
import type { Student, AttendanceRecord as AttendanceRecordType, Course } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AttendanceSheet } from '@/components/app/attendance-sheet';
import { SmartReviewDialog } from '@/components/app/smart-review-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, FileUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';


export default function AttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'faculty')) {
      router.push('/dashboard');
    }
    setAllCourses(getCourses());
  }, [user, authLoading, router]);

  const facultyCourses = allCourses.filter(c => c.facultyId === user?.id);
  const theoryCourses = facultyCourses.filter(c => c.type === 'Theory');
  const practicalCourses = facultyCourses.filter(c => c.type === 'Practical');

  if (authLoading || !user) {
    return <AttendancePageSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mark Attendance</h2>
      </div>

      <Tabs defaultValue="theory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="practical">Practical</TabsTrigger>
        </TabsList>
        <TabsContent value="theory">
            <AttendanceCourseSelector courses={theoryCourses} />
        </TabsContent>
        <TabsContent value="practical">
            <AttendanceCourseSelector courses={practicalCourses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceCourseSelector({ courses }: { courses: Course[] }) {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const facultyClasses = [...new Set(courses.flatMap(c => c.classes))];

    const coursesForClass = courses.filter(c => c.classes.includes(selectedClass || ''));

    const selectedCourse = coursesForClass.find(c => c.id === selectedCourseId);
    
    useEffect(() => {
        if (selectedCourseId && !courses.find(c => c.id === selectedCourseId)?.classes.includes(selectedClass || '')) {
          setSelectedCourseId(null);
        }
    }, [selectedClass, selectedCourseId, courses]);

    const handleCourseStudentsUpdate = (courseId: string, students: Student[]) => {
      // This is a bit of a hack to force a re-render of the child
      // In a real app, you'd use a more robust state management solution
      const currentCourseId = selectedCourseId;
      setSelectedCourseId(null); 
      setTimeout(() => setSelectedCourseId(currentCourseId), 0);
    }

    return (
         <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <Label htmlFor="class-select">Select Class</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass || ""}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyClasses.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course-select">Select Course</Label>
                <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ""} disabled={!selectedClass}>
                    <SelectTrigger id="course-select">
                    <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                    {coursesForClass.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                        {course.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCourse && selectedClass && (
                <AttendanceContent course={selectedCourse} selectedClass={selectedClass} onStudentsUpdate={handleCourseStudentsUpdate} />
            )}
        </div>
    )
}

const theoryTimeSlots = [
    '10:15 - 11:15',
    '11:15 - 12:15',
    '1:15 - 2:15',
    '2:15 - 3:15',
    '3:30 - 4:30',
    '4:30 - 5:30'
];

const practicalTimeSlots = [
    '10:15 - 12:15',
    '1:15 - 3:15',
    '3:30 - 5:30'
];


function AttendanceContent({ course, selectedClass, onStudentsUpdate }: { course: Course, selectedClass: string, onStudentsUpdate: (courseId: string, students: Student[]) => void }) {
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const [pastAttendance, setPastAttendance] = useState<AttendanceRecordType[]>([]);
  const [lectureDate, setLectureDate] = useState('');
  const [lectureTimeSlot, setLectureTimeSlot] = useState('');
  const router = useRouter();


  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    setPastAttendance(getAttendance());
    setClassStudents(getStudentsByClass(selectedClass));
    
    const now = new Date();
    setLectureDate(now.toISOString().split('T')[0]);
    setLectureTimeSlot('');
    setCurrentAttendance(new Map());

  }, [course, selectedClass]);


  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setCurrentAttendance(prev => new Map(prev).set(studentId, isPresent));
  };

  const handleSelectAll = (isPresent: boolean) => {
    const newAttendance = new Map<string, boolean>();
    classStudents.forEach(student => {
      newAttendance.set(student.id, isPresent);
    });
    setCurrentAttendance(newAttendance);
  };
  
  const handleSubmit = () => {
     if(!lectureDate || !lectureTimeSlot) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a date and time slot for the lecture.',
      });
      return;
    }

    const attendanceArray = classStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        isPresent: currentAttendance.get(student.id) ?? false
    }));

    const report = {
        id: `rep-${Date.now()}`,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.courseCode,
        class: selectedClass,
        date: lectureDate,
        timeSlot: lectureTimeSlot,
        attendance: attendanceArray,
    };
    
    saveAttendanceReport(report);
    toast({
      title: "Attendance Submitted",
      description: `Attendance for ${course?.name} has been saved.`,
    })
    
    router.push(`/reports/${report.id}`);
  };

  const getSmartReviewInput = () => {
    if (!course || !lectureDate) return null;
    const currentAttendanceForReview: AttendanceRecordType[] = Array.from(currentAttendance.entries()).map(([studentId, isPresent]) => ({
        studentId,
        date: lectureDate,
        isPresent,
        courseId: course.id,
        id: '',
        class: selectedClass
    }));

    return {
        currentAttendance: currentAttendanceForReview,
        pastAttendance: pastAttendance.filter(pa => pa.courseId === course.id),
        classInfo: `Course: ${course.name} (${course.courseCode}), Class: ${selectedClass}`
    };
  }
  
  const timeSlots = course.type === 'Theory' ? theoryTimeSlots : practicalTimeSlots;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                  Class: {selectedClass} | Course Code: {course.courseCode}
              </CardDescription>
            </div>
            {/* <AddStudentsDialog course={course} onStudentsAdded={handleStudentsAdded} /> */}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <div>
              <Label htmlFor="lecture-date">Lecture Date</Label>
              <Input 
                id="lecture-date"
                type="date" 
                value={lectureDate}
                onChange={(e) => setLectureDate(e.target.value)}
              />
          </div>
          <div>
            <Label htmlFor="time-slot-select">Time Slot</Label>
            <Select onValueChange={setLectureTimeSlot} value={lectureTimeSlot}>
                <SelectTrigger id="time-slot-select">
                <SelectValue placeholder="Select a time slot..." />
                </SelectTrigger>
                <SelectContent>
                {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>
                    {slot}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {classStudents.length > 0 ? (
          <AttendanceSheet
            students={classStudents}
            attendance={currentAttendance}
            onAttendanceChange={handleAttendanceChange}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No students found for class {selectedClass}.</p>
            <p className="text-sm">You can add students via the main student management area.</p>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
            {currentAttendance.size > 0 && <SmartReviewDialog input={getSmartReviewInput()} />}
            <Button onClick={handleSubmit} disabled={classStudents.length === 0}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendancePageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
