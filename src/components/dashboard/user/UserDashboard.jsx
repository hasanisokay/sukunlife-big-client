'use client'
import Link from 'next/link';
import { BookSVG, CartSVG, AppointmentSVG } from '@/components/svg/SvgCollection';
import { SERVER } from '@/constants/urls.mjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import getUserOrders from '@/utils/getUserOrders.mjs';

const UserDashboard = () => {
    const enrolledCourses = useSelector((state) => state.user.enrolledCourses);
    const [userOrderCount, setUserOrderCount] = useState(0);
    const [userAppointmentCount, setUserAppointmentCount] = useState(0);

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

    return (
        <div className='w-full min-w-[200px]'>
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Dashboard Overview</h2>

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