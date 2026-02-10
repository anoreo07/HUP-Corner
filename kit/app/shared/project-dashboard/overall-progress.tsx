'use client';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WidgetCard from '@core/components/cards/widget-card';
import { useElementSize } from '@core/hooks/use-element-size';
import { Text } from 'rizzui';
import { useMedia } from '@core/hooks/use-media';
import DropdownAction from '@core/components/charts/dropdown-action';
import { useState } from 'react';
import cn from '@core/utils/class-names';
import {
  overAllProgressData,
  overAllProgressViewOptions,
} from '@/data/project-dashboard';

export default function OverallProgress({ className }: { className?: string }) {
  const [state, setState] = useState('');
  const [chartRef, { width }] = useElementSize();
  const isMobile = useMedia('(max-width: 639px)', false);
  const isManager = useMedia('(min-width: 1536px)', false);

  const config = {
    cx: width / 2,
    cy: 200,
    iR: isMobile ? 80 : isManager ? 100 : 130,
    oR: isMobile ? 100 : isManager ? 120 : 150,
  };

  return (
    <WidgetCard
      title="Overall Progress"
      headerClassName="items-center"
      className={cn(
        '@[61rem]:flex @[61rem]:flex-col @[61rem]:justify-between dark:bg-gray-100/50',
        className
      )}
      titleClassName="text-base lg:text-xl font-semibold"
      action={
        <DropdownAction
          className="rounded-md border"
          options={overAllProgressViewOptions}
          onChange={setState}
          dropdownClassName="!z-0"
        />
      }
    >
      <div ref={chartRef} className="relative h-60 w-full sm:h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="relative [&>.recharts-surface]:mx-auto [&>.recharts-surface]:max-w-md [&>.recharts-surface]:md:max-w-none">
            <Pie
              label
              data={overAllProgressData}
              endAngle={-10}
              stroke="none"
              cx={config.cx}
              cy={config.cy}
              startAngle={190}
              paddingAngle={1}
              cornerRadius={12}
              dataKey="percentage"
              innerRadius={config.iR}
              outerRadius={config.oR}
            >
              {overAllProgressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute bottom-0 start-1/2 -translate-x-1/2 ps-2 text-center sm:-translate-y-full">
          <Text className="text-2xl font-bold text-gray-800 @2xl:text-4xl">
            72%
          </Text>
          <Text className="font-medium">Completed</Text>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-6 gap-y-4 @md:grid-cols-4 @xl:mt-0 @[73rem]:gap-3">
        {overAllProgressData.map((item) => (
          <div key={item.name}>
            <Text
              className="block text-xl font-bold @xl:text-2xl"
              style={{ color: item.color }}
            >
              {item.count}
            </Text>
            <Text className="whitespace-nowrap">{item.name}</Text>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
