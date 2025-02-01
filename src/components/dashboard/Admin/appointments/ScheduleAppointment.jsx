'use client';
import React, { useEffect, useState } from 'react';
import DatePickerWithTime from "@/components/ui/datepicker/DatepickerWithTime";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import formatDateWithTime from '@/utils/formatDateWithTime.mjs';
import convertTo12HourFormat from '@/utils/convertTo12HourFormat.mjs';

const ScheduleAppointment = ({ dates = [] }) => {
    const [previousDates, setPreviousDates] = useState(dates);
    const [addedDates, setAddedDates] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [resetField, setResetField] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});

    const handleAddDates = () => {
        if (selectedDates.length > 0) {
            setAddedDates((prev) => [...prev, ...selectedDates]);
            setSelectedDates([]); // Clear selected dates state
            setResetField(true); // Trigger input reset
        }
    };
    const toggleSelection = (dateId, time) => {
        setSelectedItems(prev => {
            const updated = { ...prev };
            if (!updated[dateId]) updated[dateId] = [];
            if (time) {
                updated[dateId] = updated[dateId].includes(time) ? updated[dateId].filter(t => t !== time) : [...updated[dateId], time];
                if (updated[dateId].length === 0) delete updated[dateId];
            } else {
                updated[dateId] = updated[dateId]?.length ? [] : [...previousDates.find(d => d._id === dateId)?.times || []];
            }
            return updated;
        });
    };
    const handleBulkDelete = async () => {
        if (!window.confirm("Are you sure you want to delete the selected dates and times?")) return;
        const dateIds = Object.keys(selectedItems);
        const times = Object.values(selectedItems).flat();
        const res = await fetch(`${SERVER}/api/admin/schedules`, {
            method: "DELETE",
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateIds, times })
        });
        const data = await res.json();
        if (data?.status === 200) {
            toast.success(data.message);
            setPreviousDates(prev =>
                prev.map(d => 
                  dateIds.includes(d._id) 
                    ? { ...d, times: d.times.filter(t => !times.some(time => time === t)) } 
                    : d
                ).filter(d => d.times.length > 0) // Remove empty dates
              );
            setSelectedItems({});
        } else {
            toast.error(data.message);
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
            if (data?.status === 200) {
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
        const formattedDates = addedDates.reduce((acc, dateObj) => {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');

            const date = `${day}-${month}-${year}`;
            const time = `${hours}:${minutes}:${seconds}`;

            // Find if the date already exists in the array
            let dateEntry = acc.find(entry => entry.date === date);

            if (!dateEntry) {
                // If the date doesn't exist, create a new entry with an empty times array
                dateEntry = { date, times: [] };
                acc.push(dateEntry);
            }

            // Push the time into the corresponding date's times array
            dateEntry.times.push(time);

            return acc;
        }, []);

        const res = await fetch(`${SERVER}/api/admin/add-appointment-dates`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedDates)
        });

        const data = await res.json();
        if (data?.status === 200) {
            toast.success(data?.message);
            setAddedDates([]); 
            setPreviousDates(prev=> [...prev, ...data.dates])
        } else {
            toast.error(data?.message);
        }
    };



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
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Previously Added Dates</h3>
                    {Object.keys(selectedItems)?.length > 0 && (
                        <button onClick={handleBulkDelete} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition duration-300">
                            Delete Selected
                        </button>
                    )}
                    <ul className="space-y-3">
                        {previousDates?.map((d) => (
                            <li key={d._id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={!!selectedItems[d?._id]} onChange={() => toggleSelection(d?._id, null)} className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-800 dark:text-gray-200 font-semibold">{d.date}</span>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    {d?.times?.map((time, i) => (
                                        <li key={i} className="flex items-center gap-3 p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(selectedItems[d?._id]) && selectedItems[d?._id].includes(time)}
                                                onChange={() => toggleSelection(d._id, time)}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span>{convertTo12HourFormat(time)}</span>
                                        </li>
                                    ))}
                                </ul>
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