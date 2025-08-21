"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { courses, students, pastAttendance } from '@/lib/data';
import type { Student, AttendanceRecord as AttendanceRecordType } from '@/lib/types';
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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'faculty')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const facultyCourses = courses.filter(c => c.facultyId === user?.id);
  const selectedCourse = facultyCourses.find(c => c.id === selectedCourseId);
  const classStudents = selectedCourse ? students.filter(s => s.class === selectedCourse.class) : [];
  
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
      description: `Attendance for ${selectedCourse?.name} has been saved.`,
    })
    console.log("Submitted Attendance:", Array.from(currentAttendance.entries()));
    // Here you would typically send the data to your backend
  };

  if (authLoading || !user) {
    return <AttendancePageSkeleton />;
  }

  const getSmartReviewInput = () => {
    if (!selectedCourse) return null;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentAttendanceForReview: AttendanceRecordType[] = Array.from(currentAttendance.entries()).map(([studentId, isPresent]) => ({
        studentId,
        date: currentDate,
        isPresent,
    }));

    return {
        currentAttendance: currentAttendanceForReview,
        pastAttendance: pastAttendance.filter(pa => pa.courseId === selectedCourse.id),
        classInfo: `Course: ${selectedCourse.name} (${selectedCourse.courseCode}), Class: ${selectedCourse.class}`
    };
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mark Attendance</h2>
      </div>

      <div className="space-y-4">
        <div className="max-w-sm">
          <Label htmlFor="course-select">Select Course</Label>
          <Select onValueChange={setSelectedCourseId}>
            <SelectTrigger id="course-select">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {facultyCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} - {course.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCourse && (
          <Tabs defaultValue="theory">
            <TabsList>
              <TabsTrigger value="theory">Theory</TabsTrigger>
              <TabsTrigger value="practical">Practical</TabsTrigger>
            </TabsList>
            <TabsContent value="theory">
              <AttendanceContent 
                course={selectedCourse} 
                students={classStudents}
                attendance={currentAttendance}
                onAttendanceChange={handleAttendanceChange}
                onSelectAll={handleSelectAll}
                onSubmit={handleSubmit}
                smartReviewInput={getSmartReviewInput()}
              />
            </TabsContent>
            <TabsContent value="practical">
              <AttendanceContent 
                course={selectedCourse} 
                students={classStudents}
                attendance={currentAttendance}
                onAttendanceChange={handleAttendanceChange}
                onSelectAll={handleSelectAll}
                onSubmit={handleSubmit}
                smartReviewInput={getSmartReviewInput()}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function AttendanceContent({ course, students, attendance, onAttendanceChange, onSelectAll, onSubmit, smartReviewInput }: any) {
  const currentDate = new Date();
  
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
          students={students}
          attendance={attendance}
          onAttendanceChange={onAttendanceChange}
          onSelectAll={onSelectAll}
        />
        <div className="flex justify-end gap-2 mt-4">
            {smartReviewInput && smartReviewInput.currentAttendance.length > 0 && <SmartReviewDialog input={smartReviewInput} />}
            <Button onClick={onSubmit}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendancePageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-9 w-64" />
      <div className="space-y-4">
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
