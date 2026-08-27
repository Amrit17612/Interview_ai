import React from 'react';
import { cn } from '../../utils/cn';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center space-y-4 sm:space-y-0', className)} {...props}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center space-x-3">{children}</div>}
    </div>
  );
}
