'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from '@core/utils/class-names';
import { useUploadModal } from '@/hooks/use-upload-modal';

const navItems = [
  { name: 'Trang chủ', href: '/home', icon: 'home' },
  { name: 'Khám phá', href: '/all-majors', icon: 'explore' },
  { name: 'Upload', href: '/upload', icon: 'add', isCenter: true },
  { name: 'Lưu trữ', href: '/other-documents', icon: 'bookmarks' },
  { name: 'Hồ sơ', href: '/profile', icon: 'person' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { openModal } = useUploadModal();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around py-2 px-6 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        if (item.isCenter) {
          return (
            <div key={item.name} className="relative -top-6">
              <button 
                onClick={openModal}
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40 border-4 border-white dark:border-slate-900"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
              </button>
            </div>
          );
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1',
              isActive ? 'text-primary' : 'text-slate-400'
            )}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span
              className={cn(
                'text-[10px]',
                isActive ? 'font-bold' : 'font-medium'
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
