import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-base text-gray-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 sm:mt-0">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;