import TicketsTable from '@/app/shared/support/dashboard/tickets/table';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';

interface IndexProps {
  className?: string;
}

export default function PendingShipments({ className }: IndexProps) {
  return (
    <WidgetCard
      title="Tickets"
      description="Summary of the tickets that has been assigned to you...."
      descriptionClassName="mb-6 mt-2"
      className={cn(className)}
    >
      <TicketsTable />
    </WidgetCard>
  );
}
