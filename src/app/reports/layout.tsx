import MainLayout from '@/components/app/main-layout';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
