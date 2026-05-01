'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiMegaphoneFill, PiXBold } from 'react-icons/pi';
import { Notification } from '@/types/database';

interface AnnouncementBannerProps {
  notifications: Notification[];
}

export default function AnnouncementBanner({ notifications }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const dismissed = localStorage.getItem(`dismissed_announcement_${notifications[0].id}`);
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0 || !isVisible) return null;

  const current = notifications[currentIdx];

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`dismissed_announcement_${current.id}`, 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full px-4 mt-6"
      >
        <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-1 shadow-xl shadow-blue-200/20 dark:shadow-none">
          <div className="relative bg-white/5 backdrop-blur-sm rounded-[1.8rem] px-6 py-4 flex items-center justify-between text-white border border-white/10">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <PiMegaphoneFill className="h-5 w-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">Thông báo mới</p>
                <div className="flex items-center gap-2">
                   <h4 className="text-sm font-black tracking-tight truncate">{current.title}</h4>
                   <span className="w-1 h-1 rounded-full bg-white/40" />
                   <p className="text-xs font-medium text-white/80 truncate">{current.description}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
            >
              <PiXBold size={20} />
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
