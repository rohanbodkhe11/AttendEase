import MainLayout from '@/components/app/main-layout';

export default function LecturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
