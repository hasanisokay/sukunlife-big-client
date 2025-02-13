'use client';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import DatePickerWithDisableDates from '../ui/datepicker/DatepickerWithDisabledDates';
import Select from "react-select";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import convertTo12HourFormat from '@/utils/convertTo12HourFormat.mjs';

// Updated Zod schema
const schema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    mobile: z.string().min(11, { message: 'Mobile number must be at least 11 digits' }),
    service: z.object({
        value: z.string(),
        label: z.string(),
    }),
    address: z.string().min(1, { message: 'Address is required' }),
    date: z.string().min(4, { message: "Date required." }),
    time: z.string().min(1, { message: 'Time is required' }),
    problem: z.string().min(1, { message: 'Problem description is required' }),
    advancePayment: z.boolean().optional(),
    transactionNumber: z.string().optional(),
}).refine(data => {
    if (data.advancePayment) {
        return data.transactionNumber?.length > 0;
    }
    return true;
}, {
    message: "Transaction number is required when advance payment is selected",
    path: ["transactionNumber"],
});



const BookAppointment = ({ dates, status }) => {
    const uniqueDateStrings = Array.from(
        new Set(
            dates.map(d => {
                const [day, month, year] = d.date.split('-');
                const dateObj = new Date(`${year}-${month}-${day}`);
                return dateObj;
            })
        )
    );
    const theme = useSelector((state) => state.theme.mode);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [showTransactionField, setShowTransactionField] = useState(false);
    const user = useSelector(state => state.user.userData);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const serviceOptions = [
        { value: 'online_consultancy', label: 'অনলাইন কন্সাল্টেন্সি (৫০০/৭০০৳)' },
        { value: 'ruqyah', label: 'রুকইয়াহ (৩৫০০৳)' },
        { value: 'home_service', label: 'হোম সার্ভিস (এলাকাভেদে ভিন্নতা)' },
    ];

    const onSubmit = async (d) => {
        try {
            let bookingData = {
                ...d,
                advancePayment: d.advancePayment ?? false,
                transactionNumber: d.advancePayment ? d.transactionNumber : "",
            };

            if (user) {
                bookingData.loggedInUser = { _id: user._id, name: user.name, }
            }
            console.log(bookingData)
            const res = await fetch(
                `${SERVER}/api/public/book-appointment`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bookingData)
                }
            );
            const data = await res.json();
            if (data?.status === 200) {
                toast.success(data?.message);
                // try {
                //     // sending email to notify admin.
                //     const r = await fetch(
                //         `${SERVER}/api/public/send-email`,
                //         {
                //             method: "POST",
                //             headers: {
                //                 "Content-Type": "application/json",
                //             },
                //             body: JSON.stringify(bookingData)
                //         }
                //     );
                //     const emailData = await r.json();
                // } catch {
                //     toast.error("Error while confirming. Please contact support to confirm.")
                // }
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Server is busy right now. Try few hours later.");
        } finally {
            router.push("/");
        }
    };

    const handleDateChange = (s) => {
        const year = s.getFullYear();
        const month = String(s.getMonth() + 1).padStart(2, '0');
        const day = String(s.getDate()).padStart(2, '0');
        const date = `${day}-${month}-${year}`;
        const filteredTimes = dates.filter(d => d.date === date).flatMap(d => d.times);
        setValue('date', date);
        setAvailableTimes(filteredTimes);
        setSelectedTime('');
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
        setValue('time', time);
    };

    // const handleAdvancePaymentChange = (e) => {
    //     const isChecked = e.target.checked;
    //     setValue('advancePayment', isChecked);
    //     setShowTransactionField(isChecked); // Show/hide transaction field
    //     if (!isChecked) {
    //         setValue('transactionNumber', ''); // Clear transaction number if unchecked
    //     }
    // };

    // const handlePayLater = () => {
    //     setValue('advancePayment', false);
    //     setValue('transactionNumber', '');
    //     setShowTransactionField(false); // Hide transaction field
    // };

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
                                availableDates={uniqueDateStrings}
                                onChangeHandler={(date) => {
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
                {availableTimes?.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Select Time
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes?.map((time, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleTimeClick(time)}
                                    className={`p-2 border rounded text-center ${selectedTime === time
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                                        }`}
                                >
                                    {convertTo12HourFormat(time)}
                                </button>
                            ))}
                        </div>
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

                {/* Advance Payment Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Payment Option
                    </label>
                    <div className="flex gap-2">
                        {/* Pay Now Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setValue('advancePayment', true);
                                setShowTransactionField(true);
                            }}
                            className={`flex-1 p-3 rounded-lg text-center transition-colors ${showTransactionField
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Pay 500 TK Now
                        </button>

                        {/* Pay Later Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setValue('advancePayment', false);
                                setShowTransactionField(false);
                            }}
                            className={`flex-1 p-3 rounded-lg text-center transition-colors ${!showTransactionField
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Pay Later
                        </button>
                    </div>

                    {/* Transaction Number Field (Conditional) */}
                    {showTransactionField && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Pay 500 TK to <strong>017xxxxx (Bkash)</strong> to confirm your booking.
                            </p>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Transaction Number
                            </label>
                            <input
                                {...register('transactionNumber')}
                                type="text"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Enter transaction number"
                            />
                            {errors.transactionNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.transactionNumber.message}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pay Later Button */}
                {/* {!showTransactionField && (
                    <button
                        type="button"
                        onClick={handlePayLater}
                        className="w-full mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                        Pay Later
                    </button>
                )} */}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    Book Appointment
                </button>
            </form>
            <ToastContainer transition={Flip} />
        </motion.div>
    );
};

export default BookAppointment;