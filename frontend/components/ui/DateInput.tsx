'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateInput, displayDateToISO, isoDateToDisplay, isValidDate } from '@/functions/FormatDate';

interface DateInputProps {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export default function DateInput({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  error = false,
  disabled = false,
  className = '',
  id,
  name,
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Sync from external ISO value
  useEffect(() => {
    const converted = isoDateToDisplay(value);
    setDisplayValue(converted);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setDisplayValue(formatted);

    // When complete (DD/MM/AAAA = 10 chars), convert to ISO and notify parent
    if (formatted.length === 10) {
      if (isValidDate(formatted)) {
        onChange(displayDateToISO(formatted));
      }
    } else if (formatted.length === 0) {
      onChange('');
    }
  }, [onChange]);

  const defaultClass = `w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-slate-400'}`;

  return (
    <input
      type="text"
      inputMode="numeric"
      id={id}
      name={name}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={10}
      className={className || defaultClass}
    />
  );
}
