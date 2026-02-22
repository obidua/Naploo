import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign Up for Naploo | Create Your Account",
  description: "Create your Naploo account in seconds. Get ₹100 welcome bonus. Book premium sleep pods across India.",
  keywords: "naploo signup, create naploo account, register naploo",
  openGraph: {
    title: "Sign Up for Naploo | Create Your Account",
    description: "Create your Naploo account in seconds. Get ₹100 welcome bonus.",
    url: "https://naploo.com/signup",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/signup" },
  robots: { index: false, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
