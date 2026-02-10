'use client';

import Link from 'next/link';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import Logo from '@core/components/logo';
import HeaderMenuRight from '@/layouts/header-menu-right';
import StickyHeader from '@/layouts/sticky-header';
import SearchWidget from '@/app/shared/search/search';
import { Button } from 'rizzui';
import { PiUploadSimpleBold } from 'react-icons/pi';

export default function Header() {
  return (
    <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
      <div className="flex w-full flex-1 items-center gap-4">
        <HamburgerButton
          view={<Sidebar className="static w-full 2xl:w-full" />}
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
        >
          <Logo iconOnly={true} />
        </Link>

        <div className="flex-1">
          <SearchWidget className="w-full xl:max-w-none" />
        </div>

        <Link href="/upload" className="me-4">
          <Button className="flex items-center gap-2">
            <PiUploadSimpleBold className="h-5 w-5" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </Link>
      </div>

      <HeaderMenuRight />
    </StickyHeader>
  );
}
