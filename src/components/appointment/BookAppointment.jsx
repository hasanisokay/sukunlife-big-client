'use client';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import DatePickerWithDisableDates from '../ui/datepicker/DatepickerWithDisabledDates';


const schema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    mobile: z.string().min(11, { message: 'Mobile number must be at least 11 digits' }),
    service: z.object({
        value: z.string(),
        label: z.string(),
    }),
    address: z.string().min(1, { message: 'Address is required' }),
    date: z.date().refine(date => !isNaN(date), { message: 'Invalid date' }),
    time: z.string().min(1, { message: 'Time is required' }),
    problem: z.string().min(1, { message: 'Problem description is required' }),
});

const BookAppointment = ({ dates, status }) => {
    const theme = useSelector((state) => state.theme.mode);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    // Define service options for the select dropdown
    const serviceOptions = [
        { value: 'online_consultancy', label: 'অনলাইন কন্সাল্টেন্সি (৫০০/৭০০৳)' },
        { value: 'ruqyah', label: 'রুকইয়াহ (৩৫০০৳)' },
        { value: 'home_service', label: 'হোম সার্ভিস (এলাকাভেদে ভিন্নতা)' },
    ];

    // Handle form submission
    const onSubmit = (data) => {
        console.log('Form Data:', data);
        // Add your API call or further logic here
    };

    // Handle date selection
    const handleDateChange = (selectedDate) => {
        const formattedDate = selectedDate.toLocaleDateString('en-CA');
        const times = dates
            .filter((d) => {
                const datePart = new Date(d.date).toLocaleDateString('en-CA');
                return datePart === formattedDate;
            })
            .map((d) => {
                const time = new Date(d.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12:true
                });
                return time;
            });
    
        setSelectedDate(formattedDate);
        setAvailableTimes(times);
    };
    

    console.log(availableTimes)
    // Handle server busy or other statuses
    if (status !== 200) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-red-500 dark:text-red-400"
            >
                The server is busy. Please try again later.
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                Book Appointment
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Name Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Name
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter your name"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Mobile Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Mobile
                    </label>
                    <input
                        {...register('mobile')}
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter your mobile number"
                    />
                    {errors.mobile && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                    )}
                </div>

                {/* Service Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Service
                    </label>
                    <Controller
                        name="service"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={serviceOptions}
                                instanceId={'service-select'}
                                placeholder="Select a service"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'transparent',
                                        borderColor: '#e2e8f0',
                                        color: '#1a202c',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: theme === 'light' ? '#000000' : '#ffffff',
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: '#a0aec0',
                                    }),
                                }}
                            />
                        )}
                    />
                    {errors.service && (
                        <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>
                    )}
                </div>

                {/* Address Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Address
                    </label>
                    <input
                        {...register('address')}
                        type="text"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter your address"
                    />
                    {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                </div>

                {/* Date Field */}
                <div className="mb-4">
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <DatePickerWithDisableDates
                                availableDates={dates.map(d => d.date)}
                                onChangeHandler={(date) => {
                                    console.log('getting date', date)
                                    field.onChange(date);
                                    handleDateChange(date);
                                }}

                            />
                        )}
                    />
                    {errors.date && (
                        <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                </div>

                {/* Time Field */}
                {selectedDate && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Time
                        </label>
                        <select
                            {...register('time')}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select a time</option>
                            {availableTimes?.map((time, index) => (
                                <option key={index} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                        {errors.time && (
                            <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                        )}
                    </div>
                )}

                {/* Problem Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Problem
                    </label>
                    <textarea
                        {...register('problem')}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe your problem"
                        rows={4}
                    />
                    {errors.problem && (
                        <p className="text-red-500 text-sm mt-1">{errors.problem.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    Book Appointment
                </button>
            </form>
        </motion.div>
    );
};

export default BookAppointment;