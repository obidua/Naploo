import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard | Naploo",
  description: "Naploo administration dashboard. Manage pods, bookings, users, tickets, and applications.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
