'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'A' | 'B' | 'C' | 'D' | 'F' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    A: 'bg-emerald-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-orange-500 text-white',
    F: 'bg-red-500 text-white',
    default: 'bg-slate-200 text-slate-700',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2.5 py-0.5 rounded-md text-xs font-semibold
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}