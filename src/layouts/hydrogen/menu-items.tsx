import {
  PiHouseDuotone,
  PiFlaskDuotone,
  PiDnaDuotone,
  PiFirstAidKitDuotone,
  PiSquaresFourDuotone,
  PiAtomDuotone,
  PiChatTextDuotone,
  PiNoteDuotone,
  PiQuestionDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendered as a label
export const menuItems = [
  {
    name: 'Trang chủ',
    href: '/home',
    icon: <PiHouseDuotone className="text-blue-500" />,
  },
  {
    name: 'NGÀNH HỌC',
  },
  {
    name: 'Tất cả',
    href: '/all-majors',
    icon: <PiSquaresFourDuotone className="text-indigo-500" />,
  },
  {
    name: 'Hoá dược',
    href: '/pharmaceutical-chemistry',
    icon: <PiFlaskDuotone className="text-purple-500" />,
  },
  {
    name: 'Công nghệ sinh học',
    href: '/biotechnology',
    icon: <PiDnaDuotone className="text-green-500" />,
  },
  {
    name: 'Hoá học',
    href: '/chemistry',
    icon: <PiAtomDuotone className="text-orange-500" />,
  },
  {
    name: 'Dược học',
    href: '/pharmacology',
    icon: <PiFirstAidKitDuotone className="text-red-500" />,
  },
  {
    name: 'TÀI LIỆU',
  },
  {
    name: 'Tài liệu khác',
    href: '/other-documents',
    icon: <PiNoteDuotone className="text-pink-500" />,
  },
  {
    name: 'GÓP Ý',
  },
  {
    name: 'Viết Góp Ý',
    href: '/feedback',
    icon: <PiChatTextDuotone className="text-teal-500" />,
  },
  {
    name: 'HƯỚNG DẪN',
  },
  {
    name: 'Cách sử dụng',
    href: '#guide',
    icon: <PiQuestionDuotone className="text-sky-500" />,
  },
];
