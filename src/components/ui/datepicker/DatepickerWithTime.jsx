'use client';
import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

const DatePickerWithTime = ({ onChangeHandler, reset }) => {
  const inputRef = useRef(null);
  const flatpickrInstance = useRef(null);

  useEffect(() => {
    flatpickrInstance.current = flatpickr(inputRef.current, {
      enableTime: true,
      mode: "multiple", // Allows multiple date selection
      dateFormat: "d-m-Y H:i",
      time_24hr: false,
      onChange: (selectedDates) => {
        onChangeHandler(selectedDates);
      },
    });

    return () => {
      flatpickrInstance.current.destroy();
    };
  }, [onChangeHandler]);

  useEffect(() => {
    if (reset && flatpickrInstance.current) {
      flatpickrInstance.current.clear(); // Clear previous selections
    }
  }, [reset]);

  return (
    <div>
      <label
        htmlFor="datepicker"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Select Dates
      </label>
      <input
        id="datepicker"
        ref={inputRef}
        className="bg-inherit p-2 rounded border border-gray-300 dark:border-gray-600"
        placeholder="Select multiple dates"
      />
    </div>
  );
};

export default DatePickerWithTime;
