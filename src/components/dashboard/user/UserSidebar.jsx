'use client'
import { BookSVG, CartSVG, CrossSVG, MenuSVG, SettingsSVG, UserSVG } from "@/components/svg/SvgCollection";
import { usePathname, useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { useState } from "react";

const UserSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sidebarVariants = {
        open: { width: 280 },
        closed: { width: 80 }
    };

    const navItems = [
        { name: 'Dashboard', icon: <UserSVG />, path: '/dashboard' },
        { name: 'Courses', icon: <BookSVG />, path: '/dashboard/c' },
        { name: 'Orders', icon: <CartSVG />, path: '/dashboard/o' },
        { name: 'Settings', icon: <SettingsSVG />, path: '/dashboard/settings' }
    ];
    if(pathname.includes("/dashboard/c/")){
        return null
    }

    return (
        <motion.div
            initial="open"
            animate={isSidebarOpen ? 'open' : 'closed'}
            variants={sidebarVariants}
            className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-r-3xl overflow-hidden transition-colors duration-300"
        >
            <div className="flex items-center justify-between p-6">
                {isSidebarOpen ? (
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    >
                        SukunDash
                    </motion.h1>
                ) : null}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {isSidebarOpen ? <CrossSVG /> : <MenuSVG/>}
                </button>
            </div>

            <div className="flex-1 flex flex-col p-4 space-y-4">
                {navItems.map((item) => (
                    <motion.button
                        key={item.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(item.path)}
                        className={`flex items-center space-x-4 p-4 rounded-2xl ${pathname === item.path
                            ? 'bg-purple-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {isSidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-medium"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
export default UserSidebar;