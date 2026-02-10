import HydrogenLayout from '@/layouts/hydrogen/layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  return <HydrogenLayout>{children}</HydrogenLayout>;
}
