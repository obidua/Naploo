import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Apply | Naploo Partnership & Investment",
  description: "Apply to become a Naploo partner or investor. Submit your application and track its status.",
  keywords: "naploo partner application, investor application, naploo franchise",
  openGraph: {
    title: "Apply | Naploo Partnership & Investment",
    description: "Submit your partner or investor application to join the Naploo network.",
    url: "https://naploo.com/apply",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/apply" },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
