
import { getCourses } from '@/lib/data';
import { notFound } from 'next/navigation';
import CourseDetailContent from './course-detail-content';

// This is the Server Component that fetches data
export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const courseId = params.courseId;
  const courses = getCourses();
  const course = courses.find(c => c.id === courseId);

  // If the course doesn't exist, show a 404 page.
  if (!course) {
    notFound();
  }

  // Pass the validated course to the client component.
  return <CourseDetailContent initialCourse={course} />;
}
