"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Student } from "@/lib/types";
import { Button } from "../ui/button";

interface AttendanceSheetProps {
  students: Student[];
  attendance: Map<string, boolean>;
  onAttendanceChange: (studentId: string, isPresent: boolean) => void;
  onSelectAll: (isPresent: boolean) => void;
}

export function AttendanceSheet({ students, attendance, onAttendanceChange, onSelectAll }: AttendanceSheetProps) {
  const areAllPresent = students.length > 0 && students.every(student => attendance.get(student.id) === true);
  const isSomePresent = students.some(student => attendance.get(student.id) === true);

  const handleHeaderCheckboxChange = () => {
    onSelectAll(!areAllPresent);
  };

  return (
    <div className="rounded-md border">
        <div className="p-2 border-b">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onSelectAll(true)}>Mark All Present</Button>
                <Button variant="outline" size="sm" onClick={() => onSelectAll(false)}>Mark All Absent</Button>
            </div>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={areAllPresent}
                onCheckedChange={handleHeaderCheckboxChange}
                aria-label="Select all students"
              />
            </TableHead>
            <TableHead className="w-[100px]">Roll No.</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <Checkbox
                  checked={attendance.get(student.id) ?? false}
                  onCheckedChange={(checked) => onAttendanceChange(student.id, !!checked)}
                  aria-label={`Mark ${student.name} as present`}
                />
              </TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell className="font-medium">{student.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
