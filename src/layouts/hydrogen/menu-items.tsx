import {
  PiHouseDuotone,
  PiFlaskDuotone,
  PiDnaDuotone,
  PiFirstAidKitDuotone,
  PiEyeDuotone,
  PiNotePencilDuotone,
  PiSquaresFourDuotone,
  PiAtomDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendered as a label
export const menuItems = [
  {
    name: 'Trang chủ',
    href: '/trang-chu',
    icon: <PiHouseDuotone />,
  },
  {
    name: 'NGÀNH HỌC',
  },
  {
    name: 'Tất cả',
    href: '/tat-ca',
    icon: <PiSquaresFourDuotone />,
  },
  {
    name: 'Hoá dược',
    href: '/hoa-duoc',
    icon: <PiFlaskDuotone />,
  },
  {
    name: 'Công nghệ sinh học',
    href: '/cong-nghe-sinh-hoc',
    icon: <PiDnaDuotone />,
  },
  {
    name: 'Hoá học',
    href: '/hoa-hoc',
    icon: <PiAtomDuotone />,
  },
  {
    name: 'Dược học',
    href: '/duoc-hoc',
    icon: <PiFirstAidKitDuotone />,
  },
  {
    name: 'ĐÁNH GIÁ GIẢNG VIÊN',
  },
  {
    name: 'Xem Đánh Giá',
    href: '/xem-danh-gia',
    icon: <PiEyeDuotone />,
  },
  {
    name: 'Viết Đánh Giá',
    href: '/viet-danh-gia',
    icon: <PiNotePencilDuotone />,
  },
];
