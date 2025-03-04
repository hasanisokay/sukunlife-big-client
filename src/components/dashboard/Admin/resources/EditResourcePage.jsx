'use client';
import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { SERVER } from '@/constants/urls.mjs';

const EditResourcePage = ({ resource }) => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        links: [''],
    });

    // State for API feedback
    const [status, setStatus] = useState('');
    // Initialize form data with resource prop
    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title || '',
                description: resource.description || '',
                links: resource.links.length > 0 ? [...resource.links] : [''],
            });
        }
    }, [resource]);

    // Handle input changes for title and links
    const handleInputChange = (field, value, index = null) => {
        setFormData((prev) => {
            const updatedForm = { ...prev };
            if (field === 'title') {
                updatedForm.title = value;
            } else if (field === 'links' && index !== null) {
                updatedForm.links[index] = value;
            }
            return updatedForm;
        });
    };

    // Handle description change from RichTextEditor
    const handleDescriptionChange = (content) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    // Add a new link input
    const addLink = () => {
        setFormData((prev) => ({
            ...prev,
            links: [...prev.links, ''],
        }));
    };

    // Remove a link input
    const removeLink = (index) => {
        setFormData((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!formData.title || !formData.description || formData.links.some((link) => !link)) {
            setStatus(`Please fill all fields for ${resource.type} resource.`);
            return;
        }

        try {
            setStatus(`Saving ${resource.type} resource...`);
            const response = await fetch(`${SERVER}/api/admin/edit-resource/${resource._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: resource.type,
                    title: formData.title,
                    description: formData.description,
                    links: formData.links,
                }),
                credentials:'include'
            });
            const resData = await response.json();
            if (resData.status === 200) {
                setStatus(`${resource.type} resource updated successfully!`);
                window.location.href = '/dashboard/resources'
            }
        } catch (error) {
            setStatus(`Error updating ${resource.type} resource: ${error.message}`);
        }
    };

    if (!resource) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-gray-500 dark:text-gray-400">No resource selected.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Edit {resource.type === 'pdf' ? 'PDF' : resource.type === 'video' ? 'Video' : 'Audio'} Resource
                </h1>

                {/* Status Message */}
                {status && (
                    <p className="text-center mb-6 text-sm text-gray-600 dark:text-gray-300">{status}</p>
                )}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                        {resource.title}
                    </h2>

                    <input
                        type="text"
                        placeholder={`${resource.type} Title`}
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full p-2 mb-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                    {formData.description && <RichTextEditor
                        onContentChange={handleDescriptionChange}
                        initialContent={formData.description}
                        uniqueKey={`${resource._id}-editor`}
                    />}
                    <div className="mt-4">
                        {formData.links.map((link, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="url"
                                    placeholder={`${resource.type} Link`}
                                    value={link}
                                    onChange={(e) => handleInputChange('links', e.target.value, index)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                                {formData.links.length > 1 && (
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
                    <button
                        onClick={handleSubmit}
                        className={`mt-6 w-full py-2 rounded-md text-white ${resource.type === 'pdf'
                                ? 'bg-red-500 hover:bg-red-600'
                                : resource.type === 'video'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditResourcePage;