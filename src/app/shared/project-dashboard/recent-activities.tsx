'use client';

import { projectRecentActivitiesData } from '@/data/project-dashboard';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { Tab, Text } from 'rizzui';
import SimpleBar from 'simplebar-react';

export default function RecentActivities({
  className,
}: {
  className?: string;
}) {
  return (
    <WidgetCard
      title="Recent Activities"
      className={cn('dark:bg-gray-100/50', className)}
    >
      <Tab className="mt-4">
        <Tab.List className="grid w-full grid-cols-2 gap-0">
          <Tab.ListItem className="justify-center py-4">Activity</Tab.ListItem>
          <Tab.ListItem className="justify-center py-4">Update</Tab.ListItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <SimpleBar className="h-[505px] @[60rem]:h-[646px]">
              <ActivityCard />
            </SimpleBar>
          </Tab.Panel>
          <Tab.Panel>
            <SimpleBar className="h-[505px] @[60rem]:h-[646px]">
              <ActivityCard />
            </SimpleBar>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
    </WidgetCard>
  );
}

function ActivityCard() {
  return (
    <div className="space-y-2 p-0.5">
      {projectRecentActivitiesData.map((activity) => (
        <div
          key={activity.id}
          className="group cursor-pointer space-y-1 rounded-lg bg-gray-50 p-4 transition-shadow hover:shadow dark:bg-gray-100"
        >
          <div className="flex items-center justify-between">
            <Text className="font-semibold group-hover:underline">
              {activity.title}
            </Text>
            <Text className="text-gray-400">{activity.date}</Text>
          </div>
          <Text className="text-gray-400">{activity.activity}</Text>
        </div>
      ))}
    </div>
  );
}
