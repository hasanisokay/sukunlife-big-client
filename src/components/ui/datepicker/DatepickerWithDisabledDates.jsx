'use client';
import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

const DatePickerWithDisableDates = ({ availableDates, onChangeHandler }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const fp = flatpickr(inputRef.current, {
            enable: availableDates,
            onChange: (selectedDates) => {
                return onChangeHandler(selectedDates[0]);
            },
            dateFormat: "d-m-Y",
        });

        return () => {
            fp.destroy();
        };
    }, [availableDates, onChangeHandler]);

    return (
        <div>
            <label
                htmlFor="datepicker"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                Date
            </label>
            <input
                id="datepicker"
                ref={inputRef}
                className="bg-inherit p-1 rounded"
                placeholder="Select a date"
            />
        </div>
    );
};

export default DatePickerWithDisableDates;
