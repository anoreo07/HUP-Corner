'use client';

import { useEffect, useState } from 'react';
import { GuideDrawer } from '@/app/shared/guide-drawer';
import { usePathname } from 'next/navigation';

interface HydrogenLayoutClientProps {
  children: React.ReactNode;
}

export default function HydrogenLayoutClient({ children }: HydrogenLayoutClientProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if guide drawer should be opened via anchor
    const handleAnchorClick = () => {
      if (window.location.hash === '#guide') {
        setIsGuideOpen(true);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleAnchorClick);
    
    // Check on mount
    handleAnchorClick();

    return () => window.removeEventListener('hashchange', handleAnchorClick);
  }, []);

  return (
    <>
      {children}
      <GuideDrawer isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
