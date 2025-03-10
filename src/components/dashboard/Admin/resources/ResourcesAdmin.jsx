'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import formatDate from '@/utils/formatDate.mjs';
import SearchBar from '@/components/search/SearchBar';
import deleteBulkResource from '@/server-functions/deleteBulkResource.mjs';

const ResourcesAdmin = ({ resources: initialResources }) => {
    // State for resources (managed locally to reflect deletions)
    const [resources, setResources] = useState(initialResources);

    useEffect(() => {
        setResources(initialResources)
    }, [initialResources])
    // State for selected filter
    const [filter, setFilter] = useState('all'); // 'all', 'pdf', 'video', 'audio'

    // State for selected resources (for bulk delete)
    const [selectedResources, setSelectedResources] = useState([]);

    // State for API feedback
    const [status, setStatus] = useState('');

    // State for modal
    const [selectedResource, setSelectedResource] = useState(null);

    // Filter resources based on selected type
    const filteredResources = resources.filter((resource) =>
        filter === 'all' ? true : resource.type === filter
    );

    // Handle checkbox selection
    const handleSelect = (id) => {
        setSelectedResources((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedResources.length === filteredResources.length) {
            setSelectedResources([]);
        } else {
            setSelectedResources(filteredResources.map((r) => r._id));
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedResources.length === 0) {
            setStatus('Please select at least one resource to delete.');
            return;
        }
        try {
            setStatus('Deleting resources...');
            const resData = await deleteBulkResource(selectedResource)
            if (resData.status === 200) {
                // Update local resources state to remove deleted items
                setResources((prev) =>
                    prev.filter((resource) => !selectedResources.includes(resource._id))
                );
                setStatus('Resources deleted successfully!');
                setSelectedResources([]); // Clear selection
            } else {
                throw new Error(resData.message || 'Failed to delete resources');
            }
        } catch (error) {
            setStatus(`Error deleting resources: ${error.message}`);
        }
    };

    // Open modal
    const openModal = (resource) => {
        setSelectedResource(resource);
    };

    // Close modal
    const closeModal = () => {
        setSelectedResource(null);
    };

    return (
        <div className="min-h-[300px] w-full bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Manage Resources
                </h1>
                <SearchBar placeholder={"Search Resources"} />
                {/* Filter Options */}
                <div className="flex justify-center mb-6 space-x-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md ${filter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pdf')}
                        className={`px-4 py-2 rounded-md ${filter === 'pdf'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                    >
                        PDF
                    </button>
                    <button
                        onClick={() => setFilter('video')}
                        className={`px-4 py-2 rounded-md ${filter === 'video'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                    >
                        Video
                    </button>
                    <button
                        onClick={() => setFilter('audio')}
                        className={`px-4 py-2 rounded-md ${filter === 'audio'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                    >
                        Audio
                    </button>
                </div>

                {/* Status Message */}
                {status && (
                    <p className="text-center mb-6 text-sm text-gray-600 dark:text-gray-300">{status}</p>
                )}

                {/* Bulk Delete Button */}
                {selectedResources.length > 0 && (
                    <div className="mb-6 text-center">
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                        >
                            Delete Selected ({selectedResources.length})
                        </button>
                    </div>
                )}

                {/* Resources Table */}
                <div className="lg:min-w-[1000px] md:min-w-[600px] min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Links
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredResources.length === 0 ? (
                                <tr className="h-full">
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No resources found.
                                    </td>
                                </tr>
                            ) : (
                                filteredResources.map((resource) => (
                                    <tr key={resource._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedResources.includes(resource._id)}
                                                onChange={() => handleSelect(resource._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {resource.type}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 min-w-[200px]">
                                            {resource.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                            <div
                                                dangerouslySetInnerHTML={{ __html: resource.description }}
                                                className="line-clamp-2"
                                            />
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-sm text-gray-500 dark:text-gray-300">
                                            <ul className="list-disc pl-4">
                                                {resource.links.map((link, index) => (
                                                    <li key={index}>
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Link {index + 1}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {formatDate(resource.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                            <Link href={`/dashboard/resources/edit?id=${resource._id}`} passHref>
                                                <button className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => openModal(resource)}
                                                className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Viewing Resource */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            {selectedResource.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Type:</strong> {selectedResource.type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <strong>Date:</strong> {formatDate(selectedResource.date)}
                        </p>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Description</h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: selectedResource.description }}
                                className="text-gray-700 dark:text-gray-200 prose dark:prose-invert"
                            />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Links</h3>
                            <ul className="list-disc pl-4 text-gray-700 dark:text-gray-200">
                                {selectedResource.links.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={closeModal}
                            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesAdmin;