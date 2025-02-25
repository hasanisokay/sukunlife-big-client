"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import DatePickerWithDisableDates from "../ui/datepicker/DatepickerWithDisabledDates";
import Select from "react-select";
import { SERVER } from "@/constants/urls.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import convertTo12HourFormat from "@/utils/convertTo12HourFormat.mjs";

// Zod schema
const schema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        mobile: z.string().min(11, { message: "Mobile number must be at least 11 digits" }),
        service: z.object({
            value: z.string(),
            label: z.string(),
        }),
        address: z.string().min(1, { message: "Address is required" }),
        date: z.string().min(4, { message: "Date is required" }),
        time: z.string().min(1, { message: "Time is required" }),
        problem: z.string().min(1, { message: "Problem description is required" }),
        advancePayment: z.boolean().optional(),
        transactionNumber: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.advancePayment) {
                return data.transactionNumber?.length > 0;
            }
            return true;
        },
        {
            message: "Transaction number is required when advance payment is selected",
            path: ["transactionNumber"],
        }
    );

const BookAppointment = ({ dates, status }) => {
    const uniqueDateStrings = Array.from(
        new Set(
            dates?.map((d) => {
                const [day, month, year] = d.date.split("-");
                return new Date(`${year}-${month}-${day}`);
            })
        )
    );
    const theme = useSelector((state) => state.theme.mode);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [showTransactionField, setShowTransactionField] = useState(false);
    const user = useSelector((state) => state.user.userData);
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
        { value: "online_consultancy", label: "অনলাইন কন্সাল্টেন্সি (৫০০/৭০০৳)" },
        { value: "ruqyah", label: "রুকইয়াহ (৩৫০০৳)" },
        { value: "home_service", label: "হোম সার্ভিস (এলাকাভেদে ভিন্নতা)" },
    ];

    const onSubmit = async (d) => {
        try {
            let bookingData = {
                ...d,
                advancePayment: d.advancePayment ?? false,
                transactionNumber: d.advancePayment ? d.transactionNumber : "",
            };

            if (user) {
                bookingData.loggedInUser = { _id: user._id, name: user.name };
            }

            const res = await fetch(`${SERVER}/api/public/book-appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            const data = await res.json();

            if (data?.status === 200) {
                toast.success(data?.message, { autoClose: 2000 });
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error("Server is busy. Please try again later.");
        } finally {
            router.push("/");
        }
    };

    const handleDateChange = (s) => {
        const year = s.getFullYear();
        const month = String(s.getMonth() + 1).padStart(2, "0");
        const day = String(s.getDate()).padStart(2, "0");
        const date = `${day}-${month}-${year}`;
        const filteredTimes = dates?.filter((d) => d.date === date)?.flatMap((d) => d.times);
        setValue("date", date);
        setAvailableTimes(filteredTimes);
        setSelectedTime("");
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
        setValue("time", time);
    };

    if (status !== 200) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-red-500 dark:text-red-400 mt-10 text-lg font-medium"
            >
                The server is busy. Please try again later.
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
        >
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
                Book an Appointment
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Name
                    </label>
                    <input
                        {...register("name")}
                        type="text"
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Enter your name"
                    />
                    {errors.name && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Mobile Field */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Mobile Number
                    </label>
                    <input
                        {...register("mobile")}
                        type="text"
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Enter your mobile number"
                    />
                    {errors.mobile && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.mobile.message}</p>
                    )}
                </div>

                {/* Service Field */}
                <div>
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
                                instanceId={"service-select"}
                                placeholder="Select a service"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: theme === "light" ? "#f9fafb" : "#1f2937",
                                        borderColor: theme === "light" ? "#e2e8f0" : "#4b5563",
                                        color: theme === "light" ? "#1a202c" : "#d1d5db",
                                        padding: "4px",
                                        borderRadius: "8px",
                                        "&:hover": { borderColor: theme === "light" ? "#a0aec0" : "#6b7280" },
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: theme === "light" ? "#1a202c" : "#d1d5db",
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: theme === "light" ? "#a0aec0" : "#9ca3af",
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                                        color: theme === "light" ? "#1a202c" : "#d1d5db",
                                    }),
                                    option: (base, { isFocused }) => ({
                                        ...base,
                                        backgroundColor: isFocused
                                            ? theme === "light"
                                                ? "#e0e7ff"
                                                : "#4b5563"
                                            : "transparent",
                                        color: theme === "light" ? "#1a202c" : "#d1d5db",
                                        "&:active": {
                                            backgroundColor: theme === "light" ? "#c7d2fe" : "#6b7280",
                                        },
                                    }),
                                }}
                            />
                        )}
                    />
                    {errors.service && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.service.message}</p>
                    )}
                </div>

                {/* Address Field */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Address
                    </label>
                    <input
                        {...register("address")}
                        type="text"
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Enter your address"
                    />
                    {errors.address && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address.message}</p>
                    )}
                </div>

                {/* Date Field */}
                <div>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <DatePickerWithDisableDates
                                labelText={'Select Date'}
                                availableDates={uniqueDateStrings}
                                onChangeHandler={(date) => {
                                    handleDateChange(date);
                                    field.onChange(date);
                                }}
                            />
                        )}
                    />
                    {errors.date && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
                    )}
                </div>

                {/* Time Field */}
                {availableTimes?.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Select Time
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map((time, index) => (
                                <motion.button
                                    key={index}
                                    type="button"
                                    onClick={() => handleTimeClick(time)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedTime === time
                                            ? "bg-indigo-500 text-white dark:bg-indigo-600"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {convertTo12HourFormat(time)}
                                </motion.button>
                            ))}
                        </div>
                        {errors.time && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.time.message}</p>
                        )}
                    </div>
                )}

                {/* Problem Field */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Problem Description
                    </label>
                    <textarea
                        {...register("problem")}
                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        placeholder="Describe your problem"
                        rows={4}
                    />
                    {errors.problem && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.problem.message}</p>
                    )}
                </div>

                {/* Payment Options */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Payment Option
                    </label>
                    <div className="flex gap-3">
                        <motion.button
                            type="button"
                            onClick={() => {
                                setValue("advancePayment", true);
                                setShowTransactionField(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${showTransactionField
                                    ? "bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Pay 500 TK Now
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => {
                                setValue("advancePayment", false);
                                setShowTransactionField(false);
                                setValue("transactionNumber", "");
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${!showTransactionField
                                    ? "bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                        >
                            Pay Later
                        </motion.button>
                    </div>

                    {/* Transaction Number Field */}
                    {showTransactionField && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Pay 500 TK to <strong>017xxxxx (Bkash)</strong> to confirm your booking.
                            </p>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Transaction Number
                            </label>
                            <input
                                {...register("transactionNumber")}
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                                placeholder="Enter transaction number"
                            />
                            {errors.transactionNumber && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                    {errors.transactionNumber.message}
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full p-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
                >
                    Book Appointment
                </motion.button>
            </form>
            <ToastContainer transition={Flip} position="top-right" autoClose={3000} />
        </motion.div>
    );
};

export default BookAppointment;