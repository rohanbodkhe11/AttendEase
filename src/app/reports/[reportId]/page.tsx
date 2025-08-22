
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getAttendanceReportById } from '@/lib/data';
import type { AttendanceReport } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ReportDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<AttendanceReport | null | undefined>(undefined);

  useEffect(() => {
    if (reportId) {
      setReport(getAttendanceReportById(reportId));
    }
  }, [reportId]);
  
  if (authLoading || report === undefined) {
    return <ReportDetailSkeleton />;
  }
  
  if (report === null) {
     return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-2xl font-bold">Report Not Found</h2>
            <p>The report you are looking for does not exist.</p>
            <Button asChild>
                <Link href="/reports">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Link>
            </Button>
        </div>
     )
  }

  // A basic authorization check. In a real app, this would be more robust.
  if (user?.role !== 'faculty') {
     return <p>You are not authorized to view this page.</p>
  }
  
  const presentStudents = report.attendance.filter(a => a.isPresent).length;
  const absentStudents = report.attendance.length - presentStudents;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Report</h2>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>{report.courseName} - {report.courseCode}</CardTitle>
            <CardDescription>
                Attendance report for class <strong>{report.class}</strong> taken on <strong>{format(new Date(report.date), 'PPPP')}</strong> during the <strong>{report.timeSlot}</strong> time slot.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Badge variant="outline">{report.attendance.length}</Badge>
                </CardHeader>
             </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{presentStudents}</div>
                </CardContent>
             </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Absent</CardTitle>
                    <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{absentStudents}</div>
                </CardContent>
             </Card>
        </CardContent>
       </Card>

       <Card>
        <CardHeader>
            <CardTitle>Detailed List</CardTitle>
            <CardDescription>Status for each student in the lecture.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {report.attendance.map((att) => (
                        <TableRow key={att.studentId}>
                            <TableCell>{att.rollNumber}</TableCell>
                            <TableCell className="font-medium">{att.studentName}</TableCell>
                            <TableCell>
                                {att.isPresent ? 
                                    <Badge className="bg-green-500 hover:bg-green-600">Present</Badge> : 
                                    <Badge variant="destructive">Absent</Badge>
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}

function ReportDetailSkeleton() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-64" />
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}

