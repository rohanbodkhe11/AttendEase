
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCourses } from "@/lib/data";
import type { Course } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { ArrowRight, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
        {user?.role === 'faculty' && (
            <Button onClick={() => router.push('/courses/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Course
            </Button>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
             <Image
                src={`https://placehold.co/600x400.png`}
                alt={course.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint="education textbook"
              />
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.courseCode} - {course.class}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/courses/${course.id}`}>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
