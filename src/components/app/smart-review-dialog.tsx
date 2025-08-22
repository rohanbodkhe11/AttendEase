
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAttendanceSuggestions } from '@/ai/flows/smart-review';
import type { AttendanceReviewInput, AttendanceReviewOutput } from '@/ai/flows/smart-review';
import { Sparkles, Loader2 } from 'lucide-react';
import { getStudents } from '@/lib/data';
import type { Student } from '@/lib/types';


interface SmartReviewDialogProps {
  input: AttendanceReviewInput | null;
}

export function SmartReviewDialog({ input }: SmartReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AttendanceReviewOutput | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen) {
        setStudents(getStudents());
    }
  }, [isOpen]);

  const handleReview = async () => {
    if (!input) return;
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await getAttendanceSuggestions(input);
      setSuggestions(result);
    } catch (error) {
      console.error("Smart review failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown Student';
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Smart Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI-Powered Attendance Review</DialogTitle>
          <DialogDescription>
            Let our AI assistant review the current attendance for potential errors based on historical data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Analyzing attendance...</p>
            </div>
          ) : suggestions ? (
            suggestions.suggestions.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Suggestion</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suggestions.suggestions.map((s, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{getStudentName(s.studentId)}</TableCell>
                                <TableCell>
                                    <Badge variant={s.suggestedPresence ? "default" : "destructive"}>
                                        Mark as {s.suggestedPresence ? 'Present' : 'Absent'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{s.reason}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>Looks good! No potential issues found.</p>
                </div>
            )
          ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>Click "Run Review" to get AI-powered suggestions.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handleReview} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Running...</> : 'Run Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
