import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Footer from '@/layouts/hydrogen/footer';
import HydrogenLayoutClient from './layout-client';

export default function HydrogenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-on-surface">
      <Sidebar className="hidden md:flex fixed left-0 top-0 h-screen w-56 z-40 border-r border-slate-100 dark:border-slate-800" />
      <div className="flex w-full flex-col min-h-screen md:pl-56">
        <Header className="md:px-10" />
        <div className="flex-grow pb-8 px-6 md:px-10 pt-6">
          <HydrogenLayoutClient>{children}</HydrogenLayoutClient>
        </div>
        <Footer className="px-6 md:px-10" />
      </div>
    </main>
  );
}
