'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { PaletteIcon, PinIcon, SearchIcon, PlusIcon, TagIcon, MoreVerticalIcon, TrashIcon, GridIcon, ListIcon } from './NotesIcons';
import { useSelector } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flip, toast, ToastContainer } from 'react-toastify';
import addNewNote from '@/server-functions/addNewNote.mjs';
import editNote from '@/server-functions/editNote.mjs';
import deleteNote from '@/server-functions/deleteNote.mjs';
import getNotes from '@/server-functions/getNotes.mjs';
import reorderNotes from '@/server-functions/reorderNotes.mjs';

const KeepNotes = ({ limit = 10, page = 1 }) => {

  const [limitState, setLimitState] = useState(limit);
  const [pageState, setPageState] = useState(page);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const user = useSelector((state) => state.user.userData);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#ffffff', labels: [], isPinned: false });
  const [activeId, setActiveId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const filteredNotes = useMemo(() => {
    if (!searchTerm?.trim()) return notes;
    const q = searchTerm.toLowerCase().trim();
    return notes.filter(n => {
      const title = (n.title || '').toLowerCase();
      const content = (n.content || '').toLowerCase();
      const labels = (n.labels || []).join(' ').toLowerCase();
      return title.includes(q) || content.includes(q) || labels.includes(q);
    });
  }, [notes, searchTerm]);

  const pinnedNotes = useMemo(() => {
    return (filteredNotes || [])
      .filter(note => note.isPinned)
      .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));
  }, [filteredNotes]);

  const unpinnedNotes = useMemo(() => {
    return (filteredNotes || [])
      .filter(note => !note.isPinned)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [filteredNotes]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const colors = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#f28b82' },
    { name: 'Orange', hex: '#fbbc04' },
    { name: 'Yellow', hex: '#fff475' },
    { name: 'Green', hex: '#ccff90' },
    { name: 'Teal', hex: '#a7ffeb' },
    { name: 'Blue', hex: '#cbf0f8' },
    { name: 'Navy', hex: '#aecbfa' },
    { name: 'Purple', hex: '#d7aefb' },
    { name: 'Pink', hex: '#fdcfe8' },
  ];
  useEffect(() => {
    fetchNotes(false, page, limit);
  }, []);

  const fetchNotes = async (append = false, p=1, l=10) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const data = await getNotes(p,l);
      if (data?.notes?.length >= 0) {
        if (append) {
          const newOnes = data?.notes?.filter(n => !notes.some(existing => existing._id === n._id));
          setNotes(prev => [...prev, ...newOnes]);
        } else {
          setNotes(data.notes || []);
        }
        setTotalCount(data?.totalCount ?? 0);
      }
    } catch (err) {
      console.error('fetchNotes error', err);
      toast.error('Failed to load notes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    const alreadyLoaded = notes?.length;
    if (alreadyLoaded >= totalCount) return;
    fetchNotes(true, pageState+1, limitState);
    setPageState((prev) => prev + 1);
  };


  const createNote = async (note) => {
    try {
      const currentPinnedNotes = notes.filter(n => n.isPinned);
      const currentUnpinnedNotes = notes.filter(n => !n.isPinned);

      const newNoteWithId = {
        ...note,
        isArchived: false,
        createdAt: new Date(),
        lastModifiedBy: user?.name || 'Unknown',
        pinnedPosition: currentPinnedNotes.length,
        position: currentUnpinnedNotes.length
      };

      // ... rest of your createNote function
      const result = await addNewNote(newNoteWithId);
      if (result?.status === 200) {
        // When adding to state, ensure it's placed correctly
        if (note.isPinned) {
          setNotes([...currentPinnedNotes, result?.note, ...currentUnpinnedNotes]);
        } else {
          setNotes([...currentPinnedNotes, ...currentUnpinnedNotes, result?.note]);
        }
        toast.success('Note created successfully!');
      } else {
        toast.error('Failed to create note: ' + result.message);
      }
    } catch (error) {
      toast.error('Error creating note: ' + error.message);
    }
  };

  const updateNote = async (id, updates, isTogglingPin = false) => {
    try {
      const newUpdates = {
        ...updates,
        lastModifiedBy: user?.name || 'Unknown',
      }

      if (isTogglingPin) {
        const currentPinnedNotes = pinnedNotes?.length || 0;
        const currentUnpinnedNotes = unpinnedNotes?.length || 0;
        if (updates.isPinned) {
          newUpdates.pinnedPosition = currentPinnedNotes;
        } else {
          newUpdates.position = currentUnpinnedNotes;
        }
      }
      // const x = notes.map(n => ({
      //   title: n.title,
      //   position: n.position,
      //   pinnedPosition: n.pinnedPosition
      // }));
      const result = await editNote(id, {
        ...newUpdates,
        lastModifiedBy: user?.name || 'Unknown'
      });
      if (result.status === 200) {
        setNotes(notes.map(note =>
          note._id === id ? { ...note, ...newUpdates, lastModifiedBy: user?.name || 'Unknown' } : note
        ));
        toast.success('Note updated successfully!');
      } else {
        toast.error('Failed to update note: ' + result.message);
      }
    } catch (error) {
      toast.error('Error updating note: ' + error.message);
    }
  };

  const deleteANote = async (id) => {
    try {
      const result = await deleteNote(id, {
        deletedBy: user?.name || 'Unknown'
      });

      if (result.status === 200) {
        setNotes(notes.filter(note => note._id !== id));
        toast.success('Note deleted successfully!');
      } else {
        toast.error('Failed to delete note: ' + result.message);
      }
    } catch (error) {
      toast.error('Error deleting note: ' + error.message);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // 1. Capture the original state *before* any changes for a clean revert
    const originalNotes = [...notes];

    // 2. Determine which section the drag is happening in
    const isPinnedSection = pinnedNotes.some(note => note._id === active.id);
    let sourceArray, otherArray;
    if (isPinnedSection) {
      // We are working within the pinned notes
      sourceArray = [...pinnedNotes];
      otherArray = [...unpinnedNotes];
    } else {
      // We are working within the unpinned notes
      sourceArray = [...unpinnedNotes];
      otherArray = [...pinnedNotes];
    }

    // 3. Find the old and new indices *within the correct source array*
    const oldIndex = sourceArray.findIndex(note => note._id === active.id);
    const newIndex = sourceArray.findIndex(note => note._id === over.id);

    // 4. Reorder the source array using the indices from that array
    const reorderedSourceArray = arrayMove(sourceArray, oldIndex, newIndex);

    // 5. Construct the new master notes array by combining the reordered section with the untouched one
    const newMasterNotes = isPinnedSection
      ? [...reorderedSourceArray, ...otherArray]
      : [...otherArray, ...reorderedSourceArray];

    // 6. Update the `position` for all notes in the new master array to reflect the new order
    const updatedNotesWithPositions = newMasterNotes.map((note, index) => ({
      ...note,
      position: index,
      pinnedPosition: index
    }));

    // 7. Optimistic UI update: Update the state immediately for a responsive feel
    setNotes(updatedNotesWithPositions);

    // 8. Backend call: Save the new order to the database
    try {
      const result = await reorderNotes({
        draggedNoteId: active.id,
        oldPosition: oldIndex, // The old index within its section
        newPosition: newIndex,   // The new index within its section
        reorderedBy: user?.name || 'Unknown'
      }, isPinnedSection);

      if (result.status === 200) {
        toast.success('Notes reordered successfully!');
      } else {
        // If the server reports an error, throw it to be caught by the catch block
        throw new Error(result.message || 'Failed to save new order');
      }
    } catch (error) {
      // 9. Revert on failure: If anything goes wrong, revert to the original state
      console.error("Reorder failed:", error);
      toast.error('Error reordering notes: ' + error.message);
      setNotes(originalNotes); // This now correctly reverts the UI
    } finally {
      setActiveId(null);
    }
  };

  const handleCreateNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      createNote(newNote);
      setNewNote({ title: '', content: '', color: '#ffffff', labels: [], isPinned: false });
      setShowCreateNote(false);
    } else {
      toast.warn('Please add a title or content to create a note');
    }
  };

  const handleUpdateNote = (newData) => {
    const { title, isPinned, content, labels } = newData;
    if (editingNote) {
      updateNote(editingNote._id, { title, isPinned, content, labels });
      setEditingNote(null);
    }
  };

  const togglePin = (note) => {
    updateNote(note._id, { isPinned: !note.isPinned }, true);
  };

  // const toggleArchive = (note) => {
  //   updateNote(note._id, { isArchived: !note.isArchived });
  // };

  const changeColor = (note, color) => {
    updateNote(note._id, { color });
  };

  const addLabel = (note, label) => {
    if (label && !note.labels.includes(label)) {
      updateNote(note._id, { labels: [...note.labels, label] });
    }
  };

  const removeLabel = (note, label) => {
    updateNote(note._id, { labels: note.labels.filter(l => l !== label) });
  };

  const SortableNoteCard = ({ note, onClick }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: note._id });

    const [showMenu, setShowMenu] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLabelInput, setShowLabelInput] = useState(false);
    const [labelInput, setLabelInput] = useState('');

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };


    return (
      <div
        ref={setNodeRef}
        className={`rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow  relative group ${isDragging ? 'z-50' : ''
          }`}
        style={{
          ...style,
          backgroundColor: note.color
        }}
        onClick={() => !isDragging && onClick(note)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex-1 break-words">{note.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePin(note);
              }}
              className={`ml-2 p-1 rounded-full hover:bg-black/5 transition-colors ${note.isPinned ? 'text-gray-900' : 'text-gray-700 opacity-0 group-hover:opacity-100'}`}
            >
              <PinIcon filled={note?.isPinned} />
            </button>
          </div>

          <p className="text-gray-700 line-clamp-4 text-sm whitespace-pre-wrap break-words mb-3">{note.content}</p>

          {note.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.labels.map((label, idx) => (
                <span key={idx} className="px-2 py-1 bg-black/5 rounded-full text-xs text-gray-700 flex items-center gap-1">
                  {label}
                  <button
                    className=" hover:text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLabel(note, label);
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Last modified by: {note.lastModifiedBy || 'Unknown'}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-gray-600"
                >
                  <PaletteIcon />
                </button>
                {showColorPicker && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-600 transition-colors"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => {
                          changeColor(note, color.hex);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLabelInput(!showLabelInput);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-gray-600"
                >
                  <TagIcon />
                </button>
                {showLabelInput && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Enter label"
                      className="px-2 py-1 border rounded text-sm w-32"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addLabel(note, labelInput.trim());
                          setLabelInput('');
                          setShowLabelInput(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleArchive(note);
                }}
                className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-gray-600"
              >
                <ArchiveIcon />
              </button> */}

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors text-gray-600"
                >
                  <MoreVerticalIcon />
                </button>
                {showMenu && (
                  <div className="absolute z-[1000] bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg py-1 z-100 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setDeleteConfirmation(note);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2  w-[100px] bg-gray-500 h-[70px] opacity-0 group-hover:opacity-20 hover:opacity-30  rounded transition-opacity cursor-move"
          style={{ height: isDragging ? 'h-[200px]' : '' }}
        />
      </div>
    );
  };

  const EditModal = ({ note, onClose, onSave }) => {
    const [editData, setEditData] = useState(note);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div
          className="bg-white rounded-lg max-w-2xl w-full shadow-2xl"
          style={{ backgroundColor: editData.color }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <input
              type="text"
              placeholder="Title"
              className="w-full text-xl font-semibold mb-4 bg-transparent border-none outline-none"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
            <textarea
              placeholder="Take a note..."
              className="w-full min-h-[200px] bg-transparent border-none outline-none resize-none"
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            />

            {editData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {editData.labels.map((label, idx) => (
                  <span key={idx} className="px-3 py-1 bg-black/5 rounded-full text-sm flex items-center gap-2">
                    {label}
                    <button
                      className="cursor-pointer hover:text-gray-900"
                      onClick={() => setEditData({ ...editData, labels: editData.labels.filter(l => l !== label) })}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditData({ ...editData, isPinned: !editData.isPinned })}
                  className="p-2 rounded-full hover:bg-black/5"
                >
                  <svg className="w-4 h-4" fill={editData.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 self-center mr-2">
                  Last modified by: {editData.lastModifiedBy || 'Unknown'}
                </div>
                <button
                  onClick={() => {
                    setEditingNote(editData);
                    handleUpdateNote(editData);
                    onClose();
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmationModal = ({ note, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div
          className="bg-white rounded-lg max-w-md w-full shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete note?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-1 truncate">{note?.title || 'Untitled'}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{note?.content || 'No content'}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(note._id);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (loading) return <div className="flex items-center mt-10 mx-auto gap-3 p-4 text-gray-700">
    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-sm">Getting notes...</span>
  </div>
  return (
    <div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen w-full mx-auto">
          {/* Header */}
          <div className="bg-white border-b sticky top-0 z-[5] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center mx-auto justify-center flex-wrap gap-4">
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Search notes..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Create Note */}
            <div className="mb-8">
              {!showCreateNote ? (
                <button
                  onClick={() => setShowCreateNote(true)}
                  className="w-full max-w-2xl mx-auto flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left text-gray-500"
                >
                  <PlusIcon />
                  Take a note...
                </button>
              ) : (
                <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-lg" style={{ backgroundColor: newNote.color }}>
                  <div className="p-4">
                    <input
                      type="text"
                      placeholder="Title"
                      className="w-full text-lg font-semibold mb-2 bg-transparent border-none outline-none"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      autoFocus
                    />
                    <textarea
                      placeholder="Take a note..."
                      className="w-full min-h-[100px] bg-transparent border-none outline-none resize-none"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                    <div className="flex items-center flex-wrap gap-4 justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        {colors.map((color) => (
                          <button
                            key={color.hex}
                            className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-600 transition-colors"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => setNewNote({ ...newNote, color: color.hex })}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowCreateNote(false);
                            setNewNote({ title: '', content: '', color: '#ffffff', labels: [], isPinned: false });
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateNote}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Notes */}
            {pinnedNotes?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pinned</h2>
                <SortableContext
                  items={pinnedNotes.map(note => note._id)}
                  strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                >
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4' : 'space-y-2'}>
                    {pinnedNotes.map(note => (
                      <SortableNoteCard
                        key={note._id}
                        note={note}
                        onClick={setEditingNote}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes?.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Others</h2>}
                <SortableContext
                  items={unpinnedNotes.map(note => note._id)}
                  strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                >
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
                    {unpinnedNotes.map(note => (
                      <SortableNoteCard
                        key={note._id}
                        note={note}
                        onClick={setEditingNote}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}

            {notes?.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-2 flex justify-center">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <p className="text-gray-500">No notes yet. Create your first note!</p>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingNote && (
            <EditModal
              note={editingNote}
              onClose={() => setEditingNote(null)}
              onSave={handleUpdateNote}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmation && (
            <DeleteConfirmationModal
              note={deleteConfirmation}
              onClose={() => setDeleteConfirmation(null)}
              onConfirm={deleteANote}
            />
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="rounded-lg border border-gray-200 shadow-lg opacity-90"
                style={{ backgroundColor: notes.find(note => note._id === activeId)?.color || '#ffffff' }}>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {notes.find(note => note._id === activeId)?.title}
                  </h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {notes.find(note => note._id === activeId)?.content}
                  </p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
          <ToastContainer autoClose={500} transition={Flip} />
        </div>

      </DndContext>
      {notes?.length > 0 && notes?.length < totalCount && notes?.length !== totalCount && (
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default KeepNotes;