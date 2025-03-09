// components/AppointmentCard.js
import convertTo12HourFormat from "@/utils/convertTo12HourFormat.mjs";
import { motion } from "framer-motion";
import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import { SERVER } from '@/constants/urls.mjs';
import formatDate from "@/utils/formatDate.mjs";

const AppointmentCard = ({ appointment, isSelected, onSelect }) => {
    const [showViewReviewModal, setShowViewReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState(null);

    const handleViewReview = async () => {
        try {
            const response = await fetch(`${SERVER}/api/admin/appointments/review/${appointment._id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setReviewData(data.review);
                setShowViewReviewModal(true);
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        }
    };
    const handleDelteAppointmentReview = async () => {
        try {
            const response = await fetch(`${SERVER}/api/admin/appointments/review/${appointment._id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setReviewData(null);
                setShowViewReviewModal(true);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        }
    }

    return (
        <>
            <motion.div
                key={appointment?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 whitespace-pre-wrap text-wrapped max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md ${isSelected ? "border-2 border-blue-500" : "border border-gray-200 dark:border-gray-700"}`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {appointment?.name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment?.mobile}
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(appointment?._id)}
                        className="w-5 h-5 text-blue-500 rounded"
                    />
                </div>
                <div className="mt-4 space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Service:</span> {appointment?.service.label}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Address:</span> {appointment?.address}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Date:</span> {appointment?.date}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Consultant:</span> {appointment?.consultant || "any"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Time:</span> {convertTo12HourFormat(appointment?.time)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Problem:</span> {appointment?.problem}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Advance Payment:</span> {appointment?.advancePayment ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Reviewed:</span> {appointment?.reviewed ? "Yes" : "No"}
                    </p>
                    {appointment.advancePayment && (
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Transaction ID:</span> {appointment?.transactionNumber}
                        </p>
                    )}
                    {appointment?.loggedInUser && (
                        <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Booked By:</span> {appointment?.loggedInUser?.name}
                        </p>
                    )}
                    {appointment?.reviewed && (
                        <button
                            onClick={handleViewReview}
                            className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                            See Review
                        </button>
                    )}
                </div>
            </motion.div>

            {/* View Review Modal */}
            {showViewReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">User Review</h3>

                        {reviewData ? (
                            <>
                                <div className="mb-4">
                                    <Rating

                                        ratingValue={reviewData.rating}
                                        initialValue={reviewData.rating}
                                        size={24}
                                        fillColor="#FFD700"
                                        emptyColor="#D1D5DB"
                                        readonly
                                    />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {reviewData?.comment}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Date: {formatDate(reviewData?.date)}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Loading review...
                            </p>
                        )}

                        <div className="flex justify-end items-center gap-4 ">
                            <button
                                onClick={() => setShowViewReviewModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDelteAppointmentReview}
                                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-700 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppointmentCard;