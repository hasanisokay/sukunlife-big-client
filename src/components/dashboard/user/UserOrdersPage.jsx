'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rating } from 'react-simple-star-rating';
import formatDate from '@/utils/formatDate.mjs';
import { useSelector } from 'react-redux';
import { SERVER } from '@/constants/urls.mjs';
import { toast, ToastContainer } from 'react-toastify';

const UserOrdersPage = ({ initialOrders }) => {
    const [orders, setOrders] = useState(initialOrders); // Local state for orders
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(5); // Default rating set to 5
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useSelector((state) => state.user.userData);

    const handleReviewSubmit = async () => {
        if (!selectedProduct) return;

        try {
            const response = await fetch(`${SERVER}/api/user/submit-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: selectedProduct._id,
                    orderId: selectedProduct.orderId,
                    type: selectedProduct.type,
                    userId: user._id,
                    name: user.name,
                    comment: review,
                    rating,
                }),
            });

            const data = await response.json();

            if (data.status === 200) {
                // Update the local state to reflect the reviewed status
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === selectedProduct.orderId
                            ? {
                                ...order,
                                cartItems: order.cartItems.map((item) =>
                                    item._id === selectedProduct._id
                                        ? { ...item, reviewed: true }
                                        : item
                                ),
                            }
                            : order
                    )
                );

                setIsModalOpen(false);
                setReview('');
                setRating(5);
                toast.success(data.message)
            } else {
                // console.error('Failed to submit review');
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("ERROR")
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
            {orders.map((order) => (
                <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
                >
                    <h2 className="text-xl font-semibold mb-4">{formatDate(order.date)}</h2>
                    <p className="text-gray-700 dark:text-gray-400">Status: {order.status}</p>
                    <p className="text-gray-700 dark:text-gray-400">Total Price: ৳{order.finalTotalPrice}</p>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Items:</h3>
                        {order.cartItems.map((item) => (
                            <div key={item._id} className="mt-2 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                <p className="text-gray-900 dark:text-white">
                                    {item.title} - ৳{item.price} (Quantity: {item.quantity})
                                </p>
                                {order.status === 'approved' && !item?.reviewed && (
                                    <button
                                        onClick={() => {
                                            setSelectedProduct({ ...item, orderId: order._id });
                                            setIsModalOpen(true);
                                        }}
                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Leave a Review
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 max-w-md"
                    >
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Leave a Review</h2>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded mb-4"
                            rows="4"
                            placeholder="Write your review..."
                        />
                        <div className="mb-4">
                            <Rating
                                onClick={(rate) => setRating(rate)}
                                ratingValue={rating} // Default rating set to 5
                                size={25}
                                transition
                                fillColor="#fbbf24"
                                emptyColor="#d1d5db"
                                className="dark:fill-yellow-400 dark:empty-gray-600"
                                initialValue={5} // Set initial value to 5
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            <ToastContainer />
        </div>
    );
};

export default UserOrdersPage;