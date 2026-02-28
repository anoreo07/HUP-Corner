import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Redirect to the admin login page
  redirect('/admin/login');
}
