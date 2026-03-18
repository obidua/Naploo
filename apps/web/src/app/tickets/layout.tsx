import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Support Tickets | Naploo",
  description: "Create and track your support tickets. Get help with bookings, payments, pods, and more.",
  keywords: "naploo support, tickets, help, customer support",
  openGraph: {
    title: "Support Tickets | Naploo",
    description: "Create and track your support tickets with Naploo support team.",
    url: "https://naploo.com/tickets",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/tickets" },
};

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
