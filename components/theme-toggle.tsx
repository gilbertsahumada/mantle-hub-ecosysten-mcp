'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-8 w-8 px-0"
    >
      <span className="text-xs">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}