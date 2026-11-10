import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'purple' | 'gold';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  size = 'sm',
}) => {
  const variantStyles = {
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full border',
    md: 'text-sm px-3 py-1 rounded-lg border font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
