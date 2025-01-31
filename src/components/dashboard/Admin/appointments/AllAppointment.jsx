'use client';
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Spinner2 from "@/components/loaders/Spinner2";
import { Flip, toast, ToastContainer } from "react-toastify";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { SERVER } from "@/constants/urls.mjs";
import AppointmentCard from "./AppointmentCard";
import LoadMoreButton from "@/components/ui/btn/LoadMoreButton";


const AllAppointment = ({ a, page, limit }) => {
    const [appointments, setAppointments] = useState(a?.appointments || []);
    const [selectedIds, setSelectedIds] = useState([]);
    const memorizedAppointments = useMemo(() => appointments, [appointments]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setAppointments(a?.appointments);
    }, [a]);

    // Handle selection of appointments for bulk delete
    const handleSelect = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((selectedId) => selectedId !== id)
                : [...prevSelectedIds, id]
        );
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
                toast.error(data?.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 w-full min-h-screen">
            <div className="mx-auto">
                {/* Bulk Delete Button */}
                <div className="min-h-[56px] mb-4 text-center">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Delete Selected ({selectedIds.length})
                        </button>
                    )}
                </div>
                {loading && <Spinner2 loadingText={"Please Wait..."} />}
                {/* Appointments List */}
                <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {memorizedAppointments?.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                isSelected={selectedIds.includes(appointment._id)}
                                onSelect={handleSelect}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            {
                memorizedAppointments?.length < a?.totalCount && <LoadMoreButton page={page} limit={limit}/>
            }
            {selectedIds.length > 0 && showDeleteModal && (
                <DeleteConfirmationModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleBulkDelete}
                    subHeading={`You are about to delete ${selectedIds.length} appointments. Once deleted, they cannot be recovered.`}
                    headingText={'Are you sure you want to delete?'}
                />
            )}
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default AllAppointment;