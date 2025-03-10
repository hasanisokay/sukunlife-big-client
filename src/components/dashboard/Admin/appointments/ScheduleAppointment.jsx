'use client';
import React, { useEffect, useState } from 'react';
import DatePickerWithTime from "@/components/ui/datepicker/DatepickerWithTime";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import formatDateWithTime from '@/utils/formatDateWithTime.mjs';
import convertTo12HourFormat from '@/utils/convertTo12HourFormat.mjs';
import formatDate from '@/utils/formatDate.mjs';
import deleteBulkSchedule from '@/server-functions/deleteBulkSchedule.mjs';
import deleteDate from '@/server-functions/deleteDate.mjs';
import addScheduleDate from '@/server-functions/addScheduleDate.mjs';

const ScheduleAppointment = ({ dates = [] }) => {
    const [previousDates, setPreviousDates] = useState(dates);
    const [addedDates, setAddedDates] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [resetField, setResetField] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [interval, setInterval] = useState(2); // Default interval in hours
    const [slotNumber, setSlotNumber] = useState(4); // Default number of slots
    const [beginningTime, setBeginningTime] = useState('13:00'); // Default beginning time in 24-hour format

    const handleAddDates = () => {
        if (selectedDates.length > 0) {
            const newDates = selectedDates.map(date => {
                const times = generateTimeSlots(date, beginningTime, interval, slotNumber);
                return {
                    date,
                    consultants: [], // Default empty array for consultant names
                    times,
                };
            });
            setAddedDates((prev) => [...prev, ...newDates]);
            setSelectedDates([]); // Clear selected dates state
            setResetField(true); // Trigger input reset
        }
    };

    const generateTimeSlots = (date, startTime, interval, slotNumber) => {
        const slots = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMinute, 0, 0); // Set the starting time

        for (let i = 0; i < slotNumber; i++) {
            slots.push(currentTime.toTimeString().split(' ')[0]); // Add the time in HH:MM:SS format
            currentTime.setHours(currentTime.getHours() + interval); // Increment by the interval
        }
        return slots;
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
        const data = await deleteBulkSchedule(dateIds, times);
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
            const data = await deleteDate(dateIds);
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
            const year = dateObj.date.getFullYear();
            const month = String(dateObj.date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
            const day = String(dateObj.date.getDate()).padStart(2, '0');
            const date = `${day}-${month}-${year}`;

            // Find if the date already exists in the array
            let dateEntry = acc.find(entry => entry.date === date);

            if (!dateEntry) {
                // If the date doesn't exist, create a new entry with an empty times array
                dateEntry = { date, times: [], consultants: dateObj.consultants };
                acc.push(dateEntry);
            }

            // Push the times into the corresponding date's times array
            dateObj.times.forEach(time => {
                dateEntry.times.push(time);
            });

            return acc;
        }, []);
        const data = await addScheduleDate(formattedDates);
        if (data?.status === 200) {
            toast.success(data?.message);
            setAddedDates([]); 
            setPreviousDates(prev=> [...prev, ...data.dates])
        } else {
            toast.error(data?.message);
        }
    };

    const handleAddConsultant = (index, name) => {
        setAddedDates(prev => {
            const updatedDates = [...prev];
            // Only add if the consultant isn't already in the list
            if (!updatedDates[index].consultants.includes(name)) {
                updatedDates[index].consultants = [...updatedDates[index].consultants, name];
            }
            return updatedDates;
        });
    };

    const handleEditConsultant = (dateIndex, consultantIndex, newName) => {
        setAddedDates(prev => {
            const updatedDates = [...prev];
            updatedDates[dateIndex].consultants[consultantIndex] = newName;
            return updatedDates;
        });
    };

    const handleRemoveConsultant = (dateIndex, consultantIndex) => {
        setAddedDates(prev => {
            const updatedDates = [...prev];
            updatedDates[dateIndex].consultants.splice(consultantIndex, 1);
            return updatedDates;
        });
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
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interval (hours)</label>
                        <input
                            type="number"
                            value={interval}
                            onChange={(e) => setInterval(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Slots</label>
                        <input
                            type="number"
                            value={slotNumber}
                            onChange={(e) => setSlotNumber(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beginning Time (24-hour format)</label>
                        <input
                            type="text"
                            value={beginningTime}
                            onChange={(e) => setBeginningTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
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
                        {addedDates?.map((dateObj, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <span className="text-gray-800 dark:text-gray-200">{formatDate(dateObj.date)}</span>
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consultants</label>
                                        {dateObj.consultants.map((consultant, consultantIndex) => (
                                            <div key={consultantIndex} className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={consultant}
                                                    onChange={(e) => handleEditConsultant(index, consultantIndex, e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                                <button
                                                    onClick={() => handleRemoveConsultant(index, consultantIndex)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500 transition duration-300"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddConsultant(index, '')}
                                            className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
                                        >
                                            Add Consultant
                                        </button>
                                    </div>
                                    <p className="mt-2">Times</p>
                                    <div>
                                        {dateObj.times.map((t, i) => <p key={i}>{convertTo12HourFormat(t)}</p>)}
                                    </div>
                                </div>
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