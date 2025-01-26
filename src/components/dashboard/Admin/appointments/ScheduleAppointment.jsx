'use client';
import React, { useEffect, useState } from 'react';
import DatePickerWithTime from "@/components/ui/datepicker/DatepickerWithTime";
import { SERVER } from '@/constants/urls.mjs';

const ScheduleAppointment = ({ dates = [] }) => {
    const [previousDates, setPreviousDates] = useState(dates)
    const [addedDates, setAddedDates] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [resetField, setResetField] = useState(false);

    const handleAddDates = () => {
        if (selectedDates.length > 0) {
            setAddedDates((prev) => [...prev, ...selectedDates]);
            setSelectedDates([]); // Clear selected dates state
            setResetField(true); // Trigger input reset
        }
    };

    useEffect(() => {
        if (resetField) {
            setResetField(false); // Reset the resetField flag after clearing input
        }
    }, [resetField]);

    const handleDeleteDate = (index) => {
        setAddedDates((prev) => prev.filter((_, i) => i !== index));
    };
    const saveDates = async () => {
        const res = await fetch(`${SERVER}/api/admin/add-appointment-dates`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addedDates)
        })
    }
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Manage Appointment Dates</h2>

            {/* Date Picker */}
            <div className="mb-4">
                <DatePickerWithTime
                    onChangeHandler={setSelectedDates}
                    reset={resetField}
                />
                <button
                    onClick={handleAddDates}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Add Selected Dates
                </button>
            </div>

            {/* Available Dates List */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Added Dates</h3>
                <ul className="space-y-2">
                    {addedDates?.map((date, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="text-gray-800 dark:text-gray-200">{new Date(date).toLocaleString()}</span>
                            <button
                                onClick={() => handleDeleteDate(index)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
                {addedDates?.length > 0 && <button onClick={saveDates}>Save</button>}
            </div>
        </div>
    );
};

export default ScheduleAppointment;
