import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '../src/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Palantir - Attendance Dashboard',
  description: 'Student Management & Attendance System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
