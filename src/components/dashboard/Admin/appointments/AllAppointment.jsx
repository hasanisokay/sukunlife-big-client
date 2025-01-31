'use client'
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner2 from "@/components/loaders/Spinner2";
import { Flip, toast, ToastContainer } from "react-toastify";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { SERVER } from "@/constants/urls.mjs";

const AllAppointment = ({ a }) => {
    const [appointments, setAppointments] = useState(a);
    const [selectedIds, setSelectedIds] = useState([]);
    const memorizedAppointments = useMemo(() => appointments, [appointments]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    useEffect(() => {
        setAppointments(a)
    }, [a])
    // Handle selection of appointments for bulk delete
    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        const updatedAppointments = appointments.filter(
            (appointment) => !selectedIds.includes(appointment._id)
        );
        setShowDeleteModal(false);
        setLoading(true);
        try {
            const res = await fetch(`${SERVER}/api/admin/appointments`, {
                credentials: 'include',
                method: "DELETE",
                body: JSON.stringify({ ids: selectedIds }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.status === 200) {
                toast.success(data?.message);
                setAppointments(updatedAppointments);
                setSelectedIds([]);
            } else {
                toast.error(data?.message)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 w-full min-h-screen">
            <div className=" mx-auto">
                {/* Bulk Delete Button */}
                <div className="min-h-[56px]">
                    {selectedIds?.length > 0 && (
                        <button
                            onClick={()=>setShowDeleteModal(true)}
                            className="mb-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Delete Selected ({selectedIds.length})
                        </button>
                    )}
                </div>
                {loading && <Spinner2 loadingText={"Please Wait..."} />}
                {/* Appointments List */}
                <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {memorizedAppointments?.map((appointment) => (
                            <motion.div
                                key={appointment._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`p-6 max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-md ${selectedIds.includes(appointment._id)
                                    ? "border-2 border-blue-500"
                                    : "border border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                            {appointment.name}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {appointment.mobile}
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(appointment._id)}
                                        onChange={() => handleSelect(appointment._id)}
                                        className="w-5 h-5 text-blue-500 rounded"
                                    />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Service:</span>{" "}
                                        {appointment.service.label}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Address:</span>{" "}
                                        {appointment.address}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Date:</span>{" "}
                                        {appointment.date}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Time:</span>{" "}
                                        {appointment.time}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Problem:</span>{" "}
                                        {appointment.problem}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Advance Payment:</span>{" "}
                                        {appointment.advancePayment ? "Yes" : "No"}
                                    </p>
                                    {appointment.loggedInUser && (
                                        <p className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Booked By:</span>{" "}
                                            {appointment.name}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            {selectedIds?.length > 0 && showDeleteModal && <DeleteConfirmationModal
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleBulkDelete}
                subHeading={`You are about to delete ${selectedIds?.length} appointments. Once delete, cannot be recovered.`}
                headingText={'Are you sure you want to delete?'} />}
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default AllAppointment;