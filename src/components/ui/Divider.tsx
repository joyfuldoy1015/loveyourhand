interface DividerProps {
  className?: string;
  label?: string;
}

export function Divider({ className = '', label }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-[#EAEAEA]" />
        <span className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B]">{label}</span>
        <div className="flex-1 h-px bg-[#EAEAEA]" />
      </div>
    );
  }
  return <div className={`h-px bg-[#EAEAEA] ${className}`} />;
}
