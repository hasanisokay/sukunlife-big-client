'use client';

import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

const TimePicker = ({
    label = "Time",
    defaultTime,
    onChangeHandler,
    enableSeconds = false,
    time24hr = false,
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const fp = flatpickr(inputRef.current, {
            enableTime: true,
            noCalendar: true,
            dateFormat: time24hr ? "H:i" : "h:i K",
            defaultDate: defaultTime,
            time_24hr: time24hr,
            enableSeconds,
            onChange: (selectedDates, dateStr) => {
                onChangeHandler?.(dateStr);
            },
        });

        return () => {
            fp.destroy();
        };
    }, []);

    return (
        <div>
            <label
                htmlFor="timepicker"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
            </label>

            <input
                id="timepicker"
                ref={inputRef}
                className="bg-inherit p-1 rounded w-full"
                placeholder="Select time"
            />
        </div>
    );
};

export default TimePicker;
