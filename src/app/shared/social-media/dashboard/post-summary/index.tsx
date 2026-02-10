'use client';

import React from 'react';
import cn from '@core/utils/class-names';
import { defaultColumns } from './column';
import PostSummaryToolbar from './toolbar';
import MainTable from '@/app/shared/table/main-table';
import WidgetCard from '@core/components/cards/widget-card';
import TablePagination from '@/app/shared/table/table-pagination';
import {
  postSummaryData,
  PostSummaryDataType,
} from '@/data/social-media-dashboard-data';
import { useTanStackTable } from '@/app/shared/tan-table/custom-table-components/use-TanStack-Table';

export default function PostSummary({ className }: { className?: string }) {
  const { table } = useTanStackTable<PostSummaryDataType>({
    tableData: postSummaryData,
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
      title={
        <span>
          <span className="hidden @lg:inline-block">Post</span> Summary
        </span>
      }
      headerClassName="items-center"
      className={cn('space-y-4', className)}
      action={
        <PostSummaryToolbar table={table} className="w-full justify-between" />
      }
    >
      <MainTable table={table} variant={'modern'} />
      <TablePagination table={table} />
    </WidgetCard>
  );
}
