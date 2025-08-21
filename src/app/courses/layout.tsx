import MainLayout from '@/components/app/main-layout';

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
