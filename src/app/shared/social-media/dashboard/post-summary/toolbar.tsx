'use client';

import { useState } from 'react';
import cn from '@core/utils/class-names';
import { PiTextColumns } from 'react-icons/pi';
import { socialMediaOptions } from '@/data/social-media-dashboard-data';
import { ActionIcon, Checkbox, MultiSelect, Popover, Title } from 'rizzui';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { renderDisplayValue, renderCustomSocialMultiOption } from '../utils';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
  className?: string;
}

export default function PostSummaryToolbar<TData extends Record<string, any>>({
  table,
  className,
}: TableToolbarProps<TData>) {
  const [state, setState] = useState([socialMediaOptions[0].value]);
  return (
    <div className={cn('flex items-center justify-end gap-4', className)}>
      <MultiSelect
        value={state}
        onChange={setState}
        options={socialMediaOptions}
        placeholder="Select Platform.."
        displayValue={renderDisplayValue}
        selectClassName="ring-0 min-h-[35px] h-[35px]"
        dropdownClassName="min-w-40"
        placement="bottom-end"
        selectedItemClassName="hidden first:block border-0"
        getOptionDisplayValue={renderCustomSocialMultiOption}
      />
      {table && (
        <Popover shadow="sm" placement="bottom-end">
          <Popover.Trigger>
            <ActionIcon
              variant="outline"
              title={'Toggle Columns'}
              className="h-auto w-auto p-1"
            >
              <PiTextColumns strokeWidth={3} className="size-6" />
            </ActionIcon>
          </Popover.Trigger>
          <Popover.Content className="z-0">
            <div className="px-0.5 pt-2 text-left rtl:text-right">
              <Title as="h6" className="mb-1 px-0.5 text-sm font-semibold">
                Toggle Columns
              </Title>
              <div className="grid grid-cols-2 gap-x-0 gap-y-5 px-1.5 pb-3.5 pt-4">
                {table.getAllLeafColumns().map((column) => {
                  return (
                    typeof column.columnDef.header === 'string' &&
                    column.columnDef.header.length > 0 && (
                      <Checkbox
                        key={column.id}
                        label={<>{column.columnDef.header}</>}
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                      />
                    )
                  );
                })}
              </div>
            </div>
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
}
