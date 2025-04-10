import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        {description && (
          <p className="mt-2 text-white/70">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;