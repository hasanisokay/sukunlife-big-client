'use client'
import React, { useRef, useEffect, useState } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
// import 'flatpickr/dist/themes/airbnb.css';
// import 'flatpickr/dist/themes/confetti.css';


const DatePicker = ({ defaultDate, onChangeHanlder, label, noLabel=false }) => {
    const inputRef = useRef(null);
    useEffect(() => {
        const fp = flatpickr(inputRef.current, {
            defaultDate: defaultDate,
            onChange: (selectedDates) => {
                onChangeHanlder(selectedDates[0]);
            },
            dateFormat: "d-m-Y",
        });
        return () => {
            fp.destroy();
        };
    }, []);

    return (
        <div>
          {!noLabel &&  <label
                htmlFor="datepicker"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label || "Date"}
            </label>}
            <input id="datepicker" ref={inputRef} className='bg-inherit p-1 rounded' placeholder="Select a date" />
        </div>
    );
};

export default DatePicker;
