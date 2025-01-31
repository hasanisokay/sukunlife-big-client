// components/AppointmentCard.js
import convertTo12HourFormat from "@/utils/convertTo12HourFormat.mjs";
import { motion } from "framer-motion";

const AppointmentCard = ({ appointment, isSelected, onSelect }) => {
    return (
        <motion.div
            key={appointment?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`p-6 whitespace-pre-wrap text-wrapped max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md ${isSelected ? "border-2 border-blue-500" : "border border-gray-200 dark:border-gray-700"
                }`}
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
                    <span className="font-medium">Time:</span> {convertTo12HourFormat(appointment?.time)}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Problem:</span> {appointment?.problem}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Advance Payment:</span> {appointment?.advancePayment ? "Yes" : "No"}
                </p>
                {
                    appointment.advancePayment && <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Transaction ID:</span> {appointment?.transactionNumber}
                    </p>
                }
                {appointment?.loggedInUser && (
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Booked By:</span> {appointment?.loggedInUser?.name}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default AppointmentCard;