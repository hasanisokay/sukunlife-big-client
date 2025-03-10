'use client'
import React, { useState, useMemo, useEffect } from "react";
import SearchBar from "../search/SearchBar";
import PaginationDefault from "../paginations/PaginationDefault";
import { SERVER } from "@/constants/urls.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";
import SortOrders from "./SortOrders";
import formatDate from "@/utils/formatDate.mjs";
import approveOrder from "@/server-functions/approveOrder.mjs";
import deleteBulkOrders from "@/server-functions/deleteBulkOrders.mjs";

const OrdersPage = ({ orders: initialOrders, page, limit, filter }) => {
    const [sortType, setSortType] = useState("all"); // 'all', 'course', 'product'
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [orders, setOrders] = useState(initialOrders?.orders); // Local state for orders

    let totalCount = initialOrders?.totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Filter orders based on sort type
    const filteredOrders = useMemo(() => {
        if (sortType === "all") return orders;
        return orders?.filter((order) =>
            order.cartItems.some((item) => item.type === sortType)
        );
    }, [orders, sortType]);
    useEffect(() => { setOrders(initialOrders?.orders) }, [initialOrders])
    // Handle approve order
    const handleApproveOrder = async (orderId) => {
        try {
            // Find the order in the local state
            const order = orders.find((order) => order._id === orderId);

            if (!order) {
                toast.error("Order not found");
                return;
            }


            const courseIds = order.cartItems
                .filter((item) => item.type === "course") 
                .map((item) => ({ courseId: item._id, title: item.title })); 


            const userId = order.userId;

            // Prepare the request body
            const body = {};
            if (courseIds.length > 0) body.courseIds = courseIds;
            if (userId) body.userId = userId;

            // Send the PUT request to approve the order
            const resData = await approveOrder(orderId, body);
            if (resData?.status === 200) {
                toast.success(resData?.message);

                // Optionally, update the local state to reflect the approved status
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, status: "approved" } : order
                    )
                );
            } else {
                toast.error(resData?.message);
            }
        } catch (error) {

            toast.error("An error occurred while approving the order");
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            const resData = await deleteBulkOrders(selectedOrders );
            if (resData.status === 200) {
                // Remove deleted orders from the local state
                setOrders((prevOrders) =>
                    prevOrders.filter((order) => !selectedOrders.includes(order._id))
                );
                setSelectedOrders([]);
                toast.success(resData?.message);
            } else {
                toast.error(resData.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the orders");
        }
    };

    // Toggle order selection for bulk delete
    const toggleOrderSelection = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <div className="flex justify-between items-center md:gap-0 gap-3 flex-wrap">
                <SearchBar placeholder={"Search order"} />
                <SortOrders filter={filter} />
            </div>
            {/* Sorting Controls */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSortType("all")}
                    className={`px-4 py-2 rounded ${sortType === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                >
                    All Orders
                </button>
                <button
                    onClick={() => setSortType("course")}
                    className={`px-4 py-2 rounded ${sortType === "course"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                >
                    Courses
                </button>
                <button
                    onClick={() => setSortType("product")}
                    className={`px-4 py-2 rounded ${sortType === "product"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                >
                    Products
                </button>
            </div>

            {/* Bulk Delete Button */}
            <div className="h-[60px]">
                {selectedOrders?.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="mb-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete Selected Orders
                    </button>
                )}

            </div>
            <p className="p-1 font-semibold text-sm ">Showing {filteredOrders?.length} order.</p>
            {selectedOrders.length > 0 && <p className="p-1 font-semibold text-sm text-right">Selected {selectedOrders?.length} order.</p>
            }
            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders?.map((order, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">{order.name}</h2>
                            <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => toggleOrderSelection(order._id)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.email} | {order.phone}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Address: {order.address}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Transaction ID: {order?.transactionId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Date: {formatDate(order?.date)}
                        </p>
                        <div className="mt-4">
                            {order?.cartItems?.map((item, i) => (
                                <div key={i} className="flex gap-4 mb-2">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.type === "product"
                                                ? `Size: ${item?.size || "Default"}, Color: ${item?.color || "Default"}`
                                                : "Course"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Price: &#2547;{item.price} x {item.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total: &#2547;{order.finalTotalPrice}
                            </p>
                            {order.status === "pending" && (
                                <button
                                    onClick={() => handleApproveOrder(order._id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Approve
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <PaginationDefault p={page} totalPages={totalPages} />
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default OrdersPage