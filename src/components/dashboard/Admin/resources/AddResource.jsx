'use client';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import addNewResource from '@/server-functions/addNewResource.mjs';
import uploadFile from '@/utils/uploadFile.mjs';
import ResourceForm from './ResourceForm';

const initialResource = {
  title: '',
  description: '',
  links: [''],
  readLink: '',
  listenLink: '',
  downloadLink: '',
  price: '',
  previousPrice: ''
};

export default function AddResource() {
  const [selectedType, setSelectedType] = useState(null);
  const [resource, setResource] = useState(initialResource);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [videoTopic, setVideoTopic] = useState('');
  const [audioType, setAudioType] = useState('general');
  const [litType, setLitType] = useState('free');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSelectedType(null);
    setResource(initialResource);
    setCoverPhoto('');
    setVideoTopic('');
    setAudioType('general');
    setLitType('free');
  };

  const validate = () => {
    if (!resource.title.trim()) {
      return "Title is required";
    }

    if (!resource.links || !resource.links[0]) {
      return "Please upload a file or provide at least one link";
    }

    return null;
  };

  const buildPayload = () => {
    const base = {
      title: resource.title,
      description: resource.description || "",
      coverPhoto: coverPhoto || ""
    };

    if (selectedType === "video") {
      return { ...base, links: resource.links, topic: videoTopic };
    }

    if (selectedType === "audio") {
      return { ...base, links: resource.links, audioType };
    }

    if (selectedType === "quran") {
      return { ...base, links: resource.links };
    }

    if (selectedType === "literature") {
      return {
        ...base,
        links: resource.links,
        price: resource.price || null,
        previousPrice: resource.previousPrice || null,
        litType
      };
    }
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return toast.error(error);
    if (!resource.links || !resource.links[0]) {
      return "Upload file or provide at least one link";
    }

    try {
      setLoading(true);
      const payload = buildPayload();

      const res = await addNewResource(selectedType, payload);

      if (res?.status === 200) {
        toast.success(res.message);
        resetForm();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    setCoverPhoto(url);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Resource</h1>

      {!selectedType ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['video', 'audio', 'quran', 'literature'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="p-6 bg-white shadow rounded-lg"
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <ResourceForm
          selectedType={selectedType}
          resource={resource}
          setResource={setResource}
          coverPhoto={coverPhoto}
          handleCoverUpload={handleCoverUpload}
          videoTopic={videoTopic}
          setVideoTopic={setVideoTopic}
          audioType={audioType}
          setAudioType={setAudioType}
          litType={litType}
          setLitType={setLitType}
          onBack={resetForm}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      <ToastContainer />
    </div>
  );
}
