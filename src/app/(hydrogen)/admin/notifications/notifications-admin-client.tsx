"use client";

import React, { useState } from 'react';
import { Notification } from '@/types/database';

export default function NotificationsAdminClient({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initial || []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title) return alert('Tiêu đề là bắt buộc');
    setLoading(true);
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, published }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      return alert(err?.error || 'Failed');
    }
    const data = await res.json();
    setNotifications((s) => [data, ...s]);
    setTitle('');
    setDescription('');
    setPublished(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Xoá thông báo này?')) return;
    const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('Failed to delete');
    setNotifications((s) => s.filter((n) => n.id !== id));
  };

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    });
    if (!res.ok) return alert('Failed to update');
    const updated = await res.json();
    setNotifications((s) => s.map((n) => (n.id === id ? updated : n)));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB]">
        <h3 className="text-lg font-semibold mb-2">Tạo thông báo</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" className="w-full mb-2 p-2 border rounded" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả" className="w-full mb-2 p-2 border rounded" />
        <div className="flex items-center gap-3 mb-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Công khai</label>
          <button onClick={create} disabled={loading} className="ml-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded inline-flex items-center gap-2">
            + Tạo
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 border border-[#E5E7EB]">
        <h3 className="text-lg font-semibold mb-3">Danh sách thông báo</h3>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start justify-between border-b pb-2">
              <div>
                <div className="text-sm font-medium text-[#111827]">{n.title}</div>
                {n.description && <div className="text-sm text-[#6B7280]">{n.description}</div>}
                <div className="text-xs text-[#6B7280]">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => togglePublish(n.id, (n as any).published)} className="text-sm px-2 py-1 bg-gray-100 rounded">{(n as any).published ? 'Đang hiển thị' : 'Ẩn'}</button>
                <button onClick={() => remove(n.id)} className="text-red-600"> 🗑 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
