'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { defaultColumns } from './column';
import MainTable from '@/app/shared/table/main-table';
import WidgetCard from '@core/components/cards/widget-card';
import { customerListData } from '@/data/crm-dashboard-data';
import { useTanStackTable } from '@/app/shared/tan-table/custom-table-components/use-TanStack-Table';

export type CustomerListDataType = (typeof customerListData)[0];

export default function CustomerList({ className }: { className?: string }) {
  const { table } = useTanStackTable<CustomerListDataType>({
    tableData: customerListData,
    columnConfig: defaultColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 5,
        },
      },
      enableSorting: false,
      enableColumnResizing: false,
    },
  });

  return (
    <WidgetCard
      title="Customer list"
      className={cn('@container', className)}
      headerClassName="items-center mb-1 @xl:mb-4"
      action={
        <Link href={'#'}>
          <Button as="span" variant="text" className="p-0 underline">
            View All
          </Button>
        </Link>
      }
    >
      <MainTable
        table={table}
        variant="minimal"
        classNames={{
          container: '[&>table>thead>tr>th]:whitespace-nowrap',
        }}
      />
    </WidgetCard>
  );
}
