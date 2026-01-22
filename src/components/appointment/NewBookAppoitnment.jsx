"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import DatePickerWithDisableDates from "../ui/datepicker/DatepickerWithDisabledDates";
import { SERVER } from "@/constants/urls.mjs";
import "./appointment-styles.css";
import { Flip, toast, ToastContainer } from "react-toastify";
import capitalize from "@/utils/capitalize.mjs";
import { CONSULTANTS } from "@/constants/names.mjs";
import WhyChoosSukunLIfeBookingAppointment from "./WhyChoosSukunLIfeBookingAppointment";
import AppointmentBannerSection from "./AppointmentBannerSection";
import PricingSectionAppointment from "./PricingSectionAppointment";
import TimePicker from "./Timepicker";


// Zod schema
const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("A valid email is required"),
    mobile: z.string().min(11, "Mobile number must be at least 11 digits"),
    service: z.string().min(1, "Service is required"),
    address: z.string().min(1, "Address is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    consultant: z.string().optional(),
    reference: z.string().optional(),
    problem: z.string().min(1, "Problem description is required"),
    advancePayment: z.boolean().optional(),
    transactionNumber: z.string().optional(),
    termsAgreed: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms" }),
    }),
});


const NewBookAppointment = ({ preSelectedService }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [showTransactionField, setShowTransactionField] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const user = useSelector((state) => state.user.userData);
    const [openModal, setOpenModal] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
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
        if (isPaying) return;
 
       const { termsAgreed, ...restData } = d;
        try {
            let bookingData = {
                ...restData,
                source: 'appointment',
                advancePayment: d.advancePayment ?? false,
                reviewed: false //tag for admins only, after admin review it will be true . 
            };
            if (user && Object.entries(user).length !== 0) {
                bookingData.loggedInUser = { _id: user._id, name: user.name };
            }
            if (d.advancePayment) {
                setIsPaying(true);
                await startPaystationPayment(bookingData);
                return;
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
            console.log(e)
            toast.error("Server is busy. Please try again later.");
        } finally {
            setIsPaying(false);
            // router.push("/");
        }
    };



    useEffect(() => {
        if (preSelectedService === 'ruqyah' || preSelectedService === 'hijama' || preSelectedService === 'counseling' || preSelectedService === 'emergency-ruqyah') {
            setSelectedService(preSelectedService);
            setOpenModal(true)
        }
    }, [preSelectedService])


    const handleCardSelect = (service) => {
        setSelectedService(service);
        setValue("service", service);
        setOpenModal(true);
    };

    const startPaystationPayment = async (formData) => {
        const res = await fetch(`${SERVER}/api/paystation/initiate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...formData,
            })
        });

        const data = await res.json();
        if (data?.payment_url) {
            window.location.assign(data.payment_url);
        } else {
            toast.error("Payment initialization failed");
        }
    };


    return (
        <div
            className="montserrat-font "
        >
            <AppointmentBannerSection handleCardSelect={handleCardSelect} />
            <PricingSectionAppointment />
            <WhyChoosSukunLIfeBookingAppointment />

            <div>
                <div className="mx-auto flex w-72 items-center justify-center">
                    <div
                        className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 bg-black/20 backdrop-blur-sm duration-100`}
                    >
                        <div
                            onClick={(e_) => e_.stopPropagation()}
                            className={`absolute book-appointment-modal rounded-lg bg-white p-6  drop-shadow-2xl dark:bg-gray-800 dark:text-white ${openModal ? 'opacity-1 translate-y-0 duration-300' : 'translate-y-20 opacity-0 duration-150'}`}
                        >
                            {selectedService && <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 h-[90vh]  overflow-y-auto ">
                                <div className="">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenModal(false);
                                            setSelectedService(null)
                                        }}
                                        className="text-[#2e3e23] hover:text-[#4a5e3a] dark:text-[#4a5e3a] dark:hover:text-[#2e3e23] flex items-center gap-1"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOpenModal(false);
                                            setSelectedService(null)
                                        }}
                                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition"
                                        aria-label="Close"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5 text-gray-700"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>


                                    <h3 className="text-lg text-gray-900 dark:text-gray-100">
                                        Appointment for: <span className="font-bold">
                                            {selectedService === 'emergency-ruqyah' ? "Emergency Ruqyah" : capitalize(selectedService)}
                                        </span>
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
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                        placeholder="Enter your email"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
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
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
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
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
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
                                                labelText="Select Date"
                                                minDate={new Date()}
                                                onChangeHandler={(date) => {
                                                    const d = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
                                                        .toString()
                                                        .padStart(2, "0")}-${date.getFullYear()}`;
                                                    field.onChange(d);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
                                    )}
                                </div>
                                <Controller
                                    name="time"
                                    control={control}
                                    render={({ field }) => (
                                        <TimePicker
                                            label="Select Time"
                                            time24hr={false}
                                            onChangeHandler={(time) => {
                                                field.onChange(time);
                                            }}
                                        />
                                    )}
                                />

                                {errors.time && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.time.message}
                                    </p>
                                )}


                                {/* Consultant Field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Preferred Consultant
                                    </label>

                                    <select
                                        className="w-full p-3 border rounded-lg mb-2"
                                        onChange={(e) =>
                                            setValue("consultant", e.target.value)
                                        }
                                    >
                                        <option value="">Select a consultant</option>
                                        {CONSULTANTS.map((c, i) => (
                                            <option key={i} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Or type consultant name"
                                        {...register("consultant")}
                                        className="w-full p-3 border rounded-lg"
                                    />

                                    {errors.consultant && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.consultant.message}
                                        </p>
                                    )}
                                </div>
                                {/* reference field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Reference (optional)
                                    </label>
                                    <input
                                        type="text"
                                        {...register("reference")}
                                        placeholder="Who referred you?"
                                        className="w-full p-3 border rounded-lg"
                                    />
                                </div>


                                {/* Problem Field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Problem Description
                                    </label>
                                    <textarea
                                        {...register("problem")}
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue("advancePayment", true);
                                                setShowTransactionField(true);
                                            }}
                                            className={`flex-1 p-3 rounded-full font-medium transition-colors ${showTransactionField
                                                ? "bg-[#2e3e23] text-white hover:bg-[#4a5e3a]"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            Pay 20 TK Now
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue("advancePayment", false);
                                                setShowTransactionField(false);
                                                setValue("transactionNumber", "");
                                            }}
                                            className={`flex-1 p-3 rounded-full font-medium transition-colors ${!showTransactionField
                                                ? "bg-[#2e3e23] text-white hover:bg-[#4a5e3a]"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            Pay Later
                                        </button>
                                    </div>

                                    {showTransactionField && (
                                        <div
                                            className="mt-4"
                                        >
                                            <p className="text-sm text-gray-600 mt-2">
                                                You’ll be redirected to a secure payment page after clicking book appointment button.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...register("termsAgreed")}
                                        onClick={() => setShowTermsModal(true)}
                                        className="h-4 w-4 text-[#2e3e23] border-gray-300 rounded dark:border-gray-600"
                                    />
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        I agree to the{" "}
                                        <span
                                            className="text-[#2e3e23] hover:underline cursor-pointer dark:text-[#4a5e3a]"
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
                                <button
                                    type="submit"
                                    disabled={isPaying}
                                    className="w-full p-3 bg-[#2e3e23] text-white rounded-full font-medium hover:bg-[#4a5e3a] transition-colors"
                                >
                                    Book Appointment
                                </button>
                            </form>}
                        </div>
                        <AnimatePresence>
                            {showTermsModal && (
                                <div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                >
                                    <div
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
                                                className="px-4 py-2 bg-[#2e3e23] text-white rounded-lg hover:bg-[#4a5e3a]"
                                            >
                                                Agree
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            {/* Terms Modal */}


            <ToastContainer transition={Flip} position="top-right" autoClose={3000} />
        </div>
    );
};

export default NewBookAppointment;