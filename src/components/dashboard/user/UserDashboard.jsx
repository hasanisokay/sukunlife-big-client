'use client'
import { BookSVG, CartSVG } from '@/components/svg/SvgCollection';
import { SERVER } from '@/constants/urls.mjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';


const UserDashboard = () => {
    const enrolledCourses = useSelector((state) => state.user.enrolledCourses);
    const [userOrders, setUserOrders] = useState(0);
    useEffect(() => {
        (async () => {
            const res = await fetch(`${SERVER}/api/user/user-orders?countOnly=true`, {
                credentials: 'include'
            })
            const data = await res.json();
            if (data.status === 200) {
                setUserOrders(data?.count)
            } else {
                setUserOrders(0)
            }
        })()
    }, [])
    return (
        <div className='w-full min-w-[200px]'>
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-r from-pink-500 to-orange-400 p-6 rounded-2xl text-white"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-75">Total Orders</p>
                            <p className="text-3xl font-bold">{userOrders}</p>
                        </div>
                        <CartSVG />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default UserDashboard;