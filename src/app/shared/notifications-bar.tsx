import React from 'react';
import type { Notification } from '@/types/database';

export default function NotificationsBar({ notifications }: { notifications: Notification[] }) {
  if (!notifications || notifications.length === 0) return null;

  // show the latest notification (or map multiple)
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E7EB]">
      {notifications.map((n) => (
        <div key={n.id} className="mb-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#111827]">{n.title}</h4>
            <span className="text-xs text-[#6B7280]">{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
          {n.description && <p className="text-sm text-[#6B7280] mt-1">{n.description}</p>}
        </div>
      ))}
    </div>
  );
}
