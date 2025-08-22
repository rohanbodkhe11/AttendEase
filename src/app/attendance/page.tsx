
"use client";

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, getStudentsForCourse, saveStudentsForCourse, getAttendance, saveAttendanceReport, getStudentsByClass, saveCourses } from '@/lib/data';
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
import * as XLSX from 'xlsx';


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
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const facultyClasses = [...new Set(courses.flatMap(c => c.classes))];

    const coursesForClass = courses.filter(c => c.classes.includes(selectedClass || ''));

    const selectedCourse = coursesForClass.find(c => c.id === selectedCourseId);
    
    useEffect(() => {
        if (selectedCourseId && !courses.find(c => c.id === selectedCourseId)?.classes.includes(selectedClass || '')) {
          setSelectedCourseId(null);
        }
    }, [selectedClass, selectedCourseId, courses]);

    const handleStudentsImported = () => {
      // This is a bit of a hack to force a re-render of the child
      // In a real app, you'd use a more robust state management solution
      const currentCourseId = selectedCourseId;
      setSelectedCourseId(null); 
      setTimeout(() => setSelectedCourseId(currentCourseId), 0);
    }

    return (
         <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <Label htmlFor="class-select">Select Class</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass || ""}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyClasses.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course-select">Select Course</Label>
                <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ""} disabled={!selectedClass}>
                    <SelectTrigger id="course-select">
                    <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                    {coursesForClass.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                        {course.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCourse && selectedClass && (
                <AttendanceContent course={selectedCourse} selectedClass={selectedClass} onStudentsImported={handleStudentsImported} />
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


function AttendanceContent({ course, selectedClass, onStudentsImported }: { course: Course, selectedClass: string, onStudentsImported: () => void }) {
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const [pastAttendance, setPastAttendance] = useState<AttendanceRecordType[]>([]);
  const [lectureDate, setLectureDate] = useState('');
  const [lectureTimeSlot, setLectureTimeSlot] = useState('');
  const router = useRouter();


  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    setPastAttendance(getAttendance());
    setClassStudents(getStudentsByClass(selectedClass));
    
    const now = new Date();
    setLectureDate(now.toISOString().split('T')[0]);
    setLectureTimeSlot('');
    setCurrentAttendance(new Map());

  }, [course, selectedClass]);


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
     if(!lectureDate || !lectureTimeSlot) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a date and time slot for the lecture.',
      });
      return;
    }

    const attendanceArray = classStudents.map(student => ({
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
        class: selectedClass,
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
        id: '',
        class: selectedClass
    }));

    return {
        currentAttendance: currentAttendanceForReview,
        pastAttendance: pastAttendance.filter(pa => pa.courseId === course.id),
        classInfo: `Course: ${course.name} (${course.courseCode}), Class: ${selectedClass}`
    };
  }
  
  const timeSlots = course.type === 'Theory' ? theoryTimeSlots : practicalTimeSlots;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                  Class: {selectedClass} | Course Code: {course.courseCode}
              </CardDescription>
            </div>
            <ImportStudentsDialog course={course} selectedClass={selectedClass} onStudentsImported={onStudentsImported} />
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
        {classStudents.length > 0 ? (
          <AttendanceSheet
            students={classStudents}
            attendance={currentAttendance}
            onAttendanceChange={handleAttendanceChange}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No students found for class {selectedClass}.</p>
            <p className="text-sm">You can import students using the button above.</p>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
            {currentAttendance.size > 0 && <SmartReviewDialog input={getSmartReviewInput()} />}
            <Button onClick={handleSubmit} disabled={classStudents.length === 0}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ImportStudentsDialog({ course, selectedClass, onStudentsImported }: { course: Course, selectedClass: string, onStudentsImported: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please select an Excel file to import.' });
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<{ rollNumber: string, name: string }>(worksheet);

                if (json.length > 0 && 'rollNumber' in json[0] && 'name' in json[0]) {
                    const allCourses = getCourses();
                    const courseToUpdate = allCourses.find(c => c.id === course.id);
                    if (courseToUpdate) {
                       // This is a placeholder for proper student management.
                       // In a real app, you would have a separate student database and link students to courses.
                       // For this prototype, we'll just log the imported students.
                        console.log("Imported Students for course " + course.name + ":", json);

                        toast({
                            title: 'Import Successful',
                            description: `${json.length} students have been prepared for import. In a real app, they would be saved now.`,
                        });
                        onStudentsImported();
                        setIsOpen(false);
                        setFile(null);
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Invalid File Format', description: 'The Excel file must have "rollNumber" and "name" columns.' });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error Reading File', description: 'There was a problem processing the Excel file.' });
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Students
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Students for {course.name}</DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx) file with student information. Ensure the file has columns named "rollNumber" and "name".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="student-file">Excel File</Label>
                    <Input id="student-file" type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || isImporting}>
                        {isImporting ? 'Importing...' : 'Import'}
                    </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
