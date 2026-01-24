'use client';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import editResource from '@/server-functions/editResource.mjs';
import uploadFile from '@/utils/uploadFile.mjs';
import TypeSpecificFields from './TypeSpecificFields';
import CommonFields from './CommonFields';


const initialResource = {
  title: '',
  description: '',
  links: [''],
  price: '',
  previousPrice: ''
};

export default function EditResourcePage({ resource }) {
  const [formData, setFormData] = useState(initialResource);
  const [coverPhoto, setCoverPhoto] = useState('');
  const [videoTopic, setVideoTopic] = useState('');
  const [audioType, setAudioType] = useState('general');
  const [litType, setLitType] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resource) return;

    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      links: resource.links?.length ? [...resource.links] : [''],
      price: resource.price || '',
      previousPrice: resource.previousPrice || ''
    });

    setCoverPhoto(resource.coverPhoto || '');
    setVideoTopic(resource.topic || '');
    setAudioType(resource.audioType || 'general');
    setLitType(resource.litType || 'free');
  }, [resource]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    setCoverPhoto(url);
  };

  const validate = () => {
    if (!formData.title.trim()) {
      return "Title is required";
    }
    if (!formData.links || !formData.links[0]) {
      return "Please upload a file or provide at least one link";
    }
    return null;
  };

  const buildPayload = () => {
    const base = {
      title: formData.title,
      description: formData.description || "",
      links: formData.links
    };

    if (resource.type === "video") {
      return { ...base, topic: videoTopic, coverPhoto };
    }

    if (resource.type === "audio") {
      return { ...base, audioType };
    }

    if (resource.type === "quran") {
      return { ...base, coverPhoto };
    }

    if (resource.type === "literature") {
      return {
        ...base,
        litType,
        price: formData.price || null,
        previousPrice: formData.previousPrice || null,
        coverPhoto
      };
    }
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return toast.error(error);

    try {
      setLoading(true);
      const payload = buildPayload();
      const res = await editResource(resource._id, resource.type, payload);

      if (res?.status === 200) {
        toast.success(res.message || "Resource updated");
        setTimeout(() => {
          window.location.href = "/dashboard/resources";
        }, 1200);
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!resource) {
    return <p className="text-center mt-10">No resource selected.</p>;
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-8 capitalize">
        Edit {resource.type} Resource
      </h1>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow">

        <CommonFields
          resource={formData}
          setResource={setFormData}
          coverPhoto={coverPhoto}
          handleCoverUpload={handleCoverUpload}
          selectedType={resource.type}
        />

        <div className="mt-6 border-t pt-6">
          <TypeSpecificFields
            selectedType={resource.type}
            resource={formData}
            setResource={setFormData}
            videoTopic={videoTopic}
            setVideoTopic={setVideoTopic}
            audioType={audioType}
            setAudioType={setAudioType}
            litType={litType}
            setLitType={setLitType}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Resource"}
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
