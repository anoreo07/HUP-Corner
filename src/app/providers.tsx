'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import { JotaiProvider, ThemeProvider } from '@/app/shared/theme-provider';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';

export function Providers({ 
  children, 
  session 
}: { 
  children: React.ReactNode; 
  session: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider session={session}>
      <ThemeProvider>
        <JotaiProvider>
          {children}
          {mounted && (
            <>
              <Toaster />
              <GlobalDrawer />
              <GlobalModal />
            </>
          )}
        </JotaiProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
