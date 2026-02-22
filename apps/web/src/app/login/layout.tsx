import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login to Naploo | Access Your Account",
  description: "Sign in to your Naploo account. Manage bookings, view history, earn rewards. Quick OTP-based login.",
  keywords: "naploo login, sign in naploo, naploo account",
  openGraph: {
    title: "Login to Naploo | Access Your Account",
    description: "Sign in to your Naploo account. Manage bookings, view history, earn rewards.",
    url: "https://naploo.com/login",
    siteName: "Naploo",
    type: "website",
  },
  alternates: { canonical: "https://naploo.com/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
