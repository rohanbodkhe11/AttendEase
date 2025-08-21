import MainLayout from '@/components/app/main-layout';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
