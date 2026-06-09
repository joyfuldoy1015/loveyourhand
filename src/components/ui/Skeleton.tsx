interface Props {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse bg-[#F0F0EE] rounded-lg ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 animate-pulse bg-[#F0F0EE] rounded ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}
