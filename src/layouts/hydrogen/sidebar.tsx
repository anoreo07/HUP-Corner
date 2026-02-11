'use client';

import Link from 'next/link';
import cn from '@core/utils/class-names';
import SimpleBar from '@core/ui/simplebar';
import Logo from '@core/components/logo';
import { SidebarMenu } from './sidebar-menu';

export default function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 bg-white px-6 pb-5 pt-5 2xl:px-8 2xl:pt-6">
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="flex justify-center text-gray-800 hover:text-gray-900"
        >
          <Logo className="max-w-[120px]" />
        </Link>
        <div className="mt-4 border-b border-gray-200 dark:border-gray-300" />
      </div>

      <SimpleBar className="h-[calc(100%-80px)]">
        <SidebarMenu />
      </SimpleBar>
    </aside>
  );
}
