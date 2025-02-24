import { motion } from 'framer-motion';

const CourseDetailsModal2 = ({ isOpen, onClose, course }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/3"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
            >
                <h2 className="text-xl font-semibold mb-4">{course?.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">Students: {course?.students}</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
};

export default CourseDetailsModal2;