'use client';

import { atom, useAtom, useSetAtom } from 'jotai';

export type DrawerPlacements = 'left' | 'right' | 'top' | 'bottom';

type DrawerTypes = {
  view: React.ReactNode;
  isOpen: boolean;
  placement: DrawerPlacements;
  containerClassName?: string;
  customSize?: string;
};

const drawerAtom = atom<DrawerTypes>({
  isOpen: false,
  view: null,
  placement: 'left',
  containerClassName: 'max-w-[320px]',
});

export function useDrawer() {
  const [state, setState] = useAtom(drawerAtom);

  const openDrawer = ({
    view,
    placement,
    containerClassName,
    customSize,
  }: {
    view: React.ReactNode;
    placement?: DrawerPlacements;
    containerClassName?: string;
    customSize?: string;
  }) => {
    setState({
      ...state,
      isOpen: true,
      view,
      placement: placement || 'left',
      containerClassName: containerClassName || 'max-w-[320px]',
      customSize,
    });
  };

  const closeDrawer = () => {
    setState({
      ...state,
      isOpen: false,
    });
  };

  return {
    ...state,
    openDrawer,
    closeDrawer,
  };
}
