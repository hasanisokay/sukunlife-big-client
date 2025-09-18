'use client';
import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import editResource from '@/server-functions/editResource.mjs';
import uploadImage from '@/utils/uploadImage.mjs';

const EditResourcePage = ({ resource }) => {
    const [videoLang, setVideoLang] = useState(null);
    const [litType, setLitType] = useState("free");
    const [coverPhoto, setCoverPhoto] = useState("");

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        links: [''],
        readLink: '',
        listenLink: '',
        downloadLink: '',
        price: '',
        previousPrice: ''
    });
    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title || '',
                description: resource.description || '',
                links: resource.links?.length > 0 ? [...resource.links] : [''],
                readLink: resource.readLink || '',
                listenLink: resource.listenLink || '',
                downloadLink: resource.downloadLink || '',
                price: resource.price || '',
                previousPrice: resource.previousPrice || '',

            });
            setCoverPhoto(resource.coverPhoto || '');
            setVideoLang(resource.videoLang || null);
            setLitType(resource.litType || 'free');
        }
    }, [resource]);

    const handleInputChange = (field, value, index = null) => {
        setFormData((prev) => {
            const updated = { ...prev };
            if (field === 'links' && index !== null) {
                updated.links[index] = value;
            } else {
                updated[field] = value;
            }
            return updated;
        });
    };

    const handleDescriptionChange = (content) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    const addLink = () => {
        setFormData((prev) => ({ ...prev, links: [...prev.links, ''] }));
    };

    const removeLink = (index) => {
        setFormData((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadImage(file);
            setCoverPhoto(url);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            toast.error(`Please fill all fields for ${resource.type} resource.`);
            return;
        }

        try {
            toast.info(`Saving ${resource.type} resource...`);
            console.log(formData);
            let payload;
            if (resource.type === "video") {
                payload = {
                    ...formData,
                    coverPhoto,
                    videoLang,
                };
            }
            if (resource.type === "audio") {
                payload = {
                    ...formData,
                    coverPhoto,
                };
            }
            if (resource.type === "literature") {
                payload = {
                    ...formData,
                    litType,
                    coverPhoto,
                };
            }
            if (resource.type === "quran") {
                payload = {
                    title: formData.title,
                    description: formData.description,
                    readLink: formData.readLink,
                    listenLink: formData.listenLink,
                    price: formData.price,
                    coverPhoto,
                };
            }

            const resData = await editResource(resource._id, resource.type, payload);
            // resourceId, type, title, description, links
            if (resData?.status === 200) {
                toast.success(resData?.message || `${resource.type} resource updated successfully!`);
                setTimeout(() => {
                    window.location.href = '/dashboard/resources';
                }, 1200);
            } else {
                toast.error(resData?.message || `Failed to update ${resource.type} resource.`);
            }
        } catch (error) {
            toast.error(`Error updating ${resource.type} resource: ${error.message}`);
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
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Edit {resource.type === 'video'
                        ? 'Video Resource'
                        : resource.type === 'audio'
                            ? 'Audio Resource'
                            : resource.type === 'quran'
                                ? 'Quranic Verses'
                                : 'Literature & Guides'}
                </h1>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {/* Cover Photo Upload */}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Cover Photo</label>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} />
                        {coverPhoto && (
                            <img src={coverPhoto} alt="Cover" className="mt-2 h-32 rounded-md object-cover" />
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full p-2 mb-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />

                    <label htmlFor={`${resource._id}-editor`}>Description</label>
                    <RichTextEditor
                        onContentChange={handleDescriptionChange}
                        initialContent={resource.description}
                        uniqueKey={`${resource._id}-editor`}
                    />

                    {/* Quran */}
                    {resource.type === 'quran' && (
                        <div className="mt-4 space-y-2">
                            <input
                                type="url"
                                placeholder="Read Link"
                                value={formData.readLink}
                                onChange={(e) => handleInputChange('readLink', e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="url"
                                placeholder="Listen Link"
                                value={formData.listenLink}
                                onChange={(e) => handleInputChange('listenLink', e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Literature */}
                    {resource.type === 'literature' && (
                        <div className="mt-4 space-y-2">
                            <select
                                value={litType}
                                onChange={(e) => setLitType(e.target.value)}
                                className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                            {litType === 'free' ? (
                                <input
                                    type="url"
                                    placeholder="Download Link"
                                    value={formData.downloadLink}
                                    onChange={(e) => handleInputChange('downloadLink', e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            ) : (
                                <input
                                    type="number"
                                    placeholder="BDT Price"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            )}
                            <input
                                type="number"
                                placeholder="Previous Price"
                                value={formData.previousPrice}
                                onChange={(e) => handleInputChange('previousPrice', e.target.value)}
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Video */}
                    {resource.type === 'video' && (
                        <div className="mt-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">Select Video Language</p>
                            <div className="flex gap-2">
                                {['Bangla', 'Urdu', 'Arabic', 'English'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setVideoLang(lang.toLowerCase())}
                                        className={`px-3 py-1 rounded-md ${videoLang?.toLowerCase() === lang?.toLowerCase()
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Links (common for audio & video) */}
                    {(resource.type === 'audio' || resource.type === 'video') && (
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
                            <button onClick={addLink} className="mt-2 text-blue-500 hover:text-blue-700">
                                + Add Another Link
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-end">
                        <button
                            onClick={handleSubmit}
                            className={`py-2 px-4 rounded-md text-white ${resource.type === 'video'
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : resource.type === 'audio'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : resource.type === 'quran'
                                        ? 'bg-purple-500 hover:bg-purple-600'
                                        : 'bg-yellow-500 hover:bg-yellow-600'
                                }`}
                        >
                            Save {resource.type} Resource
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default EditResourcePage;
