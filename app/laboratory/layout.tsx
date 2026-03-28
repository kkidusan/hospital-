import LabLayout from '../components/lab/LabLayout';

export default function RootLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LabLayout>{children}</LabLayout>;
}