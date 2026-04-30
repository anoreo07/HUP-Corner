'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import cn from '@core/utils/class-names';

const navItems = [
  { name: 'Trang chủ', href: '/home', icon: 'home' },
  { name: 'Tài liệu', href: '/all-majors', icon: 'description' },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-full flex-col p-6 space-y-4 bg-[#eff4ff] dark:bg-slate-950 h-screen w-56 z-40',
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

      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 font-plus-jakarta font-medium text-sm tracking-wide transition-transform duration-200 hover:translate-x-1 rounded-[2rem]',
                isActive
                  ? 'bg-white dark:bg-slate-900 text-[#3355c9] dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 bg-white/50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-primary-container"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="text-on-surface font-bold text-sm">
              {user?.name || 'Khách'}
            </p>
            <p className="text-xs text-slate-500">Premium Member</p>
          </div>
        </div>
        <Link
          href="/feedback"
          className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-sm">rate_review</span>
          Viết góp ý
        </Link>
      </div>
    </nav>
  );
}
