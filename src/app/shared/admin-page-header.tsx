import { Title } from 'rizzui';
import cn from '@core/utils/class-names';

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  backButton?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  backButton,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', className)}>
      <div>
        <Title as="h2" className="text-xl md:text-2xl">
          {title}
        </Title>
        {description ? (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        ) : null}
      </div>
      {backButton ? <div className="shrink-0">{backButton}</div> : null}
    </header>
  );
}
