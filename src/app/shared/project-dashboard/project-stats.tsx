'use client';

import cn from '@core/utils/class-names';
import { PiArrowUpRightBold, PiArrowDownRightBold } from 'react-icons/pi';
import SimpleBar from 'simplebar-react';
import DropdownAction from '@core/components/charts/dropdown-action';
import { Text, Title } from 'rizzui';
import { useState } from 'react';
import { formatNumber } from '@core/utils/format-number';
import {
  StatType,
  projectStatData,
  projectStatViewOptions,
} from '@/data/project-dashboard';

export type StatCardProps = {
  className?: string;
  transaction: StatType;
};

function StatCard({ className, transaction }: StatCardProps) {
  const { icon, title, amount, increased, percentage } = transaction;
  const Icon = icon;
  return (
    <div
      className={cn(
        'group inline-block w-full rounded-lg border border-muted p-5 first:bg-slate-900 dark:bg-gray-100/50 2xl:p-8',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-5">
        <div className="grow space-y-2">
          <Text className="text-[22px] font-bold text-gray-900 group-first:text-gray-0 dark:text-gray-700 dark:group-first:text-gray-700 2xl:text-[20px] 3xl:text-3xl">
            {formatNumber(amount)}
          </Text>
          <Text className="whitespace-nowrap font-medium text-gray-500 group-first:text-gray-0 dark:group-first:text-gray-500">
            {title}
          </Text>
        </div>
        <span className="flex rounded-lg bg-slate-200 p-2.5 text-gray-900 shadow-sm dark:bg-gray-50">
          <Icon className="size-7" strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'flex items-center gap-1',
            increased ? 'text-green' : 'text-red'
          )}
        >
          <span
            className={cn(
              'flex rounded-full',
              increased
                ? 'text-green dark:text-green'
                : 'text-red dark:text-red'
            )}
          >
            {increased ? (
              <PiArrowUpRightBold className="h-auto w-4" />
            ) : (
              <PiArrowDownRightBold className="h-auto w-4" />
            )}
          </span>
          <span className="font-semibold leading-none">
            {increased ? '+' : '-'}
            {percentage}%
          </span>
        </div>
        <span className="truncate leading-none text-gray-500 group-first:text-gray-0 dark:group-first:text-gray-500">
          &nbsp;+1.01% this week
        </span>
      </div>
    </div>
  );
}

export default function ProjectStats({ className }: { className?: string }) {
  const [data, setData] = useState('');
  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <Title
          as="h1"
          className="text-base font-semibold sm:text-lg xl:text-xl"
        >
          Overview
        </Title>
        <DropdownAction
          variant="flat"
          inPortal={false}
          onChange={setData}
          options={projectStatViewOptions}
          className="rounded-md border"
        />
      </div>
      <SimpleBar>
        <div className="flex items-start gap-4 sm:gap-6">
          {projectStatData.map((stat: StatType, index: number) => {
            return <StatCard key={'stat-card-' + index} transaction={stat} />;
          })}
        </div>
      </SimpleBar>
    </div>
  );
}
