"use client";
import "./editor.css"
import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import PhotoSVG from "../svg/PhotoSVG";
import ColorSVG from "../svg/ColorSVG";
import { RedoSVG, UndoSVG } from "../svg/SvgCollection";

const RichTextEditor = ({ onContentChange, initialContent = "", uniqueKey="" }) => {
  const [imageUploadError, setImageUploadError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true, // For undo/redo
      }),
      // Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Underline,
      Link.configure({ openOnClick: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
    ],
    immediatelyRender: false,
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onContentChange) onContentChange(html);
    },
  });

  const addImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.success) {
        const imageUrl = data.data.url;
        editor.chain().focus().setImage({ src: imageUrl }).run();
        setImageUploadError("");
      } else {
        setImageUploadError("Image upload failed. Please try again.");
      }
    } catch (error) {
      setImageUploadError("Image upload failed. Please try again.");
    }
  };

  const uploadImageHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      addImage(file);
    }
  };

  if (!editor) return null;

  return (
    <div className="w-full  p-4 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 ">
      {/* Toolbar */}
      {/* <div className="flex flex-wrap gap-2 mb-4"> */}
      <div className="flex flex-wrap gap-2 mb-4 sticky top-0 z-10 bg-white dark:bg-gray-800 p-2">

        {/* Formatting Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 border rounded ${editor.isActive("bold")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 border rounded ${editor.isActive("italic")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 border rounded ${editor.isActive("underline")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 border rounded ${editor.isActive("strike")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Strike
        </button>

        {/* Alignment */}
        {["left", "center", "right", "justify"].map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
            className={`p-2 border rounded ${editor.isActive({ textAlign: align })
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
              }`}
          >
            {align.charAt(0).toUpperCase() + align.slice(1)}
          </button>
        ))}

        {/* Headings */}
        {Array.from({ length: 6 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: i + 1 }).run()}
            className={`p-2 border rounded ${editor.isActive("heading", { level: i + 1 })
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
              }`}
          >
            H{i + 1}
          </button>
        ))}

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 border rounded ${editor.isActive("bulletList")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 border rounded ${editor.isActive("orderedList")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Ordered List
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href || "";
            const url = window.prompt("Enter the URL:", previousUrl);

            if (url === null) {
              return; // Cancelled
            } else if (url === "") {
              editor.chain().focus().unsetLink().run(); // Remove link
            } else {
              editor.chain().focus().setLink({ href: url }).run(); // Set new link
            }
          }}
          className={`p-2 border rounded ${editor.isActive("link")
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
          Link
        </button>
        {/* Horizontal Rule */}
        {/* <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 border rounded bg-gray-200 dark:bg-gray-700"
        >
          Horizontal Rule
        </button> */}

        {/* Undo & Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 border rounded bg-gray-200 dark:bg-gray-700"
        >
          <UndoSVG />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 border rounded bg-gray-200 dark:bg-gray-700"
        >
          <RedoSVG />
        </button>
        {/* Colors */}
        <div>
          <label htmlFor={`colorPicker${uniqueKey}`} className="mr-2">
            <ColorSVG clickHandler={() => document.getElementById(`colorPicker${uniqueKey}`).click()} />
          </label>
          <input
            type="color"
            id={`colorPicker${uniqueKey}`}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="invisible border rounded"
          />
        </div>

        {/* Image Upload */}
        <div>
          <PhotoSVG clickHandler={() => document.getElementById(`imageFileInputField${uniqueKey || ""}`).click()} />
          <input
            id={`imageFileInputField${uniqueKey || ""}`}
            type="file"
            accept="image/*"
            onChange={uploadImageHandler}
            className="invisible"
          />
        </div>
      </div>

      {imageUploadError && (
        <p className="text-red-500 text-sm mb-2">{imageUploadError}</p>
      )}

      {/* Editor Content */}

      <EditorContent editor={editor} className=" border rounded focus:outline-none  dark:bg-gray-900 " />
    </div>
  );
};

export default RichTextEditor;
