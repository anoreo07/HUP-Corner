'use client';

import Link from 'next/link';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import SearchWidget from '@/app/shared/search/search';
import cn from '@core/utils/class-names';
import { useUploadModal } from '@/hooks/use-upload-modal';
import HeaderUploadProgress from './header-upload-progress';

export default function Header({ className }: { className?: string }) {
  const { openModal } = useUploadModal();

  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 py-4 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-[0px_20px_40px_rgba(13,52,89,0.06)] md:pl-80',
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <HamburgerButton
          view={<Sidebar className="static w-full 2xl:w-full" />}
          className="md:hidden p-2 hover:bg-surface-container-high rounded-full transition-all"
        />
        
        <div className="relative w-full max-w-md hidden sm:block">
          <SearchWidget className="w-full xl:max-w-none" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={openModal}
          className="bg-gradient-to-br from-blue-600 to-indigo-400 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          <span>Upload</span>
        </button>
        <HeaderUploadProgress />
        <button className="p-2 text-slate-500 hover:bg-surface-container-high rounded-full transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="sm:hidden p-2 text-slate-500 hover:bg-surface-container-high rounded-full transition-all">
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </header>
  );
}
