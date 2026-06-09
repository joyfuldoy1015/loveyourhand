'use client';

import { motion } from 'framer-motion';

interface Props {
  icon?:        string;
  label?:       string;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
}

export function EmptyState({ icon = '✍️', label, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center px-6"
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#F5F5F3] border border-[#EAEAEA] flex items-center justify-center text-2xl mb-5">
          {icon}
        </div>
      )}
      {label && (
        <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-2">
          {label}
        </p>
      )}
      <p className="text-base font-medium text-[#1A1A1A] mb-2">{title}</p>
      {description && (
        <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="h-10 px-7 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
