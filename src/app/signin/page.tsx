import { redirect } from 'next/navigation';

export default function SignInPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const qs = searchParams ? new URLSearchParams(searchParams).toString() : '';
  const dest = `/admin/login${qs ? `?${qs}` : ''}`;
  redirect(dest);
}
