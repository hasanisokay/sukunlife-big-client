'use client';
import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

const DatePickerWithDisableDates = ({
  enabledDates,
  minDate = 'today',
  onChangeHandler,
  labelText,
}) => {
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Convert enabledDates to Date objects if they're strings
    const parsedEnabledDates = enabledDates?.length
      ? enabledDates.map(dateStr => {
          // If it's already a Date object, return it
          if (dateStr instanceof Date) return dateStr;
          
          // If it's a string in YYYY-MM-DD format, convert to Date
          if (typeof dateStr === 'string') {
            const [year, month, day] = dateStr.split('-');
            return new Date(year, month - 1, day);
          }
          
          return dateStr;
        })
      : null;

    const fp = flatpickr(inputRef.current, {
      dateFormat: 'd-m-Y',
      disableMobile: true,
      // If enabledDates is passed → use it
      ...(parsedEnabledDates?.length
        ? { enable: parsedEnabledDates }
        : { minDate }),

      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          onChangeHandler(selectedDates[0]);
        }
      },
    });

    return () => fp.destroy();
  }, [enabledDates, minDate, onChangeHandler]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {labelText || 'Date'}
      </label>
      <input
        ref={inputRef}
        className="bg-inherit p-2 border rounded w-full"
        placeholder="Select a date"
        readOnly
      />
    </div>
  );
};

export default DatePickerWithDisableDates;