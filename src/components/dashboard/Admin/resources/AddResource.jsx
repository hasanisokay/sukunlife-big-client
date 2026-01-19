'use client';
import { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast, ToastContainer } from 'react-toastify';
import addNewResource from '@/server-functions/addNewResource.mjs';
import uploadImage from '@/utils/uploadImage.mjs';

const AddResource = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [videoTopic, setVideoTopic] = useState('');

    const [litType, setLitType] = useState("free");
    const [coverPhoto, setCoverPhoto] = useState("");
    const [audioType, setAudioType] = useState('general');

    const [resource, setResource] = useState({
        title: '',
        description: '',
        links: [''],
        readLink: '',
        listenLink: '',
        downloadLink: '',
        price: '',
        previousPrice: ''
    });

    const [status, setStatus] = useState('');

    const handleInputChange = (field, value, index = null) => {
        setResource((prev) => {
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
        setResource((prev) => ({ ...prev, description: content }));
    };

    const addLink = () => {
        setResource((prev) => ({ ...prev, links: [...prev.links, ''] }));
    };

    const removeLink = (index) => {
        setResource((prev) => ({
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
        if (!resource.title || !resource.description) {
            setStatus(`Please fill all fields for ${selectedType} resource.`);
            return;
        }

        try {
            setStatus(`Saving ${selectedType} resource...`);
            let payload;
            if (selectedType === "video") {
                payload = {
                    title: resource?.title,
                    description: resource?.description,
                    links: resource?.links,
                    coverPhoto,
                    topic: videoTopic
                };
            }

            if (selectedType === "audio") {
                payload = {
                    title: resource?.title,
                    description: resource?.description,
                    links: resource?.links,
                    coverPhoto,
                    audioType
                };
            }

            if (selectedType === "literature") {
                payload = {
                    title: resource?.title,
                    description: resource?.description,
                    links: resource?.links,
                    readLink: resource?.readLink,
                    listenLink: resource?.listenLink,
                    downloadLink: resource?.downloadLink,
                    price: resource?.price,
                    litType,
                    coverPhoto,
                };
            }
            if (selectedType === "quran") {
                payload = {
                    title: resource?.title,
                    description: resource?.description,
                    readLink: resource?.readLink,
                    listenLink: resource?.listenLink,
                    coverPhoto,
                };
            }

            const resData = await addNewResource(selectedType, payload);
            if (resData?.status === 200) {
                toast.success(resData?.message);
                setStatus(`${selectedType} resource saved successfully!`);
                setResource({ title: '', description: '', links: [''], readLink: '', listenLink: '', downloadLink: '', price: '', previousPrice: '' });
                setCoverPhoto('');
                setVideoLang(null);
                setLitType("free");
                setSelectedType(null);
                window.scrollTo(0, 0)
            } else {
                toast.error(resData?.message);
            }
        } catch (error) {
            toast.error(`Error saving ${selectedType} resource: ${error.message}`);
            setStatus(`Error saving ${selectedType} resource: ${error.message}`);
        }
    };

    const handleBack = () => {
        setSelectedType(null);
        setResource({ title: '', description: '', links: [''], readLink: '', listenLink: '', downloadLink: '', price: '', previousPrice: '' });
        setStatus('');
        setAudioType('general')
        setVideoTopic('');
        setCoverPhoto('');
        setVideoLang(null);
        setLitType("free");
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="min-w-full">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                    Add New Resource
                </h1>

                {!selectedType ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <button onClick={() => setSelectedType('video')} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Video Resource</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new video</p>
                        </button>
                        <button onClick={() => setSelectedType('audio')} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Audio Resource</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new audio file</p>
                        </button>
                        <button onClick={() => setSelectedType('quran')} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Quranic Verses</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add new verses</p>
                        </button>
                        <button onClick={() => setSelectedType('literature')} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Literature & Guides</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add new guide</p>
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className='flex items-end justify-end'>
                            <button onClick={handleBack} className="bg-gray-500 flex items-end justify-end text-white py-2 px-4 rounded-md hover:bg-gray-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg> Back
                            </button>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            {selectedType === 'video' && 'Video Resource'}
                            {selectedType === 'audio' && 'Audio Resource'}
                            {selectedType === 'quran' && 'Quranic Verses'}
                            {selectedType === 'literature' && 'Literature & Guides'}
                        </h2>

                        {/* {status && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{status}</p>} */}

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
                            placeholder={`Title`}
                            value={resource.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full p-2 mb-4 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                        <label htmlFor={`${selectedType}-editor`}>Description</label>
                        <RichTextEditor
                            onContentChange={handleDescriptionChange}
                            initialContent={resource.description}
                            uniqueKey={`${selectedType}-editor`}
                        />

                        {/* Special Cases */}
                        {selectedType === 'quran' && (
                            <div className="mt-4 space-y-2">
                                <input
                                    type="url"
                                    placeholder="Read Link"
                                    value={resource.readLink}
                                    onChange={(e) => handleInputChange('readLink', e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="url"
                                    placeholder="Listen Link"
                                    value={resource.listenLink}
                                    onChange={(e) => handleInputChange('listenLink', e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}

                        {selectedType === 'literature' && (
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
                                        value={resource.downloadLink}
                                        onChange={(e) => handleInputChange('downloadLink', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        placeholder="BDT Price"
                                        value={resource.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    />
                                )}
                                <input
                                    type="number"
                                    placeholder="Previous Price"
                                    value={resource.previousPrice}
                                    onChange={(e) => handleInputChange('previousPrice', e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}
                        {selectedType === 'video' && (
                            <div className="mt-4">
                                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                                    Video Topic
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter video topic (e.g. Ruqyah for Anxiety)"
                                    value={videoTopic}
                                    onChange={(e) => setVideoTopic(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        )}


                        {selectedType === 'audio' && (
                            <div className="mt-4">
                                <label className="block mb-2 text-gray-700 dark:text-gray-300">
                                    Audio Category
                                </label>
                                <select
                                    value={audioType || ''}
                                    onChange={(e) => setAudioType(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="" disabled>Select Audio Type</option>
                                    <option value="general">General Ruqyah Audios</option>
                                    <option value="topic-based">Topic-Based Ruqyah Audios</option>
                                    <option value="specific-problems">Ruqyah for Specific Problems</option>
                                    <option value="quran-recitation">Quran Recitation Audios</option>
                                </select>
                            </div>
                        )}



                        {/* Links (common for audio & video) */}
                        {(selectedType === 'audio' || selectedType === 'video') && (
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
                                <button onClick={addLink} className="mt-2 text-blue-500 hover:text-blue-700">
                                    + Add Another Link
                                </button>
                            </div>
                        )}

                        <div className="mt-6 text-end">

                            <button
                                onClick={handleSubmit}
                                className={`py-2 px-4 rounded-md text-white ${selectedType === 'video'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : selectedType === 'audio'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : selectedType === 'quran'
                                            ? 'bg-purple-500 hover:bg-purple-600'
                                            : 'bg-yellow-500 hover:bg-yellow-600'
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
