import Image from 'next/image';

interface IconProps {
  iconOnly?: boolean;
  className?: string;
}

export default function Logo({ iconOnly = false, className }: IconProps) {
  return (
    <Image
      src="/logo-512.png"
      alt="HUP Corner Logo"
      width={iconOnly ? 40 : 155}
      height={iconOnly ? 40 : 40}
      className={className}
      priority
    />
  );
}
