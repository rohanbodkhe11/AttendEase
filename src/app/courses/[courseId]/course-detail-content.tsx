
"use client";

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { getStudentsForCourse, getCourseAttendance, getCourses, saveCourses } from '@/lib/data';
import type { Course, Student, AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, X } from 'lucide-react';


export default function CourseDetailContent({ initialCourse }: { initialCourse: Course }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(initialCourse);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    setStudents(getStudentsForCourse(course.id));
    setAttendanceRecords(getCourseAttendance(course.id));
  }, [course]);
  
  const handleAttendanceChange = (recordId: string, newStatus: 'true' | 'false') => {
    setAttendanceRecords(prevRecords =>
      prevRecords.map(rec =>
        rec.id === recordId ? { ...rec, isPresent: newStatus === 'true' } : rec
      )
    );
  };
  
  const saveChanges = () => {
    // Here you would send 'attendanceRecords' to your backend to save.
    toast({
        title: "Changes Saved",
        description: `Attendance for ${course.name} has been updated.`,
    });
  }
  
  const getUniqueDates = () => {
    if (!attendanceRecords) return [];
    const dates = attendanceRecords.map(r => r.date);
    return [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }
  
  const handleClassesUpdated = (updatedCourse: Course) => {
    setCourse(updatedCourse);
  }

  if (authLoading || !user) {
    return <CourseDetailPageSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{course.name}</CardTitle>
              <CardDescription>
                {course.courseCode} | Taught by {course.facultyName}
              </CardDescription>
            </div>
            {user.role === 'faculty' && <ManageClassesDialog course={course} onClassesUpdated={handleClassesUpdated} />}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
              {course.classes.map(c => <Badge key={c}>{c}</Badge>)}
          </div>
          <p className="text-muted-foreground">{course.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>
              {user.role === 'faculty' ? "View and edit attendance for all students." : "Your attendance record for this course."}
            </CardDescription>
          </div>
          {user.role === 'faculty' && <Button onClick={saveChanges}>Save Changes</Button>}
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  {getUniqueDates().map(date => (
                    <TableHead key={date} className="text-center">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(user.role === 'faculty' ? students : students.filter(s => s.id === user.id)).map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name} ({student.rollNumber})</TableCell>
                    {getUniqueDates().map(date => {
                      const record = attendanceRecords.find(r => r.studentId === student.id && r.date === date);
                      return (
                        <TableCell key={`${student.id}-${date}`} className="text-center">
                          {user.role === 'faculty' ? (
                            <FacultyAttendanceCell record={record} onAttendanceChange={handleAttendanceChange} />
                          ) : (
                            <StudentAttendanceCell record={record} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students have been added to this course yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const years = ['FE', 'SE', 'TE', 'BE'];
const departments = ['CSE', 'IT', 'ENTC', 'Mech', 'Civil', 'AI & DS'];
const divisions = ['A', 'B', 'C', 'D'];

const classSchema = z.object({
  year: z.string({ required_error: 'Please select a year.' }),
  department: z.string({ required_error: 'Please select a department.' }),
  division: z.string({ required_error: 'Please select a division.' }),
});

const manageClassesSchema = z.object({
  classes: z.array(classSchema).min(1, { message: 'You must have at least one class.' }),
});

type ManageClassesFormValues = z.infer<typeof manageClassesSchema>;

function ManageClassesDialog({ course, onClassesUpdated }: { course: Course, onClassesUpdated: (course: Course) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const defaultValues = {
        classes: course.classes.map(c => {
            const parts = c.split(' ');
            return { year: parts[0], department: parts[1], division: parts[2] }
        })
    };

    const form = useForm<ManageClassesFormValues>({
        resolver: zodResolver(manageClassesSchema),
        defaultValues,
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "classes"
    });

    const onSubmit = (data: ManageClassesFormValues) => {
        try {
            const allCourses = getCourses();
            const updatedClasses = data.classes.map(c => `${c.year} ${c.department} ${c.division}`);
            const updatedCourse = { ...course, classes: updatedClasses };
            
            const newCourses = allCourses.map(c => c.id === course.id ? updatedCourse : c);
            saveCourses(newCourses);
            
            onClassesUpdated(updatedCourse);
            toast({
                title: "Classes Updated",
                description: "The list of classes for this course has been updated.",
            });
            setIsOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Something went wrong. Please try again.',
            });
        }
    }
    
    // Reset form when dialog is opened/closed
    useEffect(() => {
        form.reset(defaultValues);
    }, [isOpen, course]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Manage Classes</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Manage Classes for {course.name}</DialogTitle>
                    <DialogDescription>
                        Add or remove classes that this course is taught to.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name={`classes.${index}.year`}
                                        render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Year</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`classes.${index}.department`}
                                        render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Department</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`classes.${index}.division`}
                                        render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Division</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Select division" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ year: '', department: '', division: '' })}
                            >
                                <PlusCircle className="mr-2" />
                                Add Class
                            </Button>
                             <FormMessage>{form.formState.errors.classes?.message}</FormMessage>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function FacultyAttendanceCell({ record, onAttendanceChange } : { record: AttendanceRecord | undefined, onAttendanceChange: (recordId: string, status: 'true' | 'false') => void}) {
    if (!record) return <Badge variant="outline">N/A</Badge>;

    return (
        <Select
            defaultValue={record.isPresent ? 'true' : 'false'}
            onValueChange={(value: 'true' | 'false') => onAttendanceChange(record.id, value)}
        >
            <SelectTrigger className={`w-28 h-8 text-xs ${record.isPresent ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="true">Present</SelectItem>
                <SelectItem value="false">Absent</SelectItem>
            </SelectContent>
        </Select>
    );
}

function StudentAttendanceCell({ record } : { record: AttendanceRecord | undefined }) {
  if (!record) return <Badge variant="outline">N/A</Badge>;
  return record.isPresent ? 
    <Badge className="bg-green-500 hover:bg-green-600">Present</Badge> : 
    <Badge variant="destructive">Absent</Badge>;
}

function CourseDetailPageSkeleton() {
    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-9 w-3/5" />
                    <Skeleton className="h-5 w-4/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
         </div>
    )
}
