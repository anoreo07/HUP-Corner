import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { siteConfig, metaObject } from '@/config/site.config';
import { inter, lexendDeca, plusJakartaSans } from '@/app/fonts';
import cn from '@core/utils/class-names';
import { Providers } from '@/app/providers';

// styles
import 'swiper/css';
import 'swiper/css/navigation';
import '@/app/globals.css';

export const metadata = metaObject();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html
      lang="en"
      dir="ltr"
      // required this one for next-themes, remove it if you are not using next-theme
      suppressHydrationWarning
    >
      <body
        className={cn(inter.variable, lexendDeca.variable, plusJakartaSans.variable, 'font-inter')}
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
