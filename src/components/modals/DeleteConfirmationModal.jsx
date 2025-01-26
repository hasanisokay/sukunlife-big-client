const DeleteConfirmationModal = ({onClose, onConfirm, headingText, subHeading}) => {
    return (
        <div  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                    {headingText || 'Are you sure you want to delete this?'}
                </h3>
                <p className="mb-4 text-gray-800 dark:text-gray-300">
                   {subHeading}
                </p>
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Yes, Delete
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;