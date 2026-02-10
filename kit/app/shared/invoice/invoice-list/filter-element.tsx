'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/app/shared/controlled-table/date-field';
import PriceField from '@/app/shared/controlled-table/price-field';
import StatusField from '@/app/shared/controlled-table/status-field';
import { Button } from 'rizzui';
import { getDateRangeStateValues } from '@core/utils/get-formatted-date';
import { useMedia } from '@core/hooks/use-media';
import {
  renderOptionDisplayValue,
  statusOptions,
} from '@/app/shared/invoice/form-utils';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  return (
    <>
      <PriceField
        value={filters['amount']}
        onChange={(data) => updateFilter('amount', data)}
      />
      <DateFiled
        selectsRange
        dateFormat="dd MMM yyyy"
        className="w-full"
        selected={getDateRangeStateValues(filters['createdAt'][0])}
        startDate={getDateRangeStateValues(filters['createdAt'][0]) as Date}
        endDate={getDateRangeStateValues(filters['createdAt'][1]) as Date}
        onChange={(date: any) => {
          updateFilter('createdAt', date);
        }}
        placeholderText="Select created date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Created Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <DateFiled
        selectsRange
        dateFormat="dd MMM yyyy"
        className="w-full"
        selected={getDateRangeStateValues(filters['dueDate'][0])}
        startDate={getDateRangeStateValues(filters['dueDate'][0]) as Date}
        endDate={getDateRangeStateValues(filters['dueDate'][1]) as Date}
        onChange={(date: any) => {
          updateFilter('dueDate', date);
        }}
        placeholderText="Select due date"
        {...(isMediumScreen && {
          inputProps: {
            label: 'Due Date',
            labelClassName: 'font-medium text-gray-700',
          },
        })}
      />
      <StatusField
        options={statusOptions}
        value={filters['status']}
        onChange={(value: string) => {
          updateFilter('status', value);
        }}
        getOptionValue={(option: { value: any }) => option.value}
        getOptionDisplayValue={(option: { value: any }) =>
          renderOptionDisplayValue(option.value as string)
        }
        displayValue={(selected: string) => renderOptionDisplayValue(selected)}
        dropdownClassName="!z-10 h-auto"
        className={'w-auto'}
        {...(isMediumScreen && {
          label: 'Status',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      {isFiltered ? (
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      ) : null}
    </>
  );
}
