
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getCourses, saveCourses, getUsers } from '@/lib/data';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const courseSchema = z.object({
  name: z.string().min(3, { message: 'Course name must be at least 3 characters.' }),
  courseCode: z.string().min(3, { message: 'Course code must be at least 3 characters.' }),
  class: z.string().min(2, { message: 'Class must be at least 2 characters.' }),
  totalLectures: z.coerce.number().int().min(1, { message: 'Total lectures must be at least 1.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  type: z.enum(['Theory', 'Practical'], { required_error: 'You must select a course type.' }),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: '',
      courseCode: '',
      class: '',
      totalLectures: 40,
      description: '',
    },
  });
  
  const facultyUser = getUsers().find(u => u.id === user?.id);

  const onSubmit = (data: CourseFormValues) => {
    setIsLoading(true);
    if (!facultyUser) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not find faculty user information.',
        });
        setIsLoading(false);
        return;
    }

    try {
      const courses = getCourses();
      const newCourse: Course = {
        id: `course${courses.length + 1}`,
        facultyId: facultyUser.id,
        facultyName: facultyUser.name,
        ...data,
      };

      const updatedCourses = [...courses, newCourse];
      saveCourses(updatedCourses);

      toast({
        title: 'Course Created',
        description: `The course "${data.name}" has been successfully created.`,
      });
      router.push('/courses');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (user?.role !== 'faculty') {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <p>You are not authorized to view this page.</p>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Fill out the form below to create a new course.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Advanced Algorithms" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="courseCode"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Code</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., CS501" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., BE CSE A" {...field} />
                            </FormControl>
                             <FormDescription>
                                Which class is this course for?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="totalLectures"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Lectures</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a course type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Theory">Theory</SelectItem>
                                <SelectItem value="Practical">Practical</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="A brief description of the course..."
                            className="resize-none"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
