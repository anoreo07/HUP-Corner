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
    icon: <PiHouseDuotone className="text-blue-500" />,
  },
  {
    name: 'NGÀNH HỌC',
  },
  {
    name: 'Tất cả',
    href: '/tat-ca',
    icon: <PiSquaresFourDuotone className="text-indigo-500" />,
  },
  {
    name: 'Hoá dược',
    href: '/hoa-duoc',
    icon: <PiFlaskDuotone className="text-purple-500" />,
  },
  {
    name: 'Công nghệ sinh học',
    href: '/cong-nghe-sinh-hoc',
    icon: <PiDnaDuotone className="text-green-500" />,
  },
  {
    name: 'Hoá học',
    href: '/hoa-hoc',
    icon: <PiAtomDuotone className="text-orange-500" />,
  },
  {
    name: 'Dược học',
    href: '/duoc-hoc',
    icon: <PiFirstAidKitDuotone className="text-red-500" />,
  },
  {
    name: 'ĐÁNH GIÁ GIẢNG VIÊN',
  },
  {
    name: 'Xem Đánh Giá',
    href: '/xem-danh-gia',
    icon: <PiEyeDuotone className="text-cyan-500" />,
  },
  {
    name: 'Viết Đánh Giá',
    href: '/viet-danh-gia',
    icon: <PiNotePencilDuotone className="text-amber-500" />,
  },
];
