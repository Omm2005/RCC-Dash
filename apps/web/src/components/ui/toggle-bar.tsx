'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

type ToggleOption = {
  label: string;
  value: string;
};

type ToggleBarProps = {
  options: ToggleOption[];
  value?: string;
  onChange?: (value: string) => void;
};

export default function ToggleBar({
  options,
  value,
  onChange,
}: ToggleBarProps) {
  const [internalValue, setInternalValue] = useState(
    value ?? options[0].value
  );

  const activeValue = value ?? internalValue;

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className="relative flex w-fit rounded-full bg-muted p-1">
      {options.map(option => {
        const isActive = option.value === activeValue;

        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="relative px-6 py-2 text-sm font-medium"
          >
            {isActive && (
              <motion.div
                layoutId="toggle-indicator"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                className="absolute inset-0 rounded-full bg-accent shadow"
              />
            )}

            <span
              className={`relative z-10 transition-colors ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-muted-foreground'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
