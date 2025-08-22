
"use client";

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, getStudentsForCourse, saveStudentsForCourse, getAttendance, saveAttendanceReport } from '@/lib/data';
import type { Student, AttendanceRecord as AttendanceRecordType, Course } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AttendanceSheet } from '@/components/app/attendance-sheet';
import { SmartReviewDialog } from '@/components/app/smart-review-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, FileUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';


export default function AttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'faculty')) {
      router.push('/dashboard');
    }
    setAllCourses(getCourses());
  }, [user, authLoading, router]);

  const facultyCourses = allCourses.filter(c => c.facultyId === user?.id);
  const theoryCourses = facultyCourses.filter(c => c.type === 'Theory');
  const practicalCourses = facultyCourses.filter(c => c.type === 'Practical');

  if (authLoading || !user) {
    return <AttendancePageSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mark Attendance</h2>
      </div>

      <Tabs defaultValue="theory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="practical">Practical</TabsTrigger>
        </TabsList>
        <TabsContent value="theory">
            <AttendanceCourseSelector courses={theoryCourses} />
        </TabsContent>
        <TabsContent value="practical">
            <AttendanceCourseSelector courses={practicalCourses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceCourseSelector({ courses }: { courses: Course[] }) {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    
    useEffect(() => {
        if (courses.length > 0 && !courses.find(c => c.id === selectedCourseId)) {
          setSelectedCourseId(null);
        }
    }, [courses, selectedCourseId]);

    const handleCourseStudentsUpdate = (courseId: string, students: Student[]) => {
      // This is a bit of a hack to force a re-render of the child
      // In a real app, you'd use a more robust state management solution
      setSelectedCourseId(null); 
      setTimeout(() => setSelectedCourseId(courseId), 0);
    }

    return (
         <div className="space-y-4">
            <div className="max-w-sm">
            <Label htmlFor="course-select">Select Course</Label>
            <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ""}>
                <SelectTrigger id="course-select">
                <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.class}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            {selectedCourse && (
                <AttendanceContent course={selectedCourse} onStudentsUpdate={handleCourseStudentsUpdate} />
            )}
        </div>
    )
}

const theoryTimeSlots = [
    '10:15 - 11:15',
    '11:15 - 12:15',
    '1:15 - 2:15',
    '2:15 - 3:15',
    '3:30 - 4:30',
    '4:30 - 5:30'
];

const practicalTimeSlots = [
    '10:15 - 12:15',
    '1:15 - 3:15',
    '3:30 - 5:30'
];


function AttendanceContent({ course, onStudentsUpdate }: { course: Course, onStudentsUpdate: (courseId: string, students: Student[]) => void }) {
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const [pastAttendance, setPastAttendance] = useState<AttendanceRecordType[]>([]);
  const [lectureDate, setLectureDate] = useState('');
  const [lectureTimeSlot, setLectureTimeSlot] = useState('');
  const router = useRouter();


  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    setPastAttendance(getAttendance());
    setCourseStudents(getStudentsForCourse(course.id));
    
    // Set default lecture date to today
    const now = new Date();
    setLectureDate(now.toISOString().split('T')[0]);
    setLectureTimeSlot('');
    setCurrentAttendance(new Map());


  }, [course]);


  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setCurrentAttendance(prev => new Map(prev).set(studentId, isPresent));
  };

  const handleSelectAll = (isPresent: boolean) => {
    const newAttendance = new Map<string, boolean>();
    courseStudents.forEach(student => {
      newAttendance.set(student.id, isPresent);
    });
    setCurrentAttendance(newAttendance);
  };
  
  const handleSubmit = () => {
     if(!lectureDate || !lectureTimeSlot) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a date and time slot for the lecture.',
      });
      return;
    }

    const attendanceArray = courseStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        isPresent: currentAttendance.get(student.id) ?? false
    }));

    const report = {
        id: `rep-${Date.now()}`,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.courseCode,
        class: course.class,
        date: lectureDate,
        timeSlot: lectureTimeSlot,
        attendance: attendanceArray,
    };
    
    saveAttendanceReport(report);
    toast({
      title: "Attendance Submitted",
      description: `Attendance for ${course?.name} has been saved.`,
    })
    
    router.push(`/reports/${report.id}`);
  };

  const getSmartReviewInput = () => {
    if (!course || !lectureDate) return null;
    const currentAttendanceForReview: AttendanceRecordType[] = Array.from(currentAttendance.entries()).map(([studentId, isPresent]) => ({
        studentId,
        date: lectureDate,
        isPresent,
        courseId: course.id,
        id: ''
    }));

    return {
        currentAttendance: currentAttendanceForReview,
        pastAttendance: pastAttendance.filter(pa => pa.courseId === course.id),
        classInfo: `Course: ${course.name} (${course.courseCode}), Class: ${course.class}`
    };
  }

  const handleStudentsAdded = (newStudents: Student[]) => {
      const updatedStudents = [...courseStudents, ...newStudents];
      setCourseStudents(updatedStudents);
      saveStudentsForCourse(course.id, updatedStudents);
      onStudentsUpdate(course.id, updatedStudents);
  }

  const timeSlots = course.type === 'Theory' ? theoryTimeSlots : practicalTimeSlots;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                  Class: {course.class} | Course Code: {course.courseCode}
              </CardDescription>
            </div>
            <AddStudentsDialog course={course} onStudentsAdded={handleStudentsAdded} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <div>
              <Label htmlFor="lecture-date">Lecture Date</Label>
              <Input 
                id="lecture-date"
                type="date" 
                value={lectureDate}
                onChange={(e) => setLectureDate(e.target.value)}
              />
          </div>
          <div>
            <Label htmlFor="time-slot-select">Time Slot</Label>
            <Select onValueChange={setLectureTimeSlot} value={lectureTimeSlot}>
                <SelectTrigger id="time-slot-select">
                <SelectValue placeholder="Select a time slot..." />
                </SelectTrigger>
                <SelectContent>
                {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>
                    {slot}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {courseStudents.length > 0 ? (
          <AttendanceSheet
            students={courseStudents}
            attendance={currentAttendance}
            onAttendanceChange={handleAttendanceChange}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No students have been added to this course yet.</p>
            <p className="text-sm">Click the "Add Students" button to get started.</p>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
            {currentAttendance.size > 0 && <SmartReviewDialog input={getSmartReviewInput()} />}
            <Button onClick={handleSubmit} disabled={courseStudents.length === 0}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddStudentsDialog({ course, onStudentsAdded }: { course: Course, onStudentsAdded: (students: Student[]) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAdd = () => {
        if (!selectedFile) {
            toast({
                variant: 'destructive',
                title: 'No file selected',
                description: 'Please select an Excel file to upload.'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const newStudents: Student[] = [];
                const existingStudents = getStudentsForCourse(course.id);
                
                // Start from row 1 to skip header
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    if (!row || row.length < 2) continue;

                    const rollNumber = String(row[0]).trim();
                    const name = String(row[1]).trim();

                    if (!rollNumber || !name) continue;

                    if (existingStudents.some(s => s.rollNumber === rollNumber)) {
                        toast({
                            variant: 'destructive',
                            title: 'Student Already Exists',
                            description: `Student with roll number ${rollNumber} is already in this course. Skipping.`
                        });
                        continue; // Skip existing student
                    }

                    newStudents.push({
                        id: `student-${course.id}-${rollNumber}`,
                        rollNumber,
                        name,
                        class: course.class
                    });
                }
                
                if (newStudents.length > 0) {
                    onStudentsAdded(newStudents);
                    toast({
                        title: 'Students Added',
                        description: `${newStudents.length} new student(s) have been added to the course.`
                    });
                } else {
                     toast({
                        title: 'No New Students Added',
                        description: `All students from the file were already in the course or the file was empty.`
                    });
                }

                setSelectedFile(null);
                setIsOpen(false);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Parsing File',
                    description: 'Could not parse the Excel file. Please ensure it is in the correct format (RollNumber, Name) and not corrupted.'
                });
            }
        };

        reader.onerror = () => {
             toast({
                variant: 'destructive',
                title: 'Error Reading File',
                description: 'There was an error reading the selected file.'
            });
        }
        
        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><UserPlus className="mr-2" /> Add Students</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Students to {course.name}</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file (.xlsx, .xls) with student data.
                        Format: Column A should be Roll Number, Column B should be Name. The first row is assumed to be a header and will be skipped.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="student-file" className="sr-only">Student Excel File</Label>
                    <Input 
                        id="student-file"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />
                    {selectedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => { setIsOpen(false); setSelectedFile(null); }}>Cancel</Button>
                    <Button onClick={handleAdd} disabled={!selectedFile}><FileUp className="mr-2" /> Add from File</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function AttendancePageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
