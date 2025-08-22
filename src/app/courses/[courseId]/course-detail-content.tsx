
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getStudentsForCourse, getCourseAttendance } from '@/lib/data';
import type { Course, Student, AttendanceRecord } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetailContent({ course }: { course: Course }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const courseStudents = getStudentsForCourse(course.id);
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if(course) {
      setAttendanceRecords(getCourseAttendance(course.id));
    }
  }, [course]);


  const handleAttendanceChange = (recordId: string, newStatus: 'true' | 'false') => {
    setAttendanceRecords(prevRecords =>
      prevRecords.map(rec =>
        rec.id === recordId ? { ...rec, isPresent: newStatus === 'true' } : rec
      )
    );
  };
  
  const saveChanges = () => {
    // Here you would send 'attendanceRecords' to your backend to save.
    toast({
        title: "Changes Saved",
        description: `Attendance for ${course.name} has been updated.`,
    });
  }
  
  const getUniqueDates = () => {
    if (!attendanceRecords) return [];
    const dates = attendanceRecords.map(r => r.date);
    return [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  if (authLoading || !user) {
    return <CourseDetailPageSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{course.name}</CardTitle>
          <CardDescription>
            {course.courseCode} | Taught by {course.facultyName} | Class: {course.class}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{course.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>
              {user.role === 'faculty' ? "View and edit attendance for all students." : "Your attendance record for this course."}
            </CardDescription>
          </div>
          {user.role === 'faculty' && <Button onClick={saveChanges}>Save Changes</Button>}
        </CardHeader>
        <CardContent>
          {courseStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  {getUniqueDates().map(date => (
                    <TableHead key={date} className="text-center">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(user.role === 'faculty' ? courseStudents : courseStudents.filter(s => s.id === user.id)).map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name} ({student.rollNumber})</TableCell>
                    {getUniqueDates().map(date => {
                      const record = attendanceRecords.find(r => r.studentId === student.id && r.date === date);
                      return (
                        <TableCell key={`${student.id}-${date}`} className="text-center">
                          {user.role === 'faculty' ? (
                            <FacultyAttendanceCell record={record} onAttendanceChange={handleAttendanceChange} />
                          ) : (
                            <StudentAttendanceCell record={record} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students have been added to this course yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function FacultyAttendanceCell({ record, onAttendanceChange } : { record: AttendanceRecord | undefined, onAttendanceChange: (recordId: string, status: 'true' | 'false') => void}) {
    if (!record) return <Badge variant="outline">N/A</Badge>;

    return (
        <Select
            defaultValue={record.isPresent ? 'true' : 'false'}
            onValueChange={(value: 'true' | 'false') => onAttendanceChange(record.id, value)}
        >
            <SelectTrigger className={`w-28 h-8 text-xs ${record.isPresent ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="true">Present</SelectItem>
                <SelectItem value="false">Absent</SelectItem>
            </SelectContent>
        </Select>
    );
}

function StudentAttendanceCell({ record } : { record: AttendanceRecord | undefined }) {
  if (!record) return <Badge variant="outline">N/A</Badge>;
  return record.isPresent ? 
    <Badge className="bg-green-500 hover:bg-green-600">Present</Badge> : 
    <Badge variant="destructive">Absent</Badge>;
}

function CourseDetailPageSkeleton() {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-9 w-3/5" />
                    <Skeleton className="h-5 w-4/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
         </div>
    )
}

    