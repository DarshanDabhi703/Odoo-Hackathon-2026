import { cn } from '@/lib/utils';

type StatusType =
  // Vehicle
  | 'Available'
  | 'On Trip'
  | 'In Shop'
  | 'Retired'
  // Driver
  | 'Off Duty'
  | 'Suspended'
  // Trip
  | 'Draft'
  | 'Dispatched'
  | 'Completed'
  | 'Cancelled'
  // Maintenance
  | 'Open'
  | 'Closed';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Available:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'On Trip':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Shop':  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Retired:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Off Duty': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Suspended:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Draft:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Dispatched: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Open:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Closed:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const statusDots: Record<string, string> = {
  Available:  'bg-emerald-500',
  'On Trip':  'bg-blue-500',
  'In Shop':  'bg-amber-500',
  Retired:    'bg-gray-400',
  'Off Duty': 'bg-gray-400',
  Suspended:  'bg-red-500',
  Draft:      'bg-gray-400',
  Dispatched: 'bg-blue-500',
  Completed:  'bg-emerald-500',
  Cancelled:  'bg-red-500',
  Open:       'bg-amber-500',
  Closed:     'bg-emerald-500',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-600';
  const dot = statusDots[status] ?? 'bg-gray-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {status}
    </span>
  );
}
