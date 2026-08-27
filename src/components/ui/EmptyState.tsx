import React from 'react';
import { cn } from '../../utils/cn';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button';
import { NavLink } from 'react-router-dom';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionPath?: string;
}

export function EmptyState({ 
  title = 'No Data Available', 
  description = 'This feature will be implemented in a future sprint.', 
  icon = <FolderSearch className="h-12 w-12 text-brand-600" />,
  actionLabel,
  actionPath,
  className,
  ...props 
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-surface-50 py-16 px-6 text-center', className)} {...props}>
      <div className="mb-4 rounded-full bg-brand-50 p-4">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-4">{description}</p>
      {actionLabel && actionPath && (
        <NavLink to={actionPath}>
          <Button variant="outline" size="sm">{actionLabel}</Button>
        </NavLink>
      )}
    </div>
  );
}
