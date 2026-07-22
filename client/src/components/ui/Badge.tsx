import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'open' | 'progress' | 'completed' | 'cancelled' | 'pending' | 'accepted' | 'rejected' | 'available' | 'busy' | 'offline';
  className?: string;
}

export default function Badge({ children, variant = 'open', className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
