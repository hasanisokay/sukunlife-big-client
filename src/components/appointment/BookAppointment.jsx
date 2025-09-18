"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import bookAppointment from "@/../public/bgImages/about-us.jpg";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, PresenceContext } from "framer-motion";
import { useSelector } from "react-redux";
import DatePickerWithDisableDates from "../ui/datepicker/DatepickerWithDisabledDates";
import { SERVER } from "@/constants/urls.mjs";
import "./appointment-styles.css";
import { Flip, toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import convertTo12HourFormat from "@/utils/convertTo12HourFormat.mjs";
import { TakaSVG } from "../svg/SvgCollection";
import capitalize from "@/utils/capitalize.mjs";

// Zod schema
const schema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        mobile: z.string().min(11, { message: "Mobile number must be at least 11 digits" }),
        service: z.string().min(1, { message: "Service is required" }),
        address: z.string().min(1, { message: "Address is required" }),
        date: z.string().min(4, { message: "Date is required" }),
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

const BookAppointment = ({ dates, status, preSelectedService }) => {
    const uniqueDateStrings = Array.from(
        new Set(
            dates?.map((d) => {
                const [day, month, year] = d.date.split("-");
                return new Date(`${year}-${month}-${day}`);
            })
        )
    );

    const [selectedService, setSelectedService] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availableConsultants, setAvailableConsultants] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedConsultant, setSelectedConsultant] = useState("");
    const [showTransactionField, setShowTransactionField] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const user = useSelector((state) => state.user.userData);
    const [openModal, setOpenModal] = useState(false);
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
                consultant: selectedConsultant,
                reviewed: false
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
    useEffect(() => {
        if (preSelectedService === 'ruqyah' || preSelectedService === 'hijama' || preSelectedService === 'counseling' || preSelectedService === 'emergency-ruqyah') {
            setSelectedService(preSelectedService);
            setOpenModal(true)
        }
    }, [preSelectedService])
    const handleDateChange = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const formattedDate = `${day}-${month}-${year}`;
        const filteredData = dates?.filter((d) => d.date === formattedDate)?.[0] || {};
        const times = filteredData.times || [];
        const consultants = filteredData.consultants || ["Default Consultant"];
        setValue("date", formattedDate);
        setAvailableTimes(times);
        setAvailableConsultants(consultants);
        setSelectedTime(times[0]);
        setSelectedConsultant(consultants[0]);
        return formattedDate;
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
        setValue("time", time);
    };

    const handleConsultantClick = (consultant) => {
        setSelectedConsultant(consultant);
        setValue("consultant", consultant);
    };

    const handleCardSelect = (service) => {
        console.log(service)
        setSelectedService(service);
        setValue("service", service);
        setOpenModal(true);
    };
    if (status !== 200) {
        return (
            <div
                className="text-center text-red-500 dark:text-red-400 mt-10 text-lg font-medium"
            >
                The server is busy. Please try again later.
            </div>
        );
    }

    return (
        <div
            className="montserrat-font "
        >
            <section className="text-white banner-container-appointment flex flex-col items-center justify-center  text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 ">
                    <Image className="w-full  bg-image-banner  object-cover pointer-events-none select-none" src={bookAppointment} width={1000} height={1000} alt="Book an appointment banner" />
                </div>
                <div className="bg-black bg-opacity-[41%] w-full bg-image-banner absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 md:px-6 px-4 md:-mt-0 -mt-[50px]">
                    <div className="flex flex-col gap-[19px]">
                        <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Book an Appointment</h2>
                        <p className="text-sm md:text-base max-w-4xl text-center mx-auto">
                            We offer a range of specialized spiritual and holistic services designed to restore your physical, emotional, and spiritual well-being. Book your session with ease and begin your journey towards healing today.
                        </p>
                    </div>
                    <div className="min-h-[294px] mt-[75px]">
                        <div className="session-cards-container ">
                            <div className="w-[255px] group  bg-white text-black rounded-[27px] ">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 106 106"
                                    >
                                        <path
                                            fill="#63953A"
                                            d="m53 68.81 45.425-18.762c.051-.021.106-.029.155-.047v-.246a2.12 2.12 0 0 0-2.9-1.971l-1.34.53V38.35a2.12 2.12 0 0 0-3.01-1.924c-4.16 1.946-11.65 5.237-16.07 5.974C68.9 43.46 57.24 45.58 53 56.18c-4.24-10.6-15.9-12.72-22.26-13.78-4.42-.742-11.91-4.028-16.07-5.975a2.12 2.12 0 0 0-3.01 1.924v9.964l-1.341-.53a2.12 2.12 0 0 0-2.9 1.974v.246c.052.018.107.026.156.047z"
                                        ></path>
                                        <path
                                            fill="#63953A"
                                            d="M98.831 52.1 53 71.027 7.169 52.1a2.12 2.12 0 0 0-2.929 1.96v.702a2.12 2.12 0 0 0 1.31 1.96l37.6 15.53-26.826 14.8a1.06 1.06 0 0 0 .512 1.988H27.58c.684 0 1.357-.165 1.962-.481L53 76.32l23.458 12.239a4.24 4.24 0 0 0 1.962.481h10.744a1.06 1.06 0 0 0 .513-1.989l-26.826-14.8 37.599-15.53a2.12 2.12 0 0 0 1.31-1.96v-.701a2.12 2.12 0 0 0-2.929-1.96"
                                        ></path>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Ruqyah Session
                                    </p>
                                    <button onClick={() => handleCardSelect('ruqyah')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 88 88"
                                    >
                                        <path
                                            fill="#63953A"
                                            d="M69.95 71.03V47.743c-.273-17.923-16.757-27.345-33.019-23.701a24.34 24.34 0 0 0-18.902 23.7V71.03c1.343-.01 50.559-.007 51.921 0M46.998 30.672a1.34 1.34 0 0 1 1.617-.99A20.16 20.16 0 0 1 63.039 42.57a1.334 1.334 0 0 1-2.513.896A17.73 17.73 0 0 0 48 32.289a1.357 1.357 0 0 1-1.002-1.617M72.624 74.158a5.14 5.14 0 0 0-2.674-.454H18.03c-6.022-.752-6.916 8.537-.789 8.796H70.74c4.508.045 5.782-6.432 1.885-8.342M42.345 20.753a38 38 0 0 1 9.117.641 7.69 7.69 0 0 0-6.136-8.448V8.174h1.315a1.337 1.337 0 0 0 0-2.674h-5.303a1.337 1.337 0 0 0 0 2.674h1.315v4.759a7.673 7.673 0 0 0-6.136 8.462 26.7 26.7 0 0 1 5.828-.642"
                                        ></path>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Hijama
                                    </p>
                                    <button onClick={() => handleCardSelect('hijama')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[249px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 80 80"
                                    >
                                        <g clipPath="url(#clip0_155_2370)">
                                            <path
                                                fill="#63953A"
                                                fillRule="evenodd"
                                                d="M42.205.136C52.151 1.354 59.227 10.404 58.01 20.35S47.74 37.372 37.795 36.154a18.06 18.06 0 0 1-8.25-3.178l-5.543 2.443a.79.79 0 0 1-.887-.159.79.79 0 0 1-.186-.88l2.301-5.698a18.08 18.08 0 0 1-3.239-12.742C23.21 5.994 32.26-1.082 42.205.136m-2.224 16.396a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m-7.82 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226m15.679 0a1.613 1.613 0 1 0 0 3.226 1.613 1.613 0 0 0 0-3.226M18.145 61.855c9.425 0 17.171 7.185 18.06 16.377.046.469-.094.89-.411 1.24a1.56 1.56 0 0 1-1.195.528H1.691c-.472 0-.878-.18-1.195-.529a1.56 1.56 0 0 1-.411-1.24c.889-9.19 8.635-16.376 18.06-16.376m0-19.961a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348m43.71 19.96c9.424 0 17.171 7.186 18.06 16.378.045.469-.095.89-.411 1.24-.318.349-.723.528-1.195.528H45.4c-.471 0-.877-.18-1.194-.529a1.56 1.56 0 0 1-.412-1.24c.89-9.19 8.636-16.376 18.06-16.376m0-19.96a9.174 9.174 0 1 1 0 18.348 9.174 9.174 0 0 1 0-18.348"
                                                clipRule="evenodd"
                                            ></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_155_2370">
                                                <path fill="#fff" d="M0 0h80v80H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Counseling
                                    </p>
                                    <button onClick={() => handleCardSelect('counseling')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                            <div className="w-[255px] group  bg-white text-black rounded-[27px]">
                                <div className="flex flex-col gap-[19px] items-center  smooth-hover h-[231px] group-hover:h-[290px]">
                                    <svg
                                        className="mt-[21px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="80"
                                        height="80"
                                        fill="none"
                                        viewBox="0 0 79 79"
                                    >
                                        <g fill="red" clipPath="url(#clip0_155_2372)">
                                            <path d="M61.78 66.923H17.216c-5.678.002-10.281 4.605-10.283 10.283h65.13c0-5.68-4.603-10.283-10.283-10.283M39.5 18.933c-12 0-20.567 8.569-20.567 21.155v23.251h41.134V40.088c0-12.586-8.562-21.155-20.567-21.155M53.218 44.72c-.989 0-1.791-.803-1.791-1.792 0-6.43-3.158-12.33-7.347-13.724a1.793 1.793 0 1 1 1.132-3.405c5.677 1.894 9.798 9.098 9.798 17.129 0 .989-.802 1.792-1.791 1.792M12.075 41.292H1.792a1.793 1.793 0 0 1 0-3.584h10.283a1.793 1.793 0 0 1 0 3.584M18.788 21.456c-.475 0-.932-.188-1.267-.525l-6.856-6.858A1.792 1.792 0 0 1 13.2 11.54l6.856 6.858a1.793 1.793 0 0 1-1.267 3.059M39.5 13.867c-.99 0-1.792-.803-1.792-1.792V1.792a1.793 1.793 0 0 1 3.584 0v10.283c0 .99-.803 1.792-1.792 1.792M60.6 21.067a1.792 1.792 0 0 1-1.268-3.059l6.856-6.855a1.792 1.792 0 1 1 2.535 2.534l-6.857 6.855a1.79 1.79 0 0 1-1.267.525M77.208 41.292H66.925a1.793 1.793 0 0 1 0-3.584h10.283a1.793 1.793 0 0 1 0 3.584"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_155_2372">
                                                <path fill="#fff" d="M0 0h79v79H0z"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="charisSIL-font text-[24px] font-bold">
                                        Emergency Ruqyah Session
                                    </p>
                                    <button onClick={() => handleCardSelect('emergency-ruqyah')} className="hidden group-hover:block group-active:block rounded-full w-[172px] h-[54px] bg-green text-white mb-[20px]">
                                        Book Now
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
            <section className="pricing-section-appointment">
                <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Our <span className="text-green">Pricing</span></h2>
                <p className="max-w-[880px] mx-auto text-center">We provide transparent pricing for all our healing and counselling services. Choose the session that best suits your needs</p>
                <h3 className=" charisSIL-font md:text-[32px] text-[24px] font-bold leading-tight text-center ">Ruqyah Services</h3>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">3500 BDT</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Session</h4>
                    <p className="text-[#878484]">A full personalized Ruqyah session for spiritual healing and protection.</p>
                </div>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">5000 BDT</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Home Service</h4>
                    <p className="text-[#878484]">A full personalized Ruqyah session for spiritual healing and protection.</p>
                </div>
                <div className="ruqyah-session-card">
                    <p className="text-green charisSIL-font md:text-[24px] text-[20px]">700 BDT</p>
                    <h4 className="italic font-bold text-[20px]">Ruqyah Consultancy</h4>
                    <p className="text-[#878484]">Professional guidance and support</p>
                </div>
                <div className="flex gap-[30px] flex-col mt-[21px]">
                    <h3 className=" charisSIL-font md:text-[32px] text-[24px] font-bold leading-tight text-center ">Hijama (Cupping Therapy)</h3>
                    <div className="ruqyah-session-card">
                        <p className="text-green charisSIL-font md:text-[24px] text-[20px]">3500 BDT</p>
                        <h4 className="italic font-bold text-[20px]">Hijama Detox Package</h4>
                        <p className="text-[#878484]">A full personalized Ruqyah session for spiritual healing and protection.</p>
                    </div>
                    <div className="ruqyah-session-card">
                        <p className="text-green charisSIL-font md:text-[24px] text-[20px]">3500 BDT</p>
                        <h4 className="italic font-bold text-[20px]">Standard Hijama</h4>
                        <p className="text-[#878484]">A full personalized Ruqyah session for spiritual healing and protection.</p>
                    </div>
                </div>
            </section>

            <section className="mt-[100px]">
                <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Why Choose <span className="text-green">Sukun Life?</span></h2>
                <div className="mt-[100px] flex items-center justify-center flex-wrap gap-[34px]">
                    <div className="w-[334px] h-[263px] flex flex-col items-center gap-[27px] text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="76"
                            height="75"
                            fill="none"
                            viewBox="0 0 76 75"
                        >
                            <path
                                fill="#F7B594"
                                d="M53.317 9.042a3.697 3.697 0 1 1-7.393 0 3.697 3.697 0 0 1 7.393 0"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M50.513 9.042c0-1.174.548-2.22 1.403-2.897a3.697 3.697 0 1 0 0 5.794 3.69 3.69 0 0 1-1.403-2.897"
                            ></path>
                            <path
                                fill="#F7B594"
                                d="M30.163 9.042a3.696 3.696 0 1 1-7.392 0 3.696 3.696 0 0 1 7.392 0"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M27.36 9.042a3.69 3.69 0 0 1 1.401-2.897 3.696 3.696 0 1 0 0 5.794 3.69 3.69 0 0 1-1.402-2.897"
                            ></path>
                            <path
                                fill="#00AAF0"
                                d="M49.621 12.738c-1.607 0-3.376.6-4.494 1.586a7.9 7.9 0 0 1 .484 2.722v7.458c0 .58-.47 1.052-1.051 1.052h10.552c.468 0 .848-.38.848-.848v-5.63c0-3.501-2.838-6.34-6.339-6.34"
                            ></path>
                            <path
                                fill="#059ADB"
                                d="M44.56 25.556h5.78q.099-.512.1-1.053v-7.457c0-1.513-.273-2.965-.772-4.306l-.047-.002c-1.608 0-3.376.6-4.494 1.586a7.9 7.9 0 0 1 .484 2.722v7.458c0 .58-.47 1.052-1.051 1.052"
                            ></path>
                            <path
                                fill="#FFC850"
                                d="M30.477 24.504v-7.458c0-.957.17-1.873.484-2.722-1.118-.986-2.886-1.586-4.494-1.586a6.34 6.34 0 0 0-6.339 6.34v5.63c0 .468.38.848.848.848h10.552c-.58 0-1.051-.472-1.051-1.053"
                            ></path>
                            <path
                                fill="#FEB644"
                                d="M24.656 24.708v-5.63a6.34 6.34 0 0 1 4.143-5.949 7.5 7.5 0 0 0-2.332-.39 6.34 6.34 0 0 0-6.339 6.338v5.631c0 .468.38.848.847.848h4.528a.85.85 0 0 1-.847-.848"
                            ></path>
                            <path
                                fill="#F7B594"
                                d="M42.633 4.589a4.588 4.588 0 1 1-9.177 0 4.588 4.588 0 0 1 9.177 0"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M38.044 4.589c0-1.699.923-3.18 2.294-3.973a4.588 4.588 0 1 0 0 7.946 4.59 4.59 0 0 1-2.294-3.973"
                            ></path>
                            <path
                                fill="#D665D3"
                                d="M38.044 9.177a7.87 7.87 0 0 0-7.869 7.869v7.458c0 .58.47 1.051 1.052 1.051H44.86c.581 0 1.052-.47 1.052-1.052v-7.457a7.87 7.87 0 0 0-7.869-7.869"
                            ></path>
                            <path
                                fill="#C64AC6"
                                d="M34.702 24.504v-7.458a7.87 7.87 0 0 1 5.606-7.537 7.869 7.869 0 0 0-10.133 7.536v7.459c0 .58.47 1.052 1.052 1.052h4.527c-.58 0-1.052-.472-1.052-1.053"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M64.588 29.883c.128.346.156.716.086 1.072l.898-.99c.342-.378.53-.86.53-1.36V17.399c0-.684.203-1.322.553-1.863a3.8 3.8 0 0 0-3.731-.732c-1.92.653-2.923 2.677-2.242 4.518z"
                            ></path>
                            <path
                                fill="#E5966E"
                                d="M64.492 19.321c-.596-1.612.099-3.363 1.57-4.213a3.82 3.82 0 0 0-3.138-.305c-1.92.653-2.923 2.677-2.242 4.518l3.906 10.562c.128.346.156.716.086 1.072l.898-.99c.342-.377.53-.86.53-1.36v-4.93z"
                            ></path>
                            <path
                                fill="#F7B594"
                                d="m62.378 46.335 8.332-11.461a11.3 11.3 0 0 0 2.241-6.752V17.478c0-1.984-1.623-3.655-3.607-3.618a3.54 3.54 0 0 0-3.47 3.538v11.208c0 .5-.18.981-.508 1.359l-4.05 4.655c-.095.108-.274.01-.23-.128a3.89 3.89 0 0 0-1.055-4.078c-1.54-1.421-4.04-1.296-5.497.21L43.53 42.002a6.93 6.93 0 0 0-1.95 4.82v11.05h16.673c.305-4.044 1.729-8.238 4.126-11.537"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M46.106 57.873v-11.05c0-1.8.7-3.528 1.95-4.821l11.006-11.378q.279-.287.602-.506c-1.546-1.097-3.784-.885-5.13.506L43.53 42.002a6.93 6.93 0 0 0-1.95 4.82v11.05h16.673z"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M51.826 42.197a1.046 1.046 0 0 0 1.816.71l7.64-8.26c-.098.058-.235-.032-.195-.154a3.9 3.9 0 0 0-.074-2.64l-8.909 9.633a1.05 1.05 0 0 0-.278.71M11.5 29.883a2 2 0 0 0-.087 1.072l-.897-.99a2.02 2.02 0 0 1-.53-1.36V17.399c0-.684-.203-1.322-.553-1.863a3.8 3.8 0 0 1 3.731-.732c1.92.653 2.924 2.677 2.243 4.518z"
                            ></path>
                            <path
                                fill="#E5966E"
                                d="M13.164 14.803a3.8 3.8 0 0 0-3.731.732c.35.541.553 1.18.553 1.863v11.208c0 .5.188.982.53 1.359l.897.99a2 2 0 0 1 .087-1.072l1.58-4.27v-8.215c0-.389-.066-.763-.188-1.113a1.094 1.094 0 0 1 .577-1.353l.01-.005a4 4 0 0 0-.315-.124"
                            ></path>
                            <path
                                fill="#F7B594"
                                d="M13.71 46.335 5.379 34.874a11.3 11.3 0 0 1-2.242-6.752V17.478c0-1.984 1.623-3.655 3.607-3.618a3.54 3.54 0 0 1 3.47 3.538v11.208c0 .5.18.981.508 1.359l4.05 4.655c.095.108.274.01.23-.127a3.89 3.89 0 0 1 1.055-4.08c1.539-1.42 4.04-1.294 5.497.21l11.005 11.378a6.94 6.94 0 0 1 1.95 4.822v11.05H17.838c-.306-4.045-1.73-8.239-4.127-11.538"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M18.238 46.335 9.906 34.874a11.3 11.3 0 0 1-2.242-6.752V17.478c0-1.106.505-2.113 1.294-2.783a3.52 3.52 0 0 0-2.214-.835c-1.983-.037-3.607 1.634-3.607 3.618v10.644c0 2.434.786 4.801 2.242 6.752l8.33 11.462c2.398 3.298 3.822 7.492 4.128 11.537h4.527c-.306-4.045-1.729-8.239-4.126-11.538"
                            ></path>
                            <path
                                fill="#F0A479"
                                d="M24.262 42.197a1.047 1.047 0 0 1-1.816.711l-7.64-8.261c.098.058.236-.032.195-.154a3.9 3.9 0 0 1 .074-2.64l8.909 9.633c.186.201.278.457.278.71"
                            ></path>
                            <path
                                fill="#00AAF0"
                                d="M38.048 63.224v10.178c0 .883-.716 1.598-1.599 1.598H16.213a1.6 1.6 0 0 1-1.598-1.598V63.224z"
                            ></path>
                            <path
                                fill="#059ADB"
                                d="M19.143 73.402V63.224h-4.528v10.178c0 .883.716 1.598 1.598 1.598h4.527a1.6 1.6 0 0 1-1.598-1.598"
                            ></path>
                            <path
                                fill="#E4EAF8"
                                d="M16.213 57.571h20.236c.883 0 1.599.715 1.599 1.598v4.357H14.615v-4.357c0-.883.716-1.598 1.598-1.598"
                            ></path>
                            <path
                                fill="#D8DCE5"
                                d="M20.74 57.571h-4.527c-.883 0-1.598.715-1.598 1.598v4.357h4.527v-4.357c0-.883.716-1.598 1.598-1.598"
                            ></path>
                            <path
                                fill="#00AAF0"
                                d="M61.473 63.224v10.178c0 .883-.715 1.598-1.598 1.598H39.638a1.6 1.6 0 0 1-1.597-1.598V63.224z"
                            ></path>
                            <path
                                fill="#059ADB"
                                d="M42.569 73.402V63.224H38.04v10.178c0 .883.716 1.598 1.598 1.598h4.527a1.6 1.6 0 0 1-1.597-1.598"
                            ></path>
                            <path
                                fill="#E4EAF8"
                                d="M39.638 57.571h20.237c.883 0 1.598.715 1.598 1.598v4.357H38.041v-4.357c0-.883.716-1.598 1.597-1.598"
                            ></path>
                            <path
                                fill="#D8DCE5"
                                d="M44.166 57.571h-4.528c-.882 0-1.597.715-1.597 1.598v4.357h4.527v-4.357c0-.883.716-1.598 1.598-1.598"
                            ></path>
                        </svg>
                        <h4 className="charisSIL-font font-bold text-[20px]">Community & Lifetime Access</h4>
                        <p className="font-light">
                            Gain lifetime access to our WhatsApp groups, educational materials, and follow-ups to ensure your long-term well-being.
                        </p>
                    </div>
                    <div className="w-[334px] h-[263px] flex flex-col items-center gap-[27px] text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="74"
                            height="75"
                            fill="none"
                            viewBox="0 0 74 75"
                        >
                            <g clipPath="url(#clip0_155_2416)">
                                <path
                                    fill="#554E56"
                                    d="M46.542 14.31v3.299c1.485-.226 2.802.24 3.718 1.102V14.31z"
                                ></path>
                                <path
                                    fill="#433F43"
                                    d="M23.692 14.31v4.401c.947-.89 2.294-1.373 3.61-1.195v-3.207z"
                                ></path>
                                <path
                                    fill="#FFB19F"
                                    d="M46.728 17.312c0 8.428.008 7.253 0 7.614 2.575.395 4.586-1.49 4.586-3.807 0-2.32-2.019-4.197-4.587-3.808M27.225 17.314c-2.242-.303-4.587 1.441-4.587 3.805 0 2.313 2.007 4.202 4.586 3.806-.008-.346 0 .765 0-7.61"
                                ></path>
                                <path
                                    fill="#FFA78F"
                                    d="M50.283 18.486c-.835-.893-2.108-1.394-3.556-1.175 0 8.43.009 7.254 0 7.615 1.452.222 2.725-.28 3.559-1.175-.002-.847-.003-2.395-.003-5.265M27.222 23.752a3.85 3.85 0 0 1-1.029-2.633c0-.978.402-1.85 1.03-2.514q.003-.604.002-1.29c-2.242-.304-4.587 1.44-4.587 3.804 0 2.313 2.007 4.202 4.586 3.806-.004-.195-.003.075-.002-1.173"
                                ></path>
                                <path
                                    fill="#FFCEBF"
                                    d="M27.075 14.31v12.125l1.895 1.086c.607.348.982 1 .982 1.706v.954c0 1.082.865 1.96 1.933 1.96h.746c.601 0 1.179-.233 1.616-.65a2.34 2.34 0 0 1 1.614-.65h2.23c.6 0 1.178.232 1.615.65.436.417 1.014.65 1.614.65h.747c1.068 0 1.933-.877 1.933-1.96v-.954c0-.707.375-1.358.981-1.706l1.896-1.086V14.309z"
                                ></path>
                                <path
                                    fill="#FFB19F"
                                    d="M31.45 14.31h-4.375v12.125l1.896 1.086c.606.348.981 1 .981 1.706v.954c0 .93.64 1.708 1.498 1.908z"
                                ></path>
                                <path
                                    fill="#E7E7E7"
                                    d="M47.32 41.888c-4.282 4.92-10.343 5.12-10.344 5.12-.002 0-6.064-.2-10.347-5.123l-.244.095V75h21.182V41.985z"
                                ></path>
                                <path
                                    fill="#CECECE"
                                    d="M36.976 46.856s-.818-.027-2.064-.304v16.374c0 .682.545 1.235 1.218 1.235h1.691c.673 0 1.218-.553 1.218-1.235V46.552c-1.245.277-2.062.304-2.063.304"
                                ></path>
                                <path
                                    fill="#BFBFBF"
                                    d="M37.704 62.927V46.787c-.46.059-.728.068-.728.068s-.818-.027-2.064-.304v16.374c0 .683.545 1.235 1.218 1.235h1.691c.199 0 .385-.049.55-.134a1.24 1.24 0 0 1-.667-1.1"
                                ></path>
                                <path
                                    fill="#CECECE"
                                    d="M31 45.292a14.6 14.6 0 0 1-4.371-3.407l-.244.095V75h4.616V45.292"
                                ></path>
                                <path
                                    fill="#CECECE"
                                    d="m47.418 41.927-2.922-1.147c-2.66 2.692-5.584 2.404-7.52 2.404-1.96 0-4.865.283-7.52-2.404l-2.922 1.147c4.287 5.03 10.44 5.231 10.442 5.231.001 0 6.155-.202 10.442-5.231"
                                ></path>
                                <path
                                    fill="#BFBFBF"
                                    d="M31 42.02a8.3 8.3 0 0 1-1.544-1.24l-2.922 1.147A14.6 14.6 0 0 0 31 45.444z"
                                ></path>
                                <path
                                    fill="#685E68"
                                    d="m58.605 46.318-11.187-4.392V75h15.06c1.068 0 1.935-.878 1.935-1.962v-17.59c0-6.71-5.808-9.13-5.808-9.13"
                                ></path>
                                <path fill="#554E56" d="M47.418 41.927V75h4.467V43.68z"></path>
                                <path
                                    fill="#685E68"
                                    d="m15.347 46.318 11.187-4.392V75h-15.06c-1.068 0-1.935-.878-1.935-1.962v-17.59c0-6.71 5.808-9.13 5.808-9.13"
                                ></path>
                                <path
                                    fill="#554E56"
                                    d="M14.14 73.039V51.144c0-1.957.495-3.547 1.194-4.821-.285.123-5.795 2.588-5.795 9.124v17.591c0 1.084.867 1.962 1.935 1.962h4.602c-1.069 0-1.935-.878-1.935-1.962"
                                ></path>
                                <path
                                    fill="#E7E7E7"
                                    d="M36.976 0c-7.337 0-13.284 6.028-13.284 13.464v.996H50.26v-.996C50.26 6.028 44.313 0 36.976 0"
                                ></path>
                                <path
                                    fill="#CECECE"
                                    d="M39.21.19A13 13 0 0 0 36.975 0c-7.337 0-13.284 6.028-13.284 13.464v.996h4.467v-.996c0-6.664 4.777-12.197 11.05-13.273"
                                ></path>
                                <path
                                    fill="#554E56"
                                    d="M55.882 75V57.757c0-.625-.5-1.132-1.117-1.132-.616 0-1.116.507-1.116 1.132V75zM20.303 75V57.757c0-.625-.5-1.132-1.116-1.132s-1.117.507-1.117 1.132V75zM44 29.076v.954c0 1.083-.865 1.96-1.933 1.96h-.747c-.6 0-1.178-.233-1.614-.65a2.34 2.34 0 0 0-1.616-.65h-2.228c-.6 0-1.178.233-1.615.65a2.34 2.34 0 0 1-1.615.65h-.746c-1.069 0-1.934-.877-1.934-1.96v-.954c0-.707-.375-1.358-.981-1.706l-1.896-1.086v8.829c0 4.54 3.633 8.222 8.113 8.222h3.576c4.48 0 8.113-3.681 8.113-8.222v-8.83L44.98 27.37c-.606.348-.98 1-.98 1.706"
                                ></path>
                                <path
                                    fill="#433F43"
                                    d="M31.45 35.113v-3.175a1.954 1.954 0 0 1-1.498-1.907v-.955c0-.707-.375-1.358-.981-1.706l-1.896-1.086v8.829c0 4.54 3.632 8.222 8.113 8.222h3.576q.2 0 .4-.01c-4.295-.211-7.714-3.807-7.714-8.212"
                                ></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_155_2416">
                                    <path fill="#fff" d="M0 0h74v75H0z"></path>
                                </clipPath>
                            </defs>
                        </svg>
                        <h4 className="charisSIL-font font-bold text-[20px]">Experienced Practitioners</h4>
                        <p className="font-light">
                            Our team includes qualified Raqis, Islamic scholars, and counsellors with years of experience in Ruqaya and healing.
                        </p>
                    </div>
                    <div className="w-[334px] h-[263px] flex flex-col items-center gap-[27px] text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="76"
                            height="76"
                            fill="none"
                            viewBox="0 0 76 76"
                        >
                            <path
                                fill="#FFA91A"
                                d="M36.756 3.188 23.6 9.338c-1.118.522-1.805 1.714-1.724 2.988.229 3.579 1.096 10.916 4.38 16.39 4.141 6.903 9.284 8.71 11.084 9.147.434.105.884.105 1.318 0 1.8-.437 6.943-2.244 11.085-9.148 3.284-5.473 4.15-12.81 4.379-16.39.081-1.273-.606-2.465-1.724-2.987l-13.154-6.15a2.93 2.93 0 0 0-2.49 0"
                            ></path>
                            <path
                                fill="#FFC91D"
                                d="M31.212 32.799c-.15 0-.3-.056-.416-.17-1.303-1.279-2.488-2.801-3.522-4.525-2.312-3.853-3.358-8.695-3.83-12.078a.593.593 0 1 1 1.177-.164c.456 3.274 1.463 7.949 3.672 11.631.982 1.638 2.104 3.08 3.335 4.288a.594.594 0 0 1-.416 1.018M23.76 14.178a.594.594 0 0 1-.59-.54l-.017-.191a.594.594 0 0 1 1.183-.102l.016.184a.594.594 0 0 1-.592.649"
                            ></path>
                            <path
                                fill="#F79219"
                                d="m52.4 9.338-5.118-2.392c.618.613.962 1.49.904 2.411-.23 3.579-1.096 10.917-4.38 16.39-4.141 6.903-9.284 8.71-11.084 9.147a2.8 2.8 0 0 1-1.117.037c2.477 1.947 4.681 2.676 5.736 2.932.434.105.884.105 1.318 0 1.8-.437 6.943-2.244 11.085-9.148 3.284-5.473 4.15-12.81 4.38-16.39.08-1.273-.607-2.465-1.725-2.987"
                            ></path>
                            <path
                                fill="#EF7816"
                                d="M52.4 9.338 50.03 8.23a3.1 3.1 0 0 1 1.125 2.611c-.23 3.58-1.096 10.917-4.38 16.39-4.141 6.904-9.284 8.71-11.084 9.148a2.8 2.8 0 0 1-1.318 0 12 12 0 0 1-1.286-.397c1.851 1.176 3.416 1.677 4.254 1.881.435.105.884.105 1.318 0 1.8-.437 6.944-2.244 11.085-9.148 3.284-5.473 4.15-12.81 4.38-16.39.08-1.273-.607-2.465-1.725-2.987"
                            ></path>
                            <path
                                fill="#F1F2F2"
                                d="m37.124 8.293-9.259 4.328c-.787.368-1.27 1.207-1.213 2.104.16 2.519.771 7.683 3.082 11.535 2.916 4.86 6.535 6.131 7.802 6.44.306.073.622.073.928 0 1.267-.309 4.887-1.58 7.802-6.44 2.31-3.852 2.92-9.016 3.082-11.535.057-.897-.426-1.736-1.213-2.104l-9.26-4.328a2.06 2.06 0 0 0-1.75 0"
                            ></path>
                            <path
                                fill="#E6E7E8"
                                d="m48.135 12.621-5.273-2.465c.377.425.587.998.549 1.6-.161 2.519-.771 7.683-3.083 11.536-2.915 4.859-6.535 6.13-7.802 6.438q-.027.006-.054.01c2.141 2.055 4.178 2.744 5.064 2.959.306.074.622.074.928 0 1.267-.308 4.886-1.58 7.801-6.439 2.312-3.852 2.922-9.016 3.083-11.535.057-.897-.426-1.736-1.213-2.104"
                            ></path>
                            <path
                                fill="#414042"
                                d="M37.388 26.366c-.368 0-.725-.137-1-.388l-4.258-3.882a1.484 1.484 0 1 1 2-2.193l3.058 2.787 5.093-6.714a1.485 1.485 0 0 1 2.365 1.795l-6.075 8.008a1.49 1.49 0 0 1-1.183.587"
                            ></path>
                            <path
                                fill="#FCC4AE"
                                d="M44.874 50.93c.505-.185.951-.54 1.241-1.042l1.646-2.85a.297.297 0 0 0-.11-.406l-12.11-6.993a2.97 2.97 0 0 0-4.056 1.087l-1.071 1.855z"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="M53.304 38.125 30.37 51.367l10.223 17.706 9.821-5.67a12.24 12.24 0 0 0 4.543-4.59l7.719-4.457z"
                            ></path>
                            <path
                                fill="#E59076"
                                d="m54.103 57.335 7.718-4.456.852 1.476-7.718 4.456z"
                            ></path>
                            <path
                                fill="#377DE2"
                                d="m66.063 55.474 7.562-4.366-12.033-20.842-7.562 4.366a2.375 2.375 0 0 0-.87 3.245l9.659 16.728a2.375 2.375 0 0 0 3.244.869"
                            ></path>
                            <path
                                fill="#2266D3"
                                d="m54.03 34.632.157-.09 8.367 14.493a1.704 1.704 0 0 0 2.327.623l5.93-3.424 2.814 4.874-7.562 4.366a2.375 2.375 0 0 1-3.244-.87L53.16 37.878a2.375 2.375 0 0 1 .87-3.245"
                            ></path>
                            <path
                                fill="#E59076"
                                d="m54.105 57.337.852 1.475a12.24 12.24 0 0 1-4.543 4.59l-9.821 5.67-.853-1.475 9.822-5.67a12.24 12.24 0 0 0 4.543-4.59"
                            ></path>
                            <path
                                fill="#FCC4AE"
                                d="M57.158 58.022 22.696 38.125l-9.371 16.23 7.718 4.457a12.24 12.24 0 0 0 4.544 4.59l7.884 4.552 8.3 4.792a2.556 2.556 0 0 0 2.556-4.426l4.426 2.555a2.555 2.555 0 1 0 2.556-4.426l2.213 1.278a2.556 2.556 0 1 0 2.555-4.427l-1.475-.852a2.556 2.556 0 0 0 2.556-4.426"
                            ></path>
                            <path
                                fill="#377DE2"
                                d="m9.937 55.474-7.562-4.366 12.033-20.842 7.562 4.366a2.375 2.375 0 0 1 .87 3.245L13.18 54.605a2.375 2.375 0 0 1-3.244.869"
                            ></path>
                            <path
                                fill="#2266D3"
                                d="m21.97 34.632-.156-.09-8.368 14.493a1.704 1.704 0 0 1-2.327.623l-5.93-3.424-2.814 4.874 7.562 4.366a2.375 2.375 0 0 0 3.244-.87l9.658-16.727a2.375 2.375 0 0 0-.87-3.245"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="M52.544 69.085c-.8.659-1.95.796-2.9.248l-9.776-5.643-.89 1.542 9.775 5.644a2.556 2.556 0 0 0 3.491-.936c.157-.272.25-.562.3-.855M57.313 65.936c-.8.66-1.95.797-2.9.248l-11.989-6.921-.89 1.542 11.988 6.922a2.555 2.555 0 0 0 3.491-.935 2.5 2.5 0 0 0 .3-.856M58.393 60.658c-.8.659-1.95.796-2.9.248l-10.513-6.07-.89 1.543 10.512 6.07a2.556 2.556 0 0 0 3.491-.936 2.5 2.5 0 0 0 .3-.855M13.324 54.356l.851-1.475 7.719 4.456-.852 1.475zM42.662 71.204l-16.223-9.277a12.24 12.24 0 0 1-4.544-4.59l-.851 1.475a12.24 12.24 0 0 0 4.543 4.59l16.184 9.345a2.556 2.556 0 0 0 3.491-.936c.158-.272.25-.562.3-.856-.8.66-1.95.797-2.9.249"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="m34.23 72.747 3.873-2.237a2.556 2.556 0 0 0-2.556-4.426l-3.873 2.236a2.556 2.556 0 0 0 2.555 4.427"
                            ></path>
                            <path
                                fill="#E59076"
                                d="m37.25 69.035-3.873 2.236a2.55 2.55 0 0 1-2.93-.276c.052.28.14.556.29.816a2.556 2.556 0 0 0 3.492.936l3.873-2.236a2.556 2.556 0 0 0 .936-3.491 2.5 2.5 0 0 0-.562-.66 2.55 2.55 0 0 1-1.226 2.675"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="m27.247 70.876 7.562-4.366a2.556 2.556 0 0 0-2.555-4.427l-7.562 4.366a2.556 2.556 0 0 0 2.555 4.427"
                            ></path>
                            <path
                                fill="#E59076"
                                d="M33.957 65.034 26.395 69.4a2.55 2.55 0 0 1-2.93-.276c.052.28.14.556.29.816a2.556 2.556 0 0 0 3.492.936l7.562-4.366a2.556 2.556 0 0 0 .935-3.49 2.5 2.5 0 0 0-.561-.66 2.55 2.55 0 0 1-1.226 2.674"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="m22.478 67.727 9.037-5.218a2.556 2.556 0 0 0-2.555-4.426L19.922 63.3a2.556 2.556 0 0 0 2.556 4.426"
                            ></path>
                            <path
                                fill="#E59076"
                                d="m30.664 61.034-9.038 5.217a2.55 2.55 0 0 1-2.93-.276c.052.28.14.556.291.817a2.556 2.556 0 0 0 3.491.935l9.037-5.218a2.556 2.556 0 0 0 .936-3.49 2.5 2.5 0 0 0-.561-.66 2.55 2.55 0 0 1-1.226 2.675"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="m21.398 62.449 6.824-3.94a2.556 2.556 0 0 0-2.555-4.427l-6.825 3.94a2.556 2.556 0 0 0 2.556 4.427"
                            ></path>
                            <path
                                fill="#E59076"
                                d="m27.37 57.033-6.824 3.94a2.55 2.55 0 0 1-2.93-.276c.052.28.14.556.291.816a2.556 2.556 0 0 0 3.491.936l6.824-3.94a2.556 2.556 0 0 0 .936-3.492 2.5 2.5 0 0 0-.562-.659 2.55 2.55 0 0 1-1.226 2.675"
                            ></path>
                            <path
                                fill="#FFD2C0"
                                d="m27.388 58.006.598-.345c.71-.41.953-1.318.543-2.028l-.219-.38a1.485 1.485 0 0 0-2.028-.543l-.598.346a.594.594 0 0 0-.217.81l1.11 1.923a.594.594 0 0 0 .811.217M30.682 62.007l.598-.346c.71-.41.953-1.317.543-2.027l-.22-.38a1.484 1.484 0 0 0-2.027-.543l-.863.498a.29.29 0 0 0-.105.393l1.263 2.188a.593.593 0 0 0 .81.217M33.975 66.008l.598-.346c.71-.41.953-1.318.543-2.027l-.22-.38a1.484 1.484 0 0 0-2.027-.544l-.598.346a.594.594 0 0 0-.217.81l1.11 1.923a.594.594 0 0 0 .81.217M37.269 70.008l.597-.345c.71-.41.954-1.318.544-2.028l-.22-.38a1.484 1.484 0 0 0-2.027-.543l-.598.345a.594.594 0 0 0-.218.811l1.11 1.923a.594.594 0 0 0 .812.217"
                            ></path>
                            <path
                                fill="#F2AD97"
                                d="m35.443 49.421 10.569-6.102-1.497-2.593a2.97 2.97 0 0 0-4.056-1.087l-12.111 6.993a.297.297 0 0 0-.109.405l.31.537a5.047 5.047 0 0 0 6.894 1.847"
                            ></path>
                            <path
                                fill="#FFD2C0"
                                d="m32.555 47.051 1.355-.782a.85.85 0 0 0 .312-1.164l-.808-1.398-3.848 2.221.22.382c.56.969 1.8 1.301 2.769.741"
                            ></path>
                        </svg>
                        <h4 className="charisSIL-font font-bold text-[20px]">Authentic & Trusted</h4>
                        <p className="font-light">
                            From self-Ruqaya guides to personal counselling and prophetic remedies, we cover every step of your healing journey.
                        </p>
                    </div>
                </div>
            </section>

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
                                                labelText={'Select Date'}
                                                availableDates={uniqueDateStrings}
                                                onChangeHandler={(date) => {
                                                    const formattedDate = handleDateChange(date);
                                                    field.onChange(formattedDate);
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
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleTimeClick(time)}
                                                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedTime === time
                                                        ? "bg-[#2e3e23] text-white"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {convertTo12HourFormat(time)}
                                                </button>
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
                                            {availableConsultants?.map((consultant, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleConsultantClick(consultant)}
                                                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedConsultant === consultant
                                                        ? "bg-[#2e3e23] text-white"
                                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {consultant}
                                                </button>
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
                                            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${showTransactionField
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
                                            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${!showTransactionField
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
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Pay 500 TK to <strong>017xxxxx (Bkash)</strong> to confirm your booking.
                                            </p>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                Transaction Number
                                            </label>
                                            <input
                                                {...register("transactionNumber")}
                                                type="text"
                                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                                placeholder="Enter transaction number"
                                            />
                                            {errors.transactionNumber && (
                                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                                    {errors.transactionNumber.message}
                                                </p>
                                            )}
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
                                    className="w-full p-3 bg-[#2e3e23] text-white rounded-lg font-medium hover:bg-[#4a5e3a] transition-colors"
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

export default BookAppointment;