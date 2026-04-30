import { PiCommand, PiMagnifyingGlassBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';

type SearchTriggerProps = {
  placeholderClassName?: string;
  icon?: React.ReactNode;
  lang?: string;
  t?: (key: string) => string | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SearchTrigger({
  icon,
  className,
  placeholderClassName,
  t,
  ...props
}: SearchTriggerProps) {
  return (
    <button
      aria-label="Search"
      className={cn(
        'group inline-flex items-center focus:outline-none active:scale-95 h-9 w-full max-w-[280px] rounded-full bg-slate-100/50 border border-transparent py-1.5 pe-2 ps-3.5 transition-all duration-200 hover:bg-white hover:border-slate-200 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {icon ? (
        icon
      ) : (
        <PiMagnifyingGlassBold className="me-2 h-4 w-4 text-slate-500" />
      )}
      <span
        className={cn(
          'hidden text-[13px] font-medium text-slate-500 group-hover:text-slate-900 sm:inline-flex',
          placeholderClassName
        )}
      >
        Tìm kiếm tài liệu...
      </span>
      <span className="ms-auto hidden items-center gap-0.5 text-[10px] text-slate-400 font-bold border border-slate-200 px-1.5 py-0.5 rounded-md lg:flex">
        <PiCommand size={12} />K
      </span>
    </button>
  );
}
