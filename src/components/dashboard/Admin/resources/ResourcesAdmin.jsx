'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import formatDate from '@/utils/formatDate.mjs';
import SearchBar from '@/components/search/SearchBar';
import deleteBulkResource from '@/server-functions/deleteBulkResource.mjs';

const ResourcesAdmin = ({ resources: initialResources }) => {
    // Flatten grouped server response into single array
    const flattenResources = (data) => {
        if (!Array.isArray(data)) return [];
        return data.flatMap(group =>
            Object.keys(group).flatMap(typeKey => group[typeKey])
        );
    };

    const [resources, setResources] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedResources, setSelectedResources] = useState([]);
    const [status, setStatus] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    useEffect(() => {
        setResources(flattenResources(initialResources));
    }, [initialResources]);

    // Filter logic
    const filteredResources = resources?.filter((resource) =>
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
            const resData = await deleteBulkResource(selectedResources);
            if (resData.status === 200) {
                setResources((prev) =>
                    prev.filter((resource) => !selectedResources.includes(resource._id))
                );
                setStatus('Resources deleted successfully!');
                setSelectedResources([]);
            } else {
                throw new Error(resData.message || 'Failed to delete resources');
            }
        } catch (error) {
            setStatus(`Error deleting resources: ${error.message}`);
        }
    };

    // Modal open/close
    const openModal = (resource) => setSelectedResource(resource);
    const closeModal = () => setSelectedResource(null);

    return (
        <div className="min-h-[300px] w-full bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Manage Resources
                </h1>
                <SearchBar placeholder={"Search Resources"} />

                {/* Filter Options */}
                <div className="flex justify-center mb-6 space-x-4">
                    {['all', 'video', 'audio', 'literature', 'quran'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-md ${
                                filter === type
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
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
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Links</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredResources?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No resources found.
                                    </td>
                                </tr>
                            ) : (
                                filteredResources?.map((resource) => (
                                    <tr key={resource._id}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedResources.includes(resource._id)}
                                                onChange={() => handleSelect(resource._id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">{resource.type}</td>
                                        <td className="px-6 py-4">{resource.title}</td>
                                        <td className="px-6 py-4">
                                            <div dangerouslySetInnerHTML={{ __html: resource?.description }} className="line-clamp-2" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <ul className="list-disc pl-4">
                                                {resource?.links?.map((link, index) => (
                                                    link && (
                                                        <li key={index}>
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                                Link {index + 1}
                                                            </a>
                                                        </li>
                                                    )
                                                ))}
                                                {resource.readLink && (
                                                    <li>
                                                        <a href={resource.readLink} target="_blank" className="text-green-500 hover:underline">Read</a>
                                                    </li>
                                                )}
                                                {resource.listenLink && (
                                                    <li>
                                                        <a href={resource.listenLink} target="_blank" className="text-orange-500 hover:underline">Listen</a>
                                                    </li>
                                                )}
                                                {resource.downloadLink && (
                                                    <li>
                                                        <a href={resource.downloadLink} target="_blank" className="text-purple-500 hover:underline">Download</a>
                                                    </li>
                                                )}
                                                {resource.litType === 'paid' && resource.price && (
                                                    <li className="text-red-600 font-semibold">Price: {resource.price} BDT</li>
                                                )}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">{formatDate(resource.date)}</td>
                                        <td className="px-6 py-4 flex space-x-2">
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

            {/* Modal */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold mb-4">{selectedResource.title}</h2>
                        <p><strong>Type:</strong> {selectedResource.type}</p>
                        <p><strong>Date:</strong> {formatDate(selectedResource.date)}</p>
                        <div className="mb-4">
                            <h3>Description</h3>
                            <div dangerouslySetInnerHTML={{ __html: selectedResource.description }} className="prose dark:prose-invert" />
                        </div>
                        <div className="mb-4">
                            <h3>Links</h3>
                            <ul className="list-disc pl-4">
                                {selectedResource.links?.map((link, i) => (
                                    link && (
                                        <li key={i}>
                                            <a href={link} target="_blank" className="text-blue-500 hover:underline">{link}</a>
                                        </li>
                                    )
                                ))}
                                {selectedResource.readLink && (
                                    <li><a href={selectedResource.readLink} target="_blank" className="text-green-500 hover:underline">Read</a></li>
                                )}
                                {selectedResource.listenLink && (
                                    <li><a href={selectedResource.listenLink} target="_blank" className="text-orange-500 hover:underline">Listen</a></li>
                                )}
                                {selectedResource.downloadLink && (
                                    <li><a href={selectedResource.downloadLink} target="_blank" className="text-purple-500 hover:underline">Download</a></li>
                                )}
                                {selectedResource.litType === 'paid' && selectedResource.price && (
                                    <li className="text-red-600 font-semibold">Price: {selectedResource.price} BDT</li>
                                )}
                            </ul>
                        </div>
                        <button onClick={closeModal} className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesAdmin;
