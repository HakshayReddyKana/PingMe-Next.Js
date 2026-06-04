import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
