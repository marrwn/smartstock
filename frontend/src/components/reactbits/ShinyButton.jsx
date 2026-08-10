import React from 'react';

export default function ShinyButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const baseStyles =
    variant === 'primary'
      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-700 dark:border-white hover:bg-zinc-800 dark:hover:bg-white shadow-md shadow-black/20'
      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-2.5 font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98] ${baseStyles} ${className}`}
      {...props}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 dark:via-black/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
