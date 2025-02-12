'use client'
import SidebarSVG from "@/components/svg/SidebarSVG";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AdminSidebar = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);

    const toggleMenu = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const currentPath = usePathname();

    useEffect(() => {
        try {
            const currentPathArray = currentPath.split("/");
            if (activeMenu) return;
            if (currentPathArray.length > 2) {
                setActiveMenu(currentPathArray[2])
            }
        } catch {
            console.error('error setting active menu.')
        }
    }, [currentPath])

    const pathStyles = (path) => {
        if (path === currentPath) {
            return "bg-[#14ae36] text-white block px-4 py-2 rounded-lg"
        } else {
            return "block px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
        }
    }

    // Function to close the sidebar when a menu item is clicked
    const handleMenuItemClick = () => {
        if (isSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <div 
        className={`${isSidebarOpen ? "w-full z-10 md:min-w-64 md:w-64  md:relative fixed md:min-h-full min-h-fit bg-gray-200 dark:bg-gray-800":"max-w-0 md:w-0 h-0 min-h-0 max-h-0 bg-none"}`}
        >
            {!isSidebarOpen && <button
                onClick={toggleSidebar}
                className="fixed opacity-30 hover:opacity-100"
            >
                <SidebarSVG transform={false}/>
            </button>}
            <nav
                className={`bg-gray-200 dark:bg-gray-800 p-4 space-y-4 fixed  left-0 h-fit  md:w-64 w-full z-50 transform  transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="relative">
                    <button
                        onClick={toggleSidebar}
                        className="absolute right-0 -top-4"
                    >
                        <SidebarSVG transform={true} />
                    </button>
                </div>
                <Link href="/dashboard" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard")}`}>Dashboard</Link>
                <Link href="/dashboard/vouchers" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/vouchers")}`}>Vouchers</Link>
                <Link href="/dashboard/orders" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/orders")}`}>Orders</Link>
                <div>
                    <button
                        onClick={() => toggleMenu('shop')}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                        Shop
                    </button>
                    {activeMenu === 'shop' && (
                        <div className="ml-4 space-y-2">
                            <Link href="/dashboard/shop" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/shop")}`}>All Items</Link>
                            <Link href="/dashboard/shop/add" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/shop/add")}`}>Add Items</Link>
                            <Link href="/dashboard/shop/pending" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/shop/pending")}`}>Pending Orders</Link>
                        </div>
                    )}
                </div>

                <div>
                    <button
                        onClick={() => toggleMenu('blogs')}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                        Blogs
                    </button>
                    {activeMenu === 'blogs' && (
                        <div className="ml-4 space-y-2">
                            <Link href="/dashboard/blogs" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/blogs")}`}>All Blogs</Link>
                            <Link href="/dashboard/blogs/add" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/blogs/add")}`}>Add Blog</Link>
                            {/* <Link href="/dashboard/blogs/edit" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/blogs/edit")}`}>Ed Blog</Link> */}
                        </div>
                    )}
                </div>

                <div>
                    <button
                        onClick={() => toggleMenu('courses')}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                        Courses
                    </button>
                    {activeMenu === 'courses' && (
                        <div className="ml-4 space-y-2">
                            <Link href="/dashboard/courses" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/courses")}`}>All Courses</Link>
                            <Link href="/dashboard/courses/add" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/courses/add")}`}>Add Course</Link>
                        </div>
                    )}
                </div>

                <div>
                <Link href="/dashboard/users" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/users")}`}>Users</Link>
                </div>

                <div>
                    <button
                        onClick={() => toggleMenu('appointments')}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                        Appointments
                    </button>
                    {activeMenu === 'appointments' && (
                        <div className="ml-4 space-y-2">
                            <Link href="/dashboard/appointments" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/appointments")}`}>All Appointments</Link>
                            <Link href="/dashboard/appointments/schedule" onClick={handleMenuItemClick} className={` ${pathStyles("/dashboard/appointments/schedule")}`}>Schedule Management</Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;
