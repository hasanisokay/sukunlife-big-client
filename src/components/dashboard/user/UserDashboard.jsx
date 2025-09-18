'use client'
import Link from 'next/link';
import { BookSVG, CartSVG, AppointmentSVG } from '@/components/svg/SvgCollection';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import getUserOrders from '@/utils/getUserOrders.mjs';
import logOut from "@/utils/logOut.mjs";
import { setUserData } from "@/store/slices/authSlice";
const UserDashboard = () => {
    const enrolledCourses = useSelector((state) => state.user.enrolledCourses);
    const [userOrderCount, setUserOrderCount] = useState(0);
    const [userAppointmentCount, setUserAppointmentCount] = useState(0);
    const dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            const data = await getUserOrders(false, true)
            if (data.status === 200) {
                setUserOrderCount(data?.orderCount)
                setUserAppointmentCount(data?.appointmentCount)
            } else {
                setUserOrderCount(0)
                setUserAppointmentCount(0)
            }
        })()
    }, [])
    const handleLogOut = async () => {
        await fetch("/api/logout")
        await logOut();
        dispatch(setUserData(null));
        window.location.reload();
    };
    return (
        <div className='w-full min-w-[200px]'>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold dark:text-white">Dashboard Overview</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-log-out"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="font-medium">Logout</span>
                </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link href={'/dashboard/c'} passHref>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-2xl text-white"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-75">Enrolled Courses</p>
                                <p className="text-3xl font-bold">{enrolledCourses?.length || 0}</p>
                            </div>
                            <BookSVG />
                        </div>
                    </motion.div>
                </Link>

                <Link href={'/dashboard/o'} passHref>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-r from-pink-500 to-orange-400 p-6 rounded-2xl text-white"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-75">Total Orders</p>
                                <p className="text-3xl font-bold">{userOrderCount}</p>
                            </div>
                            <CartSVG />
                        </div>
                    </motion.div>
                </Link>

                <Link href={'/dashboard/a'} passHref>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-r from-green-500 to-teal-400 p-6 rounded-2xl text-white"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-75">Appointments</p>
                                <p className="text-3xl font-bold">{userAppointmentCount}</p>
                            </div>
                            <AppointmentSVG />
                        </div>
                    </motion.div>
                </Link>

            </div>
        </div>
    );
}

export default UserDashboard;