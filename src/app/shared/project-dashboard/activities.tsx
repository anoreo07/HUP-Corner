'use client';

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
} from 'recharts';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import SimpleBar from '@core/ui/simplebar';
import cn from '@core/utils/class-names';
import {
  ACTIVITIES_COLORS,
  activitiesData,
  activitiesStatus,
} from '@/data/project-dashboard';

export default function ProjectActivities({
  className,
}: {
  className?: string;
}) {
  return (
    <WidgetCard
      title="Activities"
      headerClassName="items-center"
      titleClassName="text-base lg:text-xl font-semibold"
      className={cn('dark:bg-gray-100/50', className)}
      action={<Legend className="flex" />}
    >
      <SimpleBar>
        <div className="h-[28rem] w-full pt-6 @lg:pt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={activitiesData}
              margin={{
                top: 0,
                right: 0,
                bottom: 0,
                left: -40,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:-translate-x-1 [&_.recharts-cartesian-axis-tick-value]:translate-y-4 [&_.recharts-cartesian-axis-tick-value]:text-sm [&_.recharts-tooltip-cursor]:fill-[#3AA6B9]"
            >
              <CartesianGrid
                vertical={true}
                horizontal={false}
                strokeOpacity={1}
                strokeDasharray="0"
              />

              <XAxis
                type="number"
                tick={<CustomYAxisTick />}
                tickLine={false}
              />
              <YAxis
                className="[writing-mode:vertical-lr] rtl:[writing-mode:vertical-rl]"
                dataKey="label"
                type="category"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip formattedNumber />} />
              <defs>
                <linearGradient
                  id="aCompleted"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0" stopColor="#3AA6B9" />
                  <stop offset="0.8" stopColor="#3AA6B9" />
                  <stop offset="1" stopColor="#3AA6B9" />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient
                  id="AinProgress"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0" stopColor="#365486" />
                  <stop offset="0.8" stopColor="#365486" />
                  <stop offset="1" stopColor="#365486" />
                </linearGradient>
              </defs>
              <Bar
                radius={12}
                barSize={16}
                stroke={ACTIVITIES_COLORS[0]}
                dataKey="completed"
                fill="url(#aCompleted)"
              />
              <Bar
                radius={12}
                barSize={16}
                stroke={ACTIVITIES_COLORS[1]}
                dataKey="inProgress"
                fill="url(#AinProgress)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}

function Legend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start gap-3 text-xs @3xl:text-sm lg:gap-4',
        className
      )}
    >
      {activitiesStatus.map((item, index) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: ACTIVITIES_COLORS[index] }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
