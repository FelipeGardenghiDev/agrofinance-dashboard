'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from './components/ui/Spinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}