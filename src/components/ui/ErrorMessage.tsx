'use client';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
    >
      <span className="text-red-500 text-sm mt-0.5" aria-hidden>⚠</span>
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-600 underline underline-offset-2 mt-1"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
