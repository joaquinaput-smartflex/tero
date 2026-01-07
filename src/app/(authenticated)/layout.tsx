'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext will redirect to login
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
