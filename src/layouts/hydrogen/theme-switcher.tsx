'use client';

import { useTheme } from 'next-themes';
import { Popover, ActionIcon } from 'rizzui';
import { useEffect, useState } from 'react';
import cn from '@core/utils/class-names';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Popover placement="bottom-end">
      <Popover.Trigger>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-100 text-slate-500 shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-gray-200 transition-all active:scale-95"
          aria-label="Toggle Theme"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </Popover.Trigger>
      <Popover.Content className="p-2 bg-white dark:bg-gray-50 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl min-w-[200px] z-[9999]">
        <div className="flex flex-col gap-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Giao diện
          </p>
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium',
              theme === 'light'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            <span className="material-symbols-outlined text-lg">light_mode</span>
            Chế độ sáng
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium',
              theme === 'dark'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            <span className="material-symbols-outlined text-lg">dark_mode</span>
            Chế độ tối
          </button>
        </div>
      </Popover.Content>
    </Popover>
  );
}
