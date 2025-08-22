
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceReports } from "@/lib/data";
import type { AttendanceReport } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { format } from 'date-fns';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AttendanceReport[]>([]);

  useEffect(() => {
    if (user?.role === 'faculty') {
        // In a real app, you'd filter by faculty ID on the backend
        setReports(getAttendanceReports().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [user]);

  if (user?.role !== 'faculty') {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>You are not authorized to view this page.</p>
        </div>
    )
  }

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
