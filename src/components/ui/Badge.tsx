interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-full';
  const variants = {
    default: 'bg-[#1A1A1A] text-[#FAFAF8]',
    muted:   'bg-[#F0F0EE] text-[#6B6B6B]',
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
