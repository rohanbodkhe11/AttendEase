
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, getStudentsForCourse, saveStudentsForCourse, getAttendance } from '@/lib/data';
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
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';
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


  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    setPastAttendance(getAttendance());
    setCourseStudents(getStudentsForCourse(course.id));
    
    // Set default lecture date to today
    const now = new Date();
    setLectureDate(now.toISOString().split('T')[0]);
    setLectureTimeSlot('');

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
    toast({
      title: "Attendance Submitted",
      description: `Attendance for ${course?.name} has been saved.`,
    })
    console.log("Submitted Attendance:", Array.from(currentAttendance.entries()));
    // Here you would typically send the data to your backend
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
            <Button onClick={handleSubmit} disabled={currentAttendance.size === 0 || courseStudents.length === 0}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddStudentsDialog({ course, onStudentsAdded }: { course: Course, onStudentsAdded: (students: Student[]) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [studentInput, setStudentInput] = useState('');
    const { toast } = useToast();

    const handleAdd = () => {
        const lines = studentInput.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No input provided',
                description: 'Please enter student roll numbers and names.'
            });
            return;
        }

        const newStudents: Student[] = [];
        const existingStudents = getStudentsForCourse(course.id);

        for (const line of lines) {
            const parts = line.split(/[\s,]+/); // Split by space or comma
            if (parts.length < 2) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid Format',
                    description: `The line "${line}" is not in the correct format (RollNumber Name).`
                });
                return;
            }
            const rollNumber = parts[0];
            const name = parts.slice(1).join(' ');

            if(existingStudents.some(s => s.rollNumber === rollNumber)) {
                toast({
                    variant: 'destructive',
                    title: 'Student Already Exists',
                    description: `Student with roll number ${rollNumber} is already in this course.`
                });
                return;
            }
            
            newStudents.push({
                id: `student-${course.id}-${rollNumber}`,
                rollNumber,
                name,
                class: course.class
            });
        }
        
        onStudentsAdded(newStudents);
        toast({
            title: 'Students Added',
            description: `${newStudents.length} student(s) have been added to the course.`
        });
        setStudentInput('');
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><UserPlus className="mr-2" /> Add Students</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Students to {course.name}</DialogTitle>
                    <DialogDescription>
                        Enter student details below, one student per line.
                        Format: RollNumber Name (e.g., S01 John Doe)
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="S01 John Doe
S02 Jane Smith
S03 Peter Jones"
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        className="h-48"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Students</Button>
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
