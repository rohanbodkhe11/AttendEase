
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceReports, getStudentAttendance } from "@/lib/data";
import type { AttendanceReport, Course, AttendanceRecord } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UserCheck, UserX } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ReportsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>Loading...</p>
        </div>
    )
  }

  if (user?.role === 'faculty') {
    return <FacultyReportsPage />;
  }

  if (user?.role === 'student') {
    return <StudentReportsPage />;
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>You are not authorized to view this page.</p>
    </div>
  )
}

function FacultyReportsPage() {
  const [reports, setReports] = useState<AttendanceReport[]>([]);

  useEffect(() => {
    // In a real app, you'd filter by faculty ID on the backend
    setReports(getAttendanceReports().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Attendance Reports</h2>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Submitted Reports</CardTitle>
            <CardDescription>View all the attendance reports you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
            {reports.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time Slot</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.courseName} ({report.courseCode})</TableCell>
                                <TableCell>{format(new Date(report.date), 'PPP')}</TableCell>
                                <TableCell>{report.timeSlot}</TableCell>
                                <TableCell>{report.class}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/reports/${report.id}`}>
                                            View Report <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Reports Found</h3>
                    <p className="mt-2 text-sm">You haven't submitted any attendance reports yet.</p>
                    <Button asChild className="mt-6">
                         <Link href="/attendance">Mark Attendance</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


function StudentReportsPage() {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<{ course: Course; records: AttendanceRecord[] }[]>([]);

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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Your Attendance Report</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Subject-wise Attendance</CardTitle>
                    <CardDescription>A detailed log of your attendance for each course.</CardDescription>
                </CardHeader>
                <CardContent>
                    {attendance.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {attendance.map(({ course, records }) => {
                                const percentage = calculateAttendancePercentage(records);
                                const presentCount = records.filter(r => r.isPresent).length;
                                const absentCount = records.length - presentCount;

                                return (
                                <AccordionItem value={course.id} key={course.id}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <div className="text-left">
                                                <p className="font-semibold">{course.name}</p>
                                                <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <UserCheck className="h-4 w-4" />
                                                    <span>{presentCount}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <UserX className="h-4 w-4" />
                                                    <span>{absentCount}</span>
                                                </div>
                                                <Badge className={percentage < 75 ? 'bg-destructive' : 'bg-green-500'}>
                                                    {percentage.toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {records.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                                                        <TableRow key={record.id}>
                                                            <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                                                            <TableCell>
                                                                {record.isPresent ? 
                                                                    <Badge className="bg-green-500 hover:bg-green-600">Present</Badge> : 
                                                                    <Badge variant="destructive">Absent</Badge>
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className="text-center text-muted-foreground py-4">No attendance has been recorded for this subject yet.</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                                )
                            })}
                        </Accordion>
                     ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">No Attendance Data Found</h3>
                            <p className="mt-2 text-sm">Your attendance has not been recorded for any courses yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
