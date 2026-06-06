'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service in real prod
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="text-6xl md:text-8xl font-display font-bold text-red-500">!</div>
      <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600 max-w-md">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-slate-800 font-medium hover:border-primary-300"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
