import { redirect } from 'next/navigation';

export default function LegacyPodDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/property/${params.id}`);
}
