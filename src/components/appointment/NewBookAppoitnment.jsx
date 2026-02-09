"use client";
import React, { useEffect, useState, useMemo } from "react";
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
import { CONSULTANT_DETAILS } from "@/constants/names.mjs";
import WhyChoosSukunLIfeBookingAppointment from "./WhyChoosSukunLIfeBookingAppointment";
import AppointmentBannerSection from "./AppointmentBannerSection";
import PricingSectionAppointment from "./PricingSectionAppointment";
import startPaystationPayment from "@/payments/startPaystationPayment.mjs";
import getAppointmentSlots from "@/utils/getAppointmentSlots.mjs";


// Zod schema
const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("A valid email is required"),
    mobile: z.string().min(11, "Mobile number must be at least 11 digits"),
    service: z.string().min(1, "Service is required"),
    address: z.string().min(1, "Address is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    consultant: z.string().optional(), // Made optional for emergency-ruqyah and hijama
    reference: z.string().optional(),
    problem: z.string().min(1, "Problem description is required"),
    advancePayment: z.boolean().optional(),
    transactionNumber: z.string().optional(),
    termsAgreed: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms" }),
    }),
}).refine((data) => {
    // For counseling and ruqyah, consultant is required
    if (data.service === 'counseling' || data.service === 'ruqyah') {
        return data.consultant && data.consultant.length > 0;
    }
    return true;
}, {
    message: "Please select a consultant",
    path: ["consultant"],
});



const NewBookAppointment = ({ preSelectedService }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showTransactionField, setShowTransactionField] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [isLoadingSlots, setIsLoadingSlots] = useState(true);
    const user = useSelector((state) => state.user.userData);
    const [openModal, setOpenModal] = useState(false);
    const [isPaying, setIsPaying] = useState(false);


    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const watchDate = watch("date");
    const watchTime = watch("time");
    const watchConsultant = watch("consultant");

    // Helper function to convert 24-hour time to 12-hour AM/PM format
    const convertTo12Hour = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Get consultant fee based on service
    const getConsultantFee = (consultantName, service) => {
        const consultant = CONSULTANT_DETAILS.find(c => c.name === consultantName);
        if (!consultant) return null;
        return consultant.services[service] || null;
    };

    // Check if service requires consultant selection
    const requiresConsultantSelection = useMemo(() => {
        return selectedService === 'counseling' || selectedService === 'ruqyah';
    }, [selectedService]);

useEffect(() => {
    if (!requiresConsultantSelection && selectedService) {
        setValue("consultant", "any");
    }
}, [requiresConsultantSelection, selectedService, setValue]);

    // Get fixed fee for emergency-ruqyah and hijama
    const fixedServiceFee = useMemo(() => {
        if (selectedService === 'emergency-ruqyah' || selectedService === 'hijama') {
            return 4000;
        }
        return null;
    }, [selectedService]);

    // Get current consultant fee
    const currentConsultantFee = useMemo(() => {
        if (!requiresConsultantSelection || !watchConsultant) return null;
        return getConsultantFee(watchConsultant, selectedService);
    }, [watchConsultant, selectedService, requiresConsultantSelection]);

    // Fetch available slots from API
    const getSlots = async () => {
        setIsLoadingSlots(true);
        try {
            const s = await getAppointmentSlots();
            if (s.slots) {
                setAvailableSlots(s.slots);
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Failed to load available slots");
        } finally {
            setIsLoadingSlots(false);
        }
    };
    useEffect(() => {
        setSelectedDate("")
        setSelectedTime("")
    }, [selectedService])

    useEffect(() => {
        getSlots();
    }, []);

    // Convert date from "DD-MM-YYYY" to "YYYY-MM-DD" for comparison
    const convertDateFormat = (dateStr) => {
        if (!dateStr) return "";
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month}-${day}`;
    };

    // Get unique available dates from slots
    const availableDates = useMemo(() => {
        if (!availableSlots?.length) return [];
        const dates = [...new Set(availableSlots.map(slot => slot.date))];
        return dates.sort();
    }, [availableSlots, selectedService]);


    // Get available times for selected date
    const availableTimes = useMemo(() => {
        if (!selectedDate || !availableSlots?.length) return [];

        const convertedDate = convertDateFormat(selectedDate);
        const slotsForDate = availableSlots.filter(slot => slot.date === convertedDate);

        // Use Map to get unique time slots based on startTime-endTime combination
        const uniqueTimesMap = new Map();
        slotsForDate.forEach(slot => {
            const key = `${slot.startTime}-${slot.endTime}`;
            if (!uniqueTimesMap.has(key)) {
                uniqueTimesMap.set(key, {
                    start: slot.startTime,
                    end: slot.endTime,
                    display: `${slot.startTime} - ${slot.endTime}`,
                    display12h: `${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)}`
                });
            }
        });

        const times = Array.from(uniqueTimesMap.values());
        return times.sort((a, b) => a.start.localeCompare(b.start));
    }, [selectedDate, availableSlots, selectedService]);

    // Get available consultants for selected date and time
    const availableConsultants = useMemo(() => {
        if (!selectedDate || !selectedTime || !availableSlots?.length) return [];

        const convertedDate = convertDateFormat(selectedDate);
        const [startTime] = selectedTime.split(" - ");

        const slot = availableSlots.find(
            s => s.date === convertedDate && s.startTime === startTime
        );

        return slot?.consultants || [];
    }, [selectedDate, selectedTime, availableSlots, selectedService]);

    // Update selected date when date changes
    useEffect(() => {
        if (watchDate) {
            setSelectedDate(watchDate);
            // Reset time and consultant when date changes
            setValue("time", "");
            setValue("consultant", "");
            setSelectedTime("");
        }
    }, [watchDate, setValue]);

    // Update selected time when time changes
    useEffect(() => {
        if (watchTime) {
            setSelectedTime(watchTime);
            // Reset consultant when time changes
            setValue("consultant", "");
        }
    }, [watchTime, setValue]);

    const onSubmit = async (d) => {
        if (isPaying) return;

        const { termsAgreed, ...restData } = d;

        // Extract start and end time
        const [startTime, endTime] = d.time.split(" - ");
        const convertedDate = convertDateFormat(d.date);

        try {
            let bookingData = {
                ...restData,
                date: convertedDate,
                startTime: startTime,
                endTime: endTime,
                // Set consultant to 'any' for emergency-ruqyah and hijama
                consultant: requiresConsultantSelection ? d.consultant : 'any',
                source: 'appointment',
                advancePayment: d.advancePayment ?? false,
                reviewed: false
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
                // Refresh slots after successful booking
                getSlots();
                // Close modal and reset form
                setOpenModal(false);
                setSelectedService(null);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.log(e);
            toast.error("Server is busy. Please try again later.");
        } finally {
            setIsPaying(false);
            window.location.reload();
        }
    };

    useEffect(() => {
        if (preSelectedService === 'ruqyah' || preSelectedService === 'hijama' ||
            preSelectedService === 'counseling' || preSelectedService === 'emergency-ruqyah') {
            setSelectedService(preSelectedService);
            setOpenModal(true);
        }
    }, [preSelectedService]);

    const handleCardSelect = (service) => {
        setSelectedService(service);
        setValue("service", service);
        setOpenModal(true);
    };

    return (
        <div className="montserrat-font">
            <AppointmentBannerSection handleCardSelect={handleCardSelect} />
            <PricingSectionAppointment />
            <WhyChoosSukunLIfeBookingAppointment />

            <div>
                <div className="mx-auto flex w-72 items-center justify-center">
                    <div
                        className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'
                            } inset-0 bg-black/20 backdrop-blur-sm duration-100`}
                    >
                        <div
                            onClick={(e_) => e_.stopPropagation()}
                            className={`absolute book-appointment-modal rounded-lg bg-white p-6 drop-shadow-2xl dark:bg-gray-800 dark:text-white ${openModal ? 'opacity-1 translate-y-0 duration-300' : 'translate-y-20 opacity-0 duration-150'
                                }`}
                        >
                            {selectedService && (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 h-[90vh] overflow-y-auto">
                                    <div className="">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpenModal(false);
                                                setSelectedService(null);
                                            }}
                                            className="text-[#2e3e23] hover:text-[#4a5e3a] dark:text-[#4a5e3a] dark:hover:text-[#2e3e23] flex items-center gap-1"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOpenModal(false);
                                                setSelectedService(null);
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
                                            Appointment for:{" "}
                                            <span className="font-bold">
                                                {selectedService === 'emergency-ruqyah' ? "Emergency Ruqyah" : capitalize(selectedService)}
                                            </span>
                                        </h3>

                                        {/* Fixed Fee Display for Emergency Ruqyah & Hijama */}
                                        {fixedServiceFee && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm font-semibold text-green-800">
                                                    Service Fee: <span className="text-lg">৳{fixedServiceFee} BDT</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Loading State */}
                                    {isLoadingSlots && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">Loading available slots...</p>
                                        </div>
                                    )}

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

                                    {/* Email Field */}
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
                                        {errors.email && (
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

                                    {/* Date Field - Only show available dates */}
                                    <div>
                                        <Controller
                                            name="date"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePickerWithDisableDates
                                                    labelText="Select Date"
                                                    enabledDates={availableDates}
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
                                        {availableDates.length === 0 && !isLoadingSlots && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                No available dates at the moment. Please check back later.
                                            </p>
                                        )}
                                    </div>

                                    {/* Time Slot Selection */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                            Select Available Time Slot
                                        </label>
                                        {!selectedDate ? (
                                            <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                Please select a date first
                                            </p>
                                        ) : availableTimes.length === 0 ? (
                                            <p className="text-sm text-amber-600 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                No available time slots for this date
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableTimes.map((timeSlot, index) => (
                                                    <label
                                                        key={index}
                                                        className={`
                                                            flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all border-2
                                                            ${selectedTime === timeSlot.display
                                                                ? 'bg-[#2e3e23] text-white border-[#2e3e23]'
                                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-[#4a5e3a]'
                                                            }
                                                        `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            {...register("time")}
                                                            value={timeSlot.display}
                                                            className="sr-only"
                                                        />
                                                        <span className="text-sm font-medium">{timeSlot.display12h}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {errors.time && (
                                            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.time.message}</p>
                                        )}
                                    </div>

                                    {/* Consultant Selection - Only for counseling and ruqyah */}
                                    {requiresConsultantSelection ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                Select Available Consultant
                                            </label>
                                            {!selectedTime ? (
                                                <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    Please select a date and time first
                                                </p>
                                            ) : availableConsultants.length === 0 ? (
                                                <p className="text-sm text-amber-600 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                    No consultants available for this slot
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {availableConsultants.map((consultant, index) => {
                                                        const fee = getConsultantFee(consultant, selectedService);
                                                        return (
                                                            <label
                                                                key={index}
                                                                className={`
                                                                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2
                                                                    ${watchConsultant === consultant
                                                                        ? 'bg-[#2e3e23] text-white border-[#2e3e23]'
                                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-[#4a5e3a]'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="radio"
                                                                        {...register("consultant")}
                                                                        value={consultant}
                                                                        className="sr-only"
                                                                    />
                                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${watchConsultant === consultant
                                                                        ? 'border-white'
                                                                        : 'border-gray-400'
                                                                        }`}>
                                                                        {watchConsultant === consultant && (
                                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm font-medium">{consultant}</span>
                                                                </div>
                                                                {fee && (
                                                                    <span className={`text-sm font-bold ${watchConsultant === consultant
                                                                        ? 'text-white'
                                                                        : 'text-green-600 dark:text-green-500'
                                                                        }`}>
                                                                        ৳{fee}
                                                                    </span>
                                                                )}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {errors.consultant && (
                                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.consultant.message}</p>
                                            )}

                                            {/* Selected Consultant Fee Display */}
                                            {currentConsultantFee && (
                                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-green-800">
                                                        Consultation Fee: <span className="text-lg">৳{currentConsultantFee}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // For emergency-ruqyah and hijama, automatically set consultant to 'any'
                                        <input type="hidden" {...register("consultant")} value="any" />
                                    )}

                                    {/* Reference field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            Reference (optional)
                                        </label>
                                        <input
                                            type="text"
                                            {...register("reference")}
                                            placeholder="Who referred you?"
                                            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
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
                                                Pay 500 TK Now
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
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mt-2">
                                                    You'll be redirected to a secure payment page after clicking book appointment button.
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
                                        disabled={isPaying || isLoadingSlots}
                                        className="w-full p-3 bg-[#2e3e23] text-white rounded-full font-medium hover:bg-[#4a5e3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPaying ? "Processing..." : "Book Appointment"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Terms Modal */}
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
                                        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                                            <li>Provide accurate information</li>
                                            <li>Make payments as agreed</li>
                                            <li>Attend the appointment on time</li>
                                            <li>No refunds for cancellations within 24 hours</li>
                                        </ul>
                                        <div className="flex justify-end gap-2 mt-6">
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

            <ToastContainer transition={Flip} position="top-right" autoClose={3000} />
        </div>
    );
};

export default NewBookAppointment;