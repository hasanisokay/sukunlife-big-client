'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rating } from 'react-simple-star-rating';
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';


const UserAppointmentPage = ({ initialOrders }) => {
    const [appointments, setAppointments] = useState(initialOrders);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const currentDate = new Date('2025-03-09');
    const user = useSelector((state) => state.user.userData);

    const handleReviewSubmit = async () => {
        if (!selectedAppointment || !user) return;
        try {
            const response = await fetch(`${SERVER}/api/user/appointment-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    appointmentId: selectedAppointment?._id,
                    rating: rating, 
                    comment: reviewComment,
                    userId: user._id,
                    name: user.name,
                }),
            });
            const resData = await response.json();

            if (resData.status === 200) {
                toast.success(resData?.message)
                setAppointments(prev => prev.map(app =>
                    app._id === selectedAppointment._id
                        ? { ...app, reviewed: true }
                        : app
                ));
                setShowReviewModal(false);
                setRating(5);
                setReviewComment('');
            } else {
                toast.error(resData?.message)
            }
        } catch (error) {
            toast.error("ERROR")
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 dark:text-white">Your Appointments</h2>

            <div className="space-y-6">
                {appointments.map((appointment) => {
                    const bookedDate = new Date(appointment.bookedDate);
                    const showReview = (!appointment.reviewed && bookedDate < currentDate) || false;

                    return (
                        <motion.div
                            key={appointment._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                        {appointment.service}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Date:</span> {appointment.date}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Time:</span> {appointment.time}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Address:</span> {appointment.address}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Problem:</span> {appointment.problem}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Advance Payment:</span>
                                        {appointment.advancePayment ? ' True' : ' False'}
                                    </p>
                                    {appointment.transactionNumber && (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Transaction:</span> {appointment.transactionNumber}
                                        </p>
                                    )}
                                    {appointment.consultant && (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Consultant:</span> {appointment.consultant}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {showReview && (
                                <button
                                    onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setShowReviewModal(true);
                                    }}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Leave a Review
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Review Appointment</h3>

                        <div className="mb-4">
                            <Rating
                                onClick={(rate) => setRating(rate)}
                                ratingValue={rating}
                                initialValue={rating}
                                size={24}
                                fillColor="#FFD700"
                                emptyColor="#D1D5DB"
                            />
                        </div>

                        <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Write your review..."
                            className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
                            rows={4}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer transition={Flip}/>
        </div>
    );
};

export default UserAppointmentPage;