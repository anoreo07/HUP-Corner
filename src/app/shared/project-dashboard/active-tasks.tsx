'use client';

import cn from '@core/utils/class-names';
import { Avatar, Text, Tooltip } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import DropdownAction from '@core/components/charts/dropdown-action';
import {
  activeTaskMonths,
  activeTasksData,
  activeTaskViewOptions,
} from '@/data/project-dashboard';
import SimpleBar from 'simplebar-react';

export default function ProjectActiveTasks({
  className,
}: {
  className?: string;
}) {
  function handleChange(viewType: string) {}

  return (
    <WidgetCard
      title="Active Task"
      action={
        <DropdownAction
          onChange={handleChange}
          dropdownClassName="!z-0"
          className="rounded-md border"
          options={activeTaskViewOptions}
        />
      }
      className={cn('overflow-hidden dark:bg-gray-100/50', className)}
    >
      <SimpleBar className="mt-6">
        <div className="min-w-[900px] space-y-2">
          {activeTasksData.map((task, index) => (
            <div
              key={index}
              className="group grid grid-cols-[120px_1fr] gap-2 text-center"
            >
              <div className="rounded-md bg-gray-100 px-2 py-3 group-hover:bg-gray-200">
                <Text className="text-gray-500">{task.title}</Text>
              </div>
              <div className="grid grid-cols-12 gap-1 rounded-md bg-gray-50 group-hover:bg-[#6CA787]/10 dark:bg-gray-100">
                <Tooltip
                  placement="top"
                  className="p-0"
                  arrowClassName="fill-gray-0 dark:fill-gray-200"
                  content={<TooltipContent />}
                >
                  <div
                    className="flex h-full w-full items-center justify-center rounded-md bg-[#6CA787]"
                    style={{
                      gridColumnStart: task.start,
                      gridColumnEnd: task.end,
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[120px_1fr] gap-1 text-center">
            <div />
            <div className="mt-2 grid grid-cols-12 gap-1 text-center">
              {activeTaskMonths.map((month, index) => (
                <Text key={index} className="text-gray-500">
                  {month}
                </Text>
              ))}
            </div>
          </div>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}

function TooltipContent() {
  return (
    <div className="rounded-md bg-gray-0 px-4 py-3 text-start text-gray-700 dark:bg-gray-200">
      <div className="mb-3 flex items-center gap-3">
        <Avatar
          size="sm"
          name="John Doe"
          className="ring-2 ring-blue ring-offset-2"
          src="https://randomuser.me/api/portraits/women/40.jpg"
        />
        <div>
          <Text className="text-base font-semibold">Fred Chaparro</Text>
          <Text className="text-sm">@fredchaparro</Text>
        </div>
      </div>
      <div className="max-w-[240px] text-sm">
        <Text>Data Analyst, love to work with isomorphic 🎉 </Text>
        <div className="mt-3 inline-flex gap-3">
          <Text>
            <Text as="span" className="font-medium">
              80%
            </Text>{' '}
            Done
          </Text>
          <Text>
            <Text as="span" className="font-medium">
              20%
            </Text>{' '}
            In Progress
          </Text>
        </div>
      </div>
    </div>
  );
}
