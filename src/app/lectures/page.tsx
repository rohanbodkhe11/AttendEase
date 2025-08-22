
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getCourses, getStudents, getUsers } from '@/lib/data';
import type { Course, Student } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttendanceSheet } from '@/components/app/attendance-sheet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function LecturesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lectureDateTime, setLectureDateTime] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'faculty')) {
      router.push('/dashboard');
    }
    setAllCourses(getCourses());
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <LecturesPageSkeleton />;
  }

  const facultyUser = getUsers().find(u => u.id === user.id);
  const facultyCourses = allCourses.filter(c => c.facultyId === user.id);
  const theoryCourses = facultyCourses.filter(c => c.type === 'Theory');
  const practicalCourses = facultyCourses.filter(c => c.type === 'Practical');
  const classStudents = selectedCourse ? getStudents().filter(s => (selectedCourse.classes || []).includes(s.class)) : [];
  
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setCurrentAttendance(new Map());
    setLectureDateTime('');
  }

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
    if(!lectureDateTime) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a date and time for the lecture.',
      });
      return;
    }
    toast({
      title: "Attendance Submitted",
      description: `Attendance for ${selectedCourse?.name} on ${new Date(lectureDateTime).toLocaleString()} has been saved.`,
    })
    console.log("Submitted Attendance:", Array.from(currentAttendance.entries()));
    // Here you would typically send this data to a backend to be saved permanently.
    // For this prototype, we'll just log it.
    
    // Reset state after submission
    setSelectedCourse(null);
    setCurrentAttendance(new Map());
    setLectureDateTime('');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Lectures</h2>
      </div>
      
      {!selectedCourse ? (
        <Tabs defaultValue="theory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="theory">Theory</TabsTrigger>
            <TabsTrigger value="practical">Practical</TabsTrigger>
          </TabsList>
          <TabsContent value="theory">
            <CourseList courses={theoryCourses} onCourseSelect={handleCourseSelect} title="Theory Courses" />
          </TabsContent>
          <TabsContent value="practical">
            <CourseList courses={practicalCourses} onCourseSelect={handleCourseSelect} title="Practical Courses" />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCourse.name} - Mark Attendance</CardTitle>
            <CardDescription>
                Classes: {selectedCourse.classes.join(', ')} | Department: {facultyUser?.department}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs">
              <Label htmlFor="lecture-time">Lecture Date & Time</Label>
              <Input 
                id="lecture-time"
                type="datetime-local" 
                value={lectureDateTime}
                onChange={(e) => setLectureDateTime(e.target.value)}
              />
            </div>
            <AttendanceSheet 
              students={classStudents}
              attendance={currentAttendance}
              onAttendanceChange={handleAttendanceChange}
              onSelectAll={handleSelectAll}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={currentAttendance.size === 0}>Submit Attendance</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CourseList({ courses, onCourseSelect, title }: { courses: Course[], onCourseSelect: (course: Course) => void, title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Select a course to mark attendance for a new lecture.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <Card key={course.id} className="p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold">{course.name}</h3>
              <p className="text-sm text-muted-foreground">{course.courseCode}</p>
              <p className="text-sm text-muted-foreground">Classes: {course.classes.join(', ')}</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => onCourseSelect(course)}>
              Mark Attendance
            </Button>
          </Card>
        ))}
        {courses.length === 0 && <p className="text-muted-foreground col-span-full py-4 text-center">No {title.toLowerCase()} found. Please create one first.</p>}
      </CardContent>
    </Card>
  )
}


function LecturesPageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-9 w-64" />
      <div className="space-y-4">
        <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
