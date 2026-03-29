import React from 'react';
import type { Notification } from '@/types/database';

export default function NotificationsBar({ notifications }: { notifications: Notification[] }) {
  if (!notifications || notifications.length === 0) return null;

  // Show only the featured notification
  const featured = notifications.find((n) => n.is_featured);
  if (!featured) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E7EB]">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#111827]">{featured.title}</h4>
          <span className="text-xs text-[#6B7280]">{new Date(featured.created_at).toLocaleDateString('vi-VN')}</span>
        </div>
        {featured.description && <p className="text-sm text-[#6B7280] mt-1">{featured.description}</p>}
      </div>
    </div>
  );
}
