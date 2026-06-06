import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-slate-500">Loading…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
