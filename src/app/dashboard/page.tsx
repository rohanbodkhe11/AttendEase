
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getCourses, getStudentAttendance, users, students } from "@/lib/data";
import type { Course, AttendanceRecord, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, User as UserIcon, Users, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
        {user.role === 'faculty' ? <FacultyDashboard user={user} /> : <StudentDashboard user={user} />}
    </div>
  );
}

function DashboardSkeleton() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}

function FacultyDashboard({ user }: { user: User }) {
  const courses = getCourses();
  const facultyCourses = courses.filter(c => c.facultyId === user.id);
  const facultyClasses = [...new Set(facultyCourses.map(c => c.class))];
  const totalStudents = students.filter(s => facultyClasses.includes(s.class)).length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facultyCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses you are teaching this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students across all your classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lecture</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Data Structures</div>
            <p className="text-xs text-muted-foreground">Today at 10:00 AM in SY CSE A</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>An overview of the courses you are teaching.</CardDescription>
                </div>
                 <Button asChild>
                    <Link href="/courses/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Course
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead className="text-right">Total Lectures</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {facultyCourses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell>{course.courseCode}</TableCell>
                                <TableCell>{course.class}</TableCell>
                                <TableCell className="text-right">{course.totalLectures}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}

function StudentDashboard({ user }: { user: User }) {
  const [attendance, setAttendance] = useState<{ course: Course; records: AttendanceRecord[] }[]>([]);
  const courses = getCourses();
  
  useEffect(() => {
    if (user) {
        setAttendance(getStudentAttendance(user.id));
    }
  }, [user]);

  const calculateAttendancePercentage = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0;
    const presentCount = records.filter(r => r.isPresent).length;
    return (presentCount / records.length) * 100;
  }
  
  const overallPercentage = calculateAttendancePercentage(attendance.flatMap(a => a.records));

  const studentCourses = courses.filter(c => c.class === user.class);
  
  const getLastAbsentRecord = () => {
    const allRecords = attendance.flatMap(a => a.records.map(r => ({...r, courseName: a.course.name})));
    const absentRecords = allRecords.filter(r => !r.isPresent);
    if(absentRecords.length === 0) return null;
    absentRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return absentRecords[0];
  }

  const lastAbsent = getLastAbsentRecord();


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <Progress value={overallPercentage} className="h-2 w-20" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Absent</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastAbsent ? (
                <>
                    <div className="text-2xl font-bold">{lastAbsent.courseName}</div>
                    <p className="text-xs text-muted-foreground">on {new Date(lastAbsent.date).toLocaleDateString()}</p>
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">No absences recorded yet!</p>
                </>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance status in each course.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendance.map(({ course, records }) => {
                const percentage = calculateAttendancePercentage(records);
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
