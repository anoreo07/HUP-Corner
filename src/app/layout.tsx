import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { siteConfig, metaObject } from '@/config/site.config';
import { inter, lexendDeca, plusJakartaSans } from '@/app/fonts';
import cn from '@core/utils/class-names';
import { Providers } from '@/app/providers';
import Script from 'next/script';


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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        // to prevent any warning that is caused by third party extensions like Grammarly
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, plusJakartaSans.variable, 'font-inter')}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2BPFT73L4Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2BPFT73L4Z');
          `}
        </Script>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
