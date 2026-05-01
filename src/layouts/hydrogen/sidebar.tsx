'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import cn from '@core/utils/class-names';

const navItems = [
  { name: 'Trang chủ', href: '/home', icon: 'home' },
  { name: 'Tài liệu', href: '/all-majors', icon: 'description' },
  { name: 'Góp ý', href: '/feedback', icon: 'rate_review' },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav
      className={cn(
        'flex h-full flex-col p-6 space-y-4 bg-surface-container-low dark:bg-gray-0',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-8 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="HUP Corner Logo" 
            width={120} 
            height={40} 
            className="h-auto w-32 dark:invert"
          />
        </Link>
      </div>

      <div className="grow space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 font-plus-jakarta font-medium text-sm tracking-wide transition-all duration-200 hover:translate-x-1 rounded-[2rem]',
                isActive
                  ? 'bg-white dark:bg-gray-50 text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-white/40 dark:hover:bg-gray-50/10'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

    </nav>
  );
}
