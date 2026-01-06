'use client';

import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Moon02Icon, Sun03Icon, Tv02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const themes = [
  {
    key: 'system',
    icon: Tv02Icon,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun03Icon,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon02Icon,
    label: 'Dark theme',
  },
];

export type ThemeSwitcherProps = {
  value?: 'light' | 'dark' | 'system';
  onChange?: (theme: 'light' | 'dark' | 'system') => void;
  defaultValue?: 'light' | 'dark' | 'system';
  className?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = 'system',
  className,
}: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeTheme = (value ?? theme ?? defaultValue) as ThemeSwitcherProps['value'];

  const handleThemeClick = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      onChange?.(themeKey);
      setTheme(themeKey);
    },
    [onChange, setTheme]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = activeTheme === key;

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <HugeiconsIcon
              icon={Icon}
              className={cn(
                'relative z-10 m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
