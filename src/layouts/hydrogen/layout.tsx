import Header from '@/layouts/hydrogen/header';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Footer from '@/layouts/hydrogen/footer';
import BottomNav from '@/layouts/hydrogen/bottom-nav';
import HydrogenLayoutClient from './layout-client';

export default function HydrogenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background text-on-surface">
      <Sidebar />
      <div className="flex w-full flex-col min-h-screen md:pl-56">
        <Header className="md:pl-10" />
        <div className="flex-grow pb-16 md:pb-0 px-6 md:px-10 pt-6">
          <HydrogenLayoutClient>{children}</HydrogenLayoutClient>
        </div>
        <Footer className="md:ml-0 px-6 md:px-10" />
      </div>
      <BottomNav />
    </main>
  );
}
