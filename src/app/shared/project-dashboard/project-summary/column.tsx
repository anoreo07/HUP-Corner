import { Badge, Text } from 'rizzui';
import { createColumnHelper } from '@tanstack/react-table';
import { ProjectSummaryDataType } from '@/data/project-dashboard';
import CircleProgressBar from '@core/components/charts/circle-progressbar';

function getStatusBadge(status: string) {
  switch (status) {
    case 'onGoing':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="ms-2 font-medium text-orange-dark">On Going</Text>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium text-green-dark">Completed</Text>
        </div>
      );
    case 'atRisk':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium text-red-dark">At Risk</Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium text-gray-600">Delayed</Text>
        </div>
      );
  }
}

function getProgressColor(status: string) {
  switch (status) {
    case 'onGoing':
      return '#EE5D26';
    case 'completed':
      return '#0DA000';
    case 'atRisk':
      return '#EE201C';
    default:
      return '#B88400';
  }
}

const columnHelper = createColumnHelper<ProjectSummaryDataType>();

export const defaultColumns = [
  columnHelper.accessor('project', {
    size: 240,
    header: 'Project',
  }),
  columnHelper.accessor('manager', {
    size: 160,
    header: 'Project Manager',
  }),
  columnHelper.accessor('dueData', {
    size: 120,
    header: 'Due date',
  }),
  columnHelper.accessor('assignedTo', {
    size: 200,
    header: 'Assigned to',
  }),
  columnHelper.accessor('status', {
    size: 140,
    header: 'Status',
    filterFn: 'statusFilter' as any,
    cell: ({ row: { original } }) => getStatusBadge(original.status),
  }),
  columnHelper.accessor('progress', {
    size: 100,
    header: 'Progress',
    cell: ({ row: { original } }) => (
      <div className="text-[10px]">
        <CircleProgressBar
          size={40}
          strokeWidth={4}
          stroke="#f0f0f0"
          percentage={original.progress}
          label={`${original.progress}%`}
          progressColor={getProgressColor(original.status)}
        />
      </div>
    ),
  }),
];
