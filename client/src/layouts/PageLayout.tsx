import type { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function PageLayout({ title, subtitle, children, action }: PageLayoutProps) {
  return (
    <div className="page-container fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-subtitle mb-0">{subtitle}</p>}
        </div>
        {action && (
          <div className="mt-4 sm:mt-0">
            {action}
          </div>
        )}
      </div>
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}
