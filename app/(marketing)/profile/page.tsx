'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function UserProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center items-center py-32 min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-[80vh] flex justify-center items-start">
      <Card className="w-full max-w-md shadow-lg border-gray-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">My Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
              Email Address
            </label>
            <p className="text-gray-900 font-medium text-[15px]">{user.email}</p>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
