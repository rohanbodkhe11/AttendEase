
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, students, getAttendance } from '@/lib/data';
import type { Student, AttendanceRecord as AttendanceRecordType, Course } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AttendanceSheet } from '@/components/app/attendance-sheet';
import { SmartReviewDialog } from '@/components/app/smart-review-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    
    useEffect(() => {
        // Reset selected course if the course list changes
        if (courses.length > 0 && !courses.find(c => c.id === selectedCourseId)) {
          setSelectedCourseId(null);
        }
    }, [courses, selectedCourseId]);

    return (
         <div className="space-y-4">
            <div className="max-w-sm">
            <Label htmlFor="course-select">Select Course</Label>
            <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ""}>
                <SelectTrigger id="course-select">
                <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.class}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {selectedCourse && (
                <AttendanceContent course={selectedCourse} />
            )}
        </div>
    )
}


function AttendanceContent({ course }: { course: Course }) {
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const [pastAttendance, setPastAttendance] = useState<AttendanceRecordType[]>([]);
  
  useEffect(() => {
    setPastAttendance(getAttendance());
  }, []);


  const classStudents = course ? students.filter(s => s.class === course.class) : [];
  const currentDate = new Date();

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
    toast({
      title: "Attendance Submitted",
      description: `Attendance for ${course?.name} has been saved.`,
    })
    console.log("Submitted Attendance:", Array.from(currentAttendance.entries()));
    // Here you would typically send the data to your backend
  };

  const getSmartReviewInput = () => {
    if (!course) return null;
    const currentDateStr = new Date().toISOString().split('T')[0];
    const currentAttendanceForReview: AttendanceRecordType[] = Array.from(currentAttendance.entries()).map(([studentId, isPresent]) => ({
        studentId,
        date: currentDateStr,
        isPresent,
        courseId: course.id,
        id: ''
    }));

    return {
        currentAttendance: currentAttendanceForReview,
        pastAttendance: pastAttendance.filter(pa => pa.courseId === course.id),
        classInfo: `Course: ${course.name} (${course.courseCode}), Class: ${course.class}`
    };
  }

  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span><strong>Class:</strong> {course.class}</span>
          <span><strong>Course Code:</strong> {course.courseCode}</span>
          <span><strong>Time:</strong> {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span><strong>Date:</strong> {currentDate.toLocaleDateString()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <AttendanceSheet
          students={classStudents}
          attendance={currentAttendance}
          onAttendanceChange={handleAttendanceChange}
          onSelectAll={handleSelectAll}
        />
        <div className="flex justify-end gap-2 mt-4">
            {currentAttendance.size > 0 && <SmartReviewDialog input={getSmartReviewInput()} />}
            <Button onClick={handleSubmit} disabled={currentAttendance.size === 0}>Submit Attendance</Button>
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
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
