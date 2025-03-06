"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import DatePickerWithDisableDates from "../ui/datepicker/DatepickerWithDisabledDates";
import { SERVER } from "@/constants/urls.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import convertTo12HourFormat from "@/utils/convertTo12HourFormat.mjs";

// Zod schema
const schema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        mobile: z.string().min(11, { message: "Mobile number must be at least 11 digits" }),
        service: z.string().min(1, { message: "Service is required" }),
        address: z.string().min(1, { message: "Address is required" }),
        date: z.string().min(4, { message: "Date is required" }), // Expecting a string
        time: z.string().min(1, { message: "Time is required" }),
        consultant: z.string().optional(),
        problem: z.string().min(1, { message: "Problem description is required" }),
        advancePayment: z.boolean().optional(),
        transactionNumber: z.string().optional(),
        termsAgreed: z.boolean().refine((val) => val === true, { message: "You must agree to the terms" }),
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

const serviceOptions = [
    { value: "ruqyah", label: "Ruqyah", price: "3500৳", description: "Traditional spiritual healing session" },
    { value: "hijamah", label: "Hijamah", price: "2000৳", description: "Therapeutic cupping therapy" },
    { value: "counselling", label: "Counselling", price: "700৳", description: "Professional guidance and support" },
    { value: "emergency_ruqyah", label: "Emergency Ruqyah (Online)", price: "5000৳", description: "Urgent online spiritual session" },
];

const BookAppointment = ({ dates, status }) => {
    const uniqueDateStrings = Array.from(
        new Set(
            dates?.map((d) => {
                const [day, month, year] = d.date.split("-");
                return new Date(`${year}-${month}-${day}`);
            })
        )
    );
    const WaveSVG = () => (
        <svg className="absolute top-0 left-0 w-full h-32 text-indigo-100 dark:text-indigo-800" fill="currentColor" viewBox="0 0 1440 120">
            <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
        </svg>
    );

    const theme = useSelector((state) => state.theme.mode);
    const [selectedService, setSelectedService] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availableConsultants, setAvailableConsultants] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedConsultant, setSelectedConsultant] = useState("");
    const [showTransactionField, setShowTransactionField] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [flippedCard, setFlippedCard] = useState(null); // Track flipped card
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

    const onSubmit = async (d) => {
        const { termsAgreed, ...restData } = d;
        try {
            let bookingData = {
                ...restData,
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
            // router.push("/");
        }
    };

    const handleDateChange = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const formattedDate = `${day}-${month}-${year}`; // Ensure string format: "dd-mm-yyyy"
        const filteredData = dates?.filter((d) => d.date === formattedDate)?.[0] || {};
        const times = filteredData.times || [];
        const consultants = filteredData.consultants || ["Default Consultant"];
        setValue("date", formattedDate); // Set as string
        setAvailableTimes(times);
        setAvailableConsultants(consultants);
        setSelectedTime("");
        setSelectedConsultant("");
        return formattedDate; // Return string for Controller
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
        setValue("time", time);
    };

    const handleConsultantClick = (consultant) => {
        setSelectedConsultant(consultant);
        setValue("consultant", consultant);
    };

    const handleCardFlip = (serviceValue) => {
        setFlippedCard(flippedCard === serviceValue ? null : serviceValue);
    };

    const handleCardSelect = (service) => {
        setSelectedService(service);
        setValue("service", service.value);
        setFlippedCard(null);
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

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-indigo-900 dark:via-gray-900 dark:to-teal-900 text-gray-800 dark:text-gray-100">
            <WaveSVG />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-4xl mx-auto p-8 relative z-10"
            >
                <h2 className="text-3xl mt-10 md:text-4xl font-bold font-serif tracking-wide text-center mb-8 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                    <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Book an Appointment
                </h2>


                {!selectedService ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {serviceOptions.map((service) => (
                            <div
                                key={service.value}
                                className="relative w-full h-52 cursor-pointer"
                            >
                                <motion.div
                                    className="relative w-full h-full"
                                    whileHover={{ scale: 1.05 }} // Scale on hover for desktop
                                    whileTap={{ scale: 0.95 }} // Feedback on tap
                                    onClick={() => handleCardFlip(service.value)} // Flip only on click/tap
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{ rotateY: flippedCard === service.value ? 180 : 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ transformStyle: "preserve-3d" }}
                                    >
                                        {/* Front Side: Only Name */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-teal-500 dark:from-indigo-600 dark:to-teal-600 rounded-lg flex items-center justify-center text-white text-xl font-semibold text-center p-4" style={{ backfaceVisibility: "hidden" }}>
                                            {service.label}
                                        </div>
                                        {/* Back Side: Price, Description, and Book Now */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-teal-600 dark:from-indigo-700 dark:to-teal-700 rounded-lg flex flex-col items-center justify-center text-white p-4" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>

                                            <p className="text-lg font-semibold">{service.price}</p>
                                            <p className="text-sm text-center">{service.description}</p>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent flip toggle
                                                    handleCardSelect(service);
                                                }}
                                                className="mt-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 dark:bg-gray-200 dark:text-indigo-800 dark:hover:bg-gray-300"
                                            >
                                                Book Now
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="flex items-center gap-2 mb-4">
                            <motion.button
                                type="button"
                                onClick={() => setSelectedService(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Services
                            </motion.button>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Selected: {selectedService.label}
                            </h3>
                        </div>

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
                                            const formattedDate = handleDateChange(date); // Get formatted string
                                            field.onChange(formattedDate); // Pass string to Controller
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

                        {/* Consultant Field */}
                        {availableConsultants?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Select Consultant
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableConsultants.map((consultant, index) => (
                                        <motion.button
                                            key={index}
                                            type="button"
                                            onClick={() => handleConsultantClick(consultant)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedConsultant === consultant
                                                ? "bg-indigo-500 text-white dark:bg-indigo-600"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {consultant}
                                        </motion.button>
                                    ))}
                                </div>
                                {errors.consultant && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.consultant.message}</p>
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

                        {/* Terms and Conditions */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register("termsAgreed")}
                                onClick={() => setShowTermsModal(true)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:border-gray-600"
                            />
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                I agree to the{" "}
                                <span
                                    className="text-indigo-500 hover:underline cursor-pointer dark:text-indigo-400"
                                    onClick={() => setShowTermsModal(true)}
                                >
                                    Terms & Conditions
                                </span>
                            </label>
                            {errors.termsAgreed && (
                                <p className="text-red-500 dark:text-red-400 text-sm">{errors.termsAgreed.message}</p>
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
                )}

                {/* Terms Modal */}
                <AnimatePresence>
                    {showTermsModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full"
                            >
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                    Terms & Conditions
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    By booking an appointment, you agree to:
                                </p>
                                <ul className="list-disc pl-5">
                                    <li>Provide accurate information</li>
                                    <li>Make payments as agreed</li>
                                    <li>Attend the appointment on time</li>
                                    <li>No refunds for cancellations within 24 hours</li>
                                </ul>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setValue("termsAgreed", false);
                                            setShowTermsModal(false);
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Disagree
                                    </button>
                                    <button
                                        onClick={() => {
                                            setValue("termsAgreed", true);
                                            setShowTermsModal(false);
                                        }}
                                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                    >
                                        Agree
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ToastContainer transition={Flip} position="top-right" autoClose={3000} />
            </motion.div>

            <svg className="absolute bottom-0 left-0 w-full h-32 text-teal-100 dark:text-teal-800" fill="currentColor" viewBox="0 0 1440 120">
                <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
            </svg>
        </div>
    );
};

export default BookAppointment;