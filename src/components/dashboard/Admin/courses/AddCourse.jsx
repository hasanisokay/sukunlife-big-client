'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '@/components/editor/RichTextEditor';

import generateUniqueIds from '@/utils/generateUniqueIds.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { AddSVG, ClipboardSVG, QuizSVG, VideoSVG } from '@/components/svg/SvgCollection';
import getDateObjWithoutTime from '@/utils/getDateObjWithoutTime.mjs';
import addNewCourse from '@/server-functions/addNewCourse.mjs';
import checkCourseId from '@/server-functions/checkCourseId.mjs';
import formatUrlAdIds from '@/utils/formatUrlAdIds.mjs';
import uploadFile from '@/utils/uploadFile.mjs';
import uploadPrivateContent from '@/utils/uploadPrivateContent.mjs';

const DRAFT_KEY = "add_course_draft";

const AddCourse = () => {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm();
  const [checkingId, setCheckingId] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idAvailable, setIdAvailable] = useState(false);

  const [modules, setModules] = useState([]);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [instructorImage, setInstructorImage] = useState('');
  const [learningItems, setLearningItems] = useState([{ text: '' }]);
  const [additionalMaterials, setAdditionalMaterials] = useState([{ text: '' }]);
  const [courseIncludes, setCourseIncludes] = useState([{ text: '' }]);

  /* ---------------- Draft System ---------------- */

  const saveDraft = () => {
    const draft = {
      modules,
      coverPhotoUrl,
      instructorImage,
      learningItems,
      additionalMaterials,
      courseIncludes,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      setModules(parsed.modules || []);
      setCoverPhotoUrl(parsed.coverPhotoUrl || '');
      setInstructorImage(parsed.instructorImage || '');
      setLearningItems(parsed.learningItems || [{ text: '' }]);
      setAdditionalMaterials(parsed.additionalMaterials || [{ text: '' }]);
      setCourseIncludes(parsed.courseIncludes || [{ text: '' }]);
      toast.info("Draft restored");
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data) => {
    if (!idAvailable) return toast.error("Course Id is not available.");

    const dateObj = data.addedOn || new Date();
    data.addedOn = getDateObjWithoutTime(dateObj);
    data.reviews = [];
    data.studentIds = [];

    const d = await addNewCourse(
      data,
      modules,
      coverPhotoUrl,
      learningItems,
      instructorImage,
      additionalMaterials,
      courseIncludes
    );

    if (d?.status === 200) {
      toast.success(d.message);
      reset();
      setModules([]);
      setCoverPhotoUrl('');
      setInstructorImage('');
      setLearningItems([{ text: '' }]);
      setAdditionalMaterials([{ text: '' }]);
      setCourseIncludes([{ text: '' }]);
      localStorage.removeItem(DRAFT_KEY);
      window.location.reload();
    } else {
      toast.error(d.message);
    }
  };

  /* ---------------- Handlers ---------------- */

  const handleAddModule = () => {
    const updated = [...modules, { title: '', items: [] }];
    setModules(updated);
    saveDraft();
  };

  const handleModuleTitleChange = (moduleId, title) => {
    const updated = modules.map((m, i) => i === moduleId ? { ...m, title } : m);
    setModules(updated);
    saveDraft();
  };

  const handleAddVideo = (moduleId) => {
    const updated = modules.map((m, i) =>
      i === moduleId
        ? { ...m, items: [...m.items, { type: 'video', title: '', description: '', url: '', status: 'private' }] }
        : m
    );
    setModules(updated);
    saveDraft();
  };

  const handleVideoUpload = async (moduleId, itemIndex, file, status) => {
    const uploadedUrl = status === "private"
      ? await uploadPrivateContent(file)
      : await uploadFile(file);

    const updated = modules.map((m, i) =>
      i === moduleId
        ? {
            ...m,
            items: m.items.map((it, idx) =>
              idx === itemIndex ? { ...it, url: uploadedUrl } : it
            )
          }
        : m
    );
    setModules(updated);
    saveDraft();
  };

  const handleAddTextInstruction = (moduleId) => {
    const updated = modules.map((m, i) =>
      i === moduleId
        ? { ...m, items: [...m.items, { type: 'textInstruction', title: '', content: '', status: 'private' }] }
        : m
    );
    setModules(updated);
    saveDraft();
  };

  const handleAddQuiz = (moduleId) => {
    const updated = modules.map((m, i) =>
      i === moduleId
        ? { ...m, items: [...m.items, { type: 'quiz', question: '', options: ['', '', '', ''], answer: 0 }] }
        : m
    );
    setModules(updated);
    saveDraft();
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    setCoverPhotoUrl(url);
    saveDraft();
  };

  const handleUploadInstructorImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    setInstructorImage(url);
    saveDraft();
  };

  const checkIdAvailability = async (id) => {
    setCheckingId(true);
    const formatted = formatUrlAdIds(id);
    setValue("courseId", formatted);
    const data = await checkCourseId(formatted);
    setIdAvailable(data?.isAvailable);
    setIdCheckMessage(data?.isAvailable ? "Id is available!" : "Id already taken.");
    setCheckingId(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Add Course</h2>

      <input {...register("title", { required: true })} placeholder="Course Title" className="input" />
      <input {...register("duration")} placeholder="Duration" className="input" />
      <input {...register("shortDescription")} placeholder="Short Description" className="input" />

      <input {...register("courseId")} onBlur={(e) => checkIdAvailability(e.target.value)} placeholder="Course ID" className="input" />
      <p>{idCheckMessage}</p>

      <input {...register("instructor")} placeholder="Instructor" className="input" />

      <Controller name="aboutInstructor" control={control}
        render={({ field }) => <RichTextEditor onContentChange={field.onChange} uniqueKey={generateUniqueIds(1)} />}
      />

      <input type="file" accept="image/*" onChange={handleUploadInstructorImage} />
      {instructorImage && <img src={instructorImage} className="h-32" />}

      <input type="number" {...register("price")} placeholder="Price" />

      <Controller name="addedOn" control={control}
        render={({ field }) => <DatePicker defaultDate={new Date()} onChangeHanlder={field.onChange} />}
      />

      <Controller name="description" control={control}
        render={({ field }) => <RichTextEditor onContentChange={field.onChange} uniqueKey={generateUniqueIds(1)} />}
      />

      <input type="file" accept="image/*" onChange={handleUploadImage} />
      {coverPhotoUrl && <img src={coverPhotoUrl} className="h-32" />}

      {/* MODULES */}
      {modules.map((module, moduleId) => (
        <div key={moduleId} className="border p-4 mt-4">
          <input value={module.title} onChange={(e) => handleModuleTitleChange(moduleId, e.target.value)} placeholder="Module Title" />

          {module.items.map((item, itemIndex) => (
            item.type === "video" && (
              <div key={itemIndex}>
                <input placeholder="Video Title" onChange={(e) => {
                  const updated = [...modules];
                  updated[moduleId].items[itemIndex].title = e.target.value;
                  setModules(updated);
                  saveDraft();
                }} />
                <input type="file" accept="video/*" onChange={(e) =>
                  handleVideoUpload(moduleId, itemIndex, e.target.files[0], item.status)
                } />
                {item.url && <p>Uploaded ✔</p>}
              </div>
            )
          ))}

          <button type="button" onClick={() => handleAddVideo(moduleId)}>Add Video</button>
          <button type="button" onClick={() => handleAddTextInstruction(moduleId)}>Add Text</button>
          <button type="button" onClick={() => handleAddQuiz(moduleId)}>Add Quiz</button>
        </div>
      ))}

      <button type="button" onClick={handleAddModule}>Add Module</button>

      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 mt-4">Save Course</button>
      <ToastContainer transition={Flip} />
    </form>
  );
};

export default AddCourse;
