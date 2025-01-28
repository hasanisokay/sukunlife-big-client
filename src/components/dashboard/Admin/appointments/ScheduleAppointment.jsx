'use client';
import React, { useEffect, useState } from 'react';
import DatePickerWithTime from "@/components/ui/datepicker/DatepickerWithTime";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import formatDateWithTime from '@/utils/formatDateWithTime.mjs';

const ScheduleAppointment = ({ dates = [] }) => {
    const [previousDates, setPreviousDates] = useState(dates);
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

    const handleDeleteDate = async (index, isPrevious = false, id = null) => {
        if (isPrevious) {
            const dateIds = [id];
            const res = await fetch(`${SERVER}/api/admin/schedules`, {
                method: "DELETE",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dateIds })
            });
            const data = await res.json();
            if (data.status === 200) {
                toast.success(data.message)
                setPreviousDates((prev) => prev.filter((d, i) => d._id !== id));
            } else {
                window.location.reload()
                toast.error(data?.message);
            }
        } else {
            setAddedDates((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const saveDates = async () => {
        const res = await fetch(`${SERVER}/api/admin/add-appointment-dates`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addedDates)
        });
        const data = await res.json();
        console.log(data)
        if (data.status === 200) {
            toast.success(data?.message);
            const newDatesIds = data?.result?.insertedIds;
            const newDates = addedDates?.map((d, index) => ({ _id: newDatesIds[index], date: d }));
            console.log({ newDates })
            setPreviousDates((prev) => [...prev, ...newDates]);
            setAddedDates([]); // Clear added dates
        } else {
            toast.error(data?.message);
        }
    };
    console.log(dates)


    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full ">
            <div className='max-w-4xl mx-auto'>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Appointment Dates</h2>

                {/* Date Picker */}
                <div className="mb-6 ">
                    <DatePickerWithTime
                        onChangeHandler={setSelectedDates}
                        reset={resetField}
                    />
                    <button
                        onClick={handleAddDates}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
                    >
                        Add Selected Dates
                    </button>
                </div>

                {/* Added Dates List */}
                {addedDates.length > 0 && <div className="mb-8 ">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Added Dates</h3>
                    <ul className="space-y-3">
                        {addedDates?.map((date, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-800 dark:text-gray-200">{formatDateWithTime(date)}</span>
                                <button
                                    onClick={() => handleDeleteDate(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500 transition duration-300"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                    {addedDates?.length > 0 && (
                        <button
                            onClick={saveDates}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition duration-300"
                        >
                            Save Dates
                        </button>
                    )}
                </div>}

                {/* Previously Added Dates List */}
                <div className=''>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Previously Added Dates</h3>
                    <ul className="space-y-3">
                        {previousDates?.map((d, index) => (
                            <li key={d._id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-800 dark:text-gray-200">{formatDateWithTime(d?.date)}</span>
                                <button
                                    onClick={() => handleDeleteDate(index, true, d?._id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500 transition duration-300"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>


            {/* Toast Container */}
            <ToastContainer transition={Flip} position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default ScheduleAppointment;