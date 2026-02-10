'use client';

import { clientList } from '@/data/project-dashboard';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import Link from 'next/link';
import { Avatar, Button, Progressbar, Text } from 'rizzui';
import SimpleBar from 'simplebar-react';

export default function ProjectClientList({
  className,
}: {
  className?: string;
}) {
  return (
    <>
      <WidgetCard
        title="Client List"
        headerClassName="items-center"
        titleClassName="text-base lg:text-xl font-semibold"
        className={cn('dark:bg-gray-100/50', className)}
        action={
          <Link href={'#'}>
            <Button as="span" variant="text" className="h-auto p-0 underline">
              View All
            </Button>
          </Link>
        }
      >
        <SimpleBar className="mt-6 h-[28rem] w-full">
          <div className="space-y-3.5">
            {clientList.map((client) => (
              <div key={client.id}>
                <div className="space-y-2 rounded-lg border border-muted/50 px-4 py-3 @xl:flex @xl:items-center @xl:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={client.avatar} name={client.name} />
                    <div className="space-y-0.5">
                      <Text className="flex items-center gap-2 text-gray-700">
                        <strong>{client.name}</strong> {client.address}
                      </Text>
                      <Text>{client.workType}</Text>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 @xl:w-full @xl:max-w-40 @xl:shrink-0">
                    <Progressbar
                      value={client.workProgress}
                      className="w-full grow bg-primary/15"
                    />
                    <span>{client.workProgress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleBar>
      </WidgetCard>
    </>
  );
}
