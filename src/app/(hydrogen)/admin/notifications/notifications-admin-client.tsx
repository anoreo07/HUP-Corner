"use client";

import React, { useState } from 'react';
import { Notification } from '@/types/database';
import { Title, Button, ActionIcon, Badge, Loader } from 'rizzui';
import { toast } from 'react-hot-toast';
import { 
  PiMegaphoneBold, 
  PiTrashBold, 
  PiCheckCircleBold, 
  PiEyeSlashBold, 
  PiPaperPlaneTiltBold,
  PiCalendarBlankBold
} from 'react-icons/pi';
import cn from '@core/utils/class-names';

export default function NotificationsAdminClient({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initial || []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title) return toast.error('Tiêu đề là bắt buộc');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, published }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Không thể tạo thông báo');
      }
      const data = await res.json();
      setNotifications((s) => [data, ...s]);
      setTitle('');
      setDescription('');
      setPublished(true);
      toast.success('Đã đăng thông báo mới!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xoá thông báo này?')) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Không thể xoá thông báo');
      setNotifications((s) => s.filter((n) => n.id !== id));
      toast.success('Đã xoá thông báo');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !current }),
      });
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái');
      const updated = await res.json();
      setNotifications((s) => s.map((n) => (n.id === id ? updated : n)));
      toast.success(current ? 'Đã ẩn thông báo' : 'Đã công khai thông báo');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
      {/* Create Form */}
      <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm sticky top-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PiMegaphoneBold size={20} />
          </div>
          <Title as="h3" className="text-xl font-black text-slate-900 tracking-tight font-plus-jakarta">
            Tạo thông báo mới
          </Title>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Nhập tiêu đề ngắn gọn..." 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nội dung chi tiết</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Nhập nội dung thông báo hiển thị cho người dùng..." 
              rows={4}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300 resize-none" 
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={cn(
                "w-10 h-5 rounded-full relative transition-all duration-300",
                published ? "bg-emerald-500" : "bg-slate-200"
              )}>
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                  published ? "left-6" : "left-1"
                )} />
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={published} 
                  onChange={(e) => setPublished(e.target.checked)} 
                />
              </div>
              <span className="text-xs font-bold text-slate-600">Công khai ngay</span>
            </label>

            <Button 
              onClick={create} 
              disabled={loading} 
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg shadow-blue-100 gap-2"
            >
              {loading ? <Loader size="sm" color="current" /> : <PiPaperPlaneTiltBold size={18} />}
              Đăng ngay
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between px-4">
          <Title as="h3" className="text-lg font-black text-slate-900 tracking-tight font-plus-jakarta">
            Lịch sử thông báo
          </Title>
          <Badge variant="flat" color="info" className="rounded-full text-[10px] font-black tracking-widest">
            {notifications.length} TIN
          </Badge>
        </div>

        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className="group bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 leading-tight">{n.title}</span>
                    {!(n as any).published && (
                       <Badge color="danger" variant="flat" className="rounded-full text-[8px] h-4">ĐÃ ẨN</Badge>
                    )}
                  </div>
                  {n.description && <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.description}</p>}
                  <div className="flex items-center gap-3 mt-3">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <PiCalendarBlankBold />
                        {new Date(n.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionIcon
                    onClick={() => togglePublish(n.id, (n as any).published)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200"
                    title={(n as any).published ? 'Ẩn thông báo' : 'Hiện thông báo'}
                  >
                    {(n as any).published ? <PiEyeSlashBold size={16} /> : <PiCheckCircleBold size={16} />}
                  </ActionIcon>
                  <ActionIcon
                    onClick={() => remove(n.id)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                    title="Xoá vĩnh viễn"
                  >
                    <PiTrashBold size={16} />
                  </ActionIcon>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-200">
               <p className="text-sm font-bold text-slate-400">Chưa có thông báo nào được tạo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

