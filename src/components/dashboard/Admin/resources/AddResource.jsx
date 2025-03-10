'use client';
import { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { SERVER } from '@/constants/urls.mjs';
import { toast, ToastContainer } from 'react-toastify';
import addNewResource from '@/server-functions/addNewResource.mjs';

const AddResource = () => {
    // State to track selected resource type
    const [selectedType, setSelectedType] = useState(null);

    // State to manage resource data
    const [resource, setResource] = useState({
        title: '',
        description: '',
        links: [''],
    });

    // State for API feedback
    const [status, setStatus] = useState('');

    // Handle input changes for title and links
    const handleInputChange = (field, value, index = null) => {
        setResource((prev) => {
            const updatedResource = { ...prev };
            if (field === 'title') {
                updatedResource.title = value;
            } else if (field === 'links' && index !== null) {
                updatedResource.links[index] = value;
            }
            return updatedResource;
        });
    };

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (content) => {
        setResource((prev) => ({ ...prev, description: content }));
    };

    // Add a new link input
    const addLink = () => {
        setResource((prev) => ({
            ...prev,
            links: [...prev.links, ''],
        }));
    };

    // Remove a link input
    const removeLink = (index) => {
        setResource((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!resource.title || !resource.description || resource.links.some(link => !link)) {
            setStatus(`Please fill all fields for ${selectedType} resource.`);
            return;
        }

        try {
            setStatus(`Saving ${selectedType} resource...`);
            const resData = await addNewResource(selectedType, resource?.title, resource?.description, resource?.links);
            if (resData?.status === 200) {
                toast.success(resData?.message);
                setStatus(`${selectedType} resource saved successfully!`);
                setResource({ title: '', description: '', links: [''] });
                setSelectedType(null);

            } else {
                toast.error(resData?.message)
            }

        } catch (error) {
            toast.error(`Error saving ${selectedType} resource: ${error.message}`)
            setStatus(`Error saving ${selectedType} resource: ${error.message}`);
        }
    };

    // Handle back to selection
    const handleBack = () => {
        setSelectedType(null);
        setResource({ title: '', description: '', links: [''] });
        setStatus('');
    };

    return (
        <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
            <div className="min-w-full">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Add New Resource
                </h1>

                {!selectedType ? (
                    // Selection Screen
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <button
                            onClick={() => setSelectedType('pdf')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">PDF Resource</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new PDF document</p>
                        </button>
                        <button
                            onClick={() => setSelectedType('video')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Video Resource</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new video</p>
                        </button>
                        <button
                            onClick={() => setSelectedType('audio')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Audio Resource</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new audio file</p>
                        </button>
                    </div>
                ) : (
                    // Form for Selected Type
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            {selectedType === 'pdf' && 'PDF Resource'}
                            {selectedType === 'video' && 'Video Resource'}
                            {selectedType === 'audio' && 'Audio Resource'}
                        </h2>

                        {/* Status Message */}
                        {status && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{status}</p>
                        )}

                        <input
                            type="text"
                            placeholder={`${selectedType} Title`}
                            value={resource.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full p-2 mb-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                        <RichTextEditor
                            onContentChange={handleDescriptionChange}
                            initialContent={resource.description}
                            uniqueKey={`${selectedType}-editor`}
                        />
                        <div className="mt-4">
                            {resource.links.map((link, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="url"
                                        placeholder={`${selectedType} Link`}
                                        value={link}
                                        onChange={(e) => handleInputChange('links', e.target.value, index)}
                                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                    {resource.links.length > 1 && (
                                        <button
                                            onClick={() => removeLink(index)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addLink}
                                className="mt-2 text-blue-500 hover:text-blue-700"
                            >
                                + Add Another Link
                            </button>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={handleBack}
                                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`py-2 px-4 rounded-md text-white ${selectedType === 'pdf'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : selectedType === 'video'
                                        ? 'bg-blue-500 hover:bg-blue-600'
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                Save {selectedType} Resource
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddResource;