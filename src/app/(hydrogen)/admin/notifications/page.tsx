import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import NotificationsAdminClient from './notifications-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
  const notifications = (data || []) as any[];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý thông báo</h1>
      <NotificationsAdminClient initial={notifications} />
    </div>
  );
}
