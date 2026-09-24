import React from 'react';

/**
 * OncoFollow wordmark: a pine tile holding an open loop (the follow-up cycle)
 * next to the name set in the display serif.
 */
export function Wordmark({ size = 'md', subtitle }: { size?: 'sm' | 'md'; subtitle?: string }) {
  const tile = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${tile} rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true">
          <path
            d="M15.5 10a5.5 5.5 0 1 1-2.2-4.4"
            fill="none"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <circle cx="15.2" cy="5.6" r="1.6" fill="white" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={`block font-display font-medium text-foreground ${size === 'sm' ? 'text-base' : 'text-lg'}`}>
          OncoFollow
        </span>
        {subtitle && <span className="block text-2xs text-subtle">{subtitle}</span>}
      </span>
    </span>
  );
}
