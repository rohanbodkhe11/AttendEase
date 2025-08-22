
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getCourses, getStudentAttendance, getUsers, getStudents } from "@/lib/data";
import type { Course, AttendanceRecord, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, User as UserIcon, Users, PlusCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

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
  const theoryCourses = facultyCourses.filter(c => c.type === 'Theory');
  const practicalCourses = facultyCourses.filter(c => c.type === 'Practical');
  const facultyClasses = [...new Set(facultyCourses.flatMap(c => c.classes))];
  const totalStudents = getStudents().filter(s => facultyClasses.includes(s.class)).length;

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
            <CardTitle className="text-sm font-medium">Your Department</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.department}</div>
            <p className="text-xs text-muted-foreground">Your primary department</p>
          </CardContent>
        </Card>
      </div>

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
            <Tabs defaultValue="theory">
                <TabsList className="mb-4">
                    <TabsTrigger value="theory">Theory</TabsTrigger>
                    <TabsTrigger value="practical">Practical</TabsTrigger>
                </TabsList>
                <TabsContent value="theory">
                    <CourseGrid courses={theoryCourses} />
                </TabsContent>
                <TabsContent value="practical">
                    <CourseGrid courses={practicalCourses} />
                </TabsContent>
            </Tabs>
        </CardContent>
       </Card>
    </>
  );
}

function CourseGrid({ courses }: { courses: Course[] }) {
    if (courses.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No courses found.</div>
    }
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
             <Image
                src={`https://placehold.co/600x400.png`}
                alt={course.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint="education textbook"
              />
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.courseCode}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex flex-wrap gap-1 mb-2">
                  {course.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/courses/${course.id}`}>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
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

  const studentCourses = courses.filter(c => c.classes.includes(user.class || ''));
  
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
