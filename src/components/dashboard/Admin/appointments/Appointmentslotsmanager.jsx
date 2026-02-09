'use client'
import { useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { CONSULTANTS } from '@/constants/names.mjs';
import tokenParser from '@/server-functions/tokenParser.mjs';
import { SERVER } from '@/constants/urls.mjs';

const AppointmentSlotsManager = ({ initialSlots = [], onRefresh }) => {
    const [slots, setSlots] = useState(initialSlots);
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [filterDate, setFilterDate] = useState('');
    const [filterConsultant, setFilterConsultant] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [editForm, setEditForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        consultants: []
    });
    const [bulkAction, setBulkAction] = useState('');
    const [bulkConsultants, setBulkConsultants] = useState([]);
    const [showBulkPanel, setShowBulkPanel] = useState(false);

    // Get unique dates from slots
    const uniqueDates = useMemo(() => {
        return [...new Set(slots.map(slot => slot.date))].sort();
    }, [slots]);

    // Filter slots
    const filteredSlots = useMemo(() => {
        return slots.filter(slot => {
            const matchesDate = !filterDate || slot.date === filterDate;
            const matchesConsultant = !filterConsultant || slot.consultants.includes(filterConsultant);
            const matchesSearch = !searchTerm || 
                slot.date.includes(searchTerm) ||
                slot.startTime.includes(searchTerm) ||
                slot.consultants.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return matchesDate && matchesConsultant && matchesSearch;
        });
    }, [slots, filterDate, filterConsultant, searchTerm]);

    // Group slots by date
    const groupedSlots = useMemo(() => {
        const grouped = {};
        filteredSlots.forEach(slot => {
            if (!grouped[slot.date]) {
                grouped[slot.date] = [];
            }
            grouped[slot.date].push(slot);
        });
        // Sort slots within each date by startTime
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return grouped;
    }, [filteredSlots]);

    // Toggle slot selection
    const toggleSlotSelection = (slotId) => {
        const newSelected = new Set(selectedSlots);
        if (newSelected.has(slotId)) {
            newSelected.delete(slotId);
        } else {
            newSelected.add(slotId);
        }
        setSelectedSlots(newSelected);
    };

    // Select all visible slots
    const selectAllVisible = () => {
        if (selectedSlots.size === filteredSlots.length) {
            setSelectedSlots(new Set());
        } else {
            setSelectedSlots(new Set(filteredSlots.map(slot => slot._id)));
        }
    };

    // Delete single slot
    const deleteSingleSlot = async (slotId) => {
        if (!confirm('Are you sure you want to delete this appointment slot?')) return;

        try {
            const tokens = await tokenParser();
            const response = await fetch(`${SERVER}/api/admin/appointment-slot/${slotId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken?.value || ''}`,
                    'X-Refresh-Token': tokens?.refreshToken?.value || '',
                }
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Slot deleted successfully');
                setSlots(slots.filter(slot => slot._id !== slotId));
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to delete slot');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        }
    };

    // Bulk delete
    const bulkDelete = async () => {
        if (selectedSlots.size === 0) {
            toast.error('Please select slots to delete');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedSlots.size} slot(s)?`)) return;

        setIsDeleting(true);
        try {
            const tokens = await tokenParser();
            const response = await fetch(`${SERVER}/api/admin/appointment-slots/bulk-delete`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken?.value || ''}`,
                    'X-Refresh-Token': tokens?.refreshToken?.value || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    slotIds: Array.from(selectedSlots)
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.summary.deletedCount} slot(s) deleted successfully`);
                setSlots(slots.filter(slot => !selectedSlots.has(slot._id)));
                setSelectedSlots(new Set());
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to delete slots');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    // Open edit modal
    const openEditModal = (slot) => {
        setEditingSlot(slot);
        setEditForm({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            consultants: [...slot.consultants]
        });
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditingSlot(null);
        setEditForm({
            date: '',
            startTime: '',
            endTime: '',
            consultants: []
        });
    };

    // Toggle consultant in edit form
    const toggleConsultantInEdit = (consultant) => {
        setEditForm(prev => ({
            ...prev,
            consultants: prev.consultants.includes(consultant)
                ? prev.consultants.filter(c => c !== consultant)
                : [...prev.consultants, consultant]
        }));
    };

    // Save edited slot
    const saveEdit = async () => {
        if (!editForm.date || !editForm.startTime || !editForm.endTime) {
            toast.error('Please fill all required fields');
            return;
        }

        if (editForm.consultants.length === 0) {
            toast.error('Please select at least one consultant');
            return;
        }

        try {
            const tokens = await tokenParser();
            const response = await fetch(`${SERVER}/api/admin/appointment-slot/${editingSlot._id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken?.value || ''}`,
                    'X-Refresh-Token': tokens?.refreshToken?.value || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Slot updated successfully');
                setSlots(slots.map(slot => 
                    slot._id === editingSlot._id ? data.slot : slot
                ));
                closeEditModal();
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to update slot');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        }
    };

    // Bulk edit
    const executeBulkEdit = async () => {
        if (selectedSlots.size === 0) {
            toast.error('Please select slots to edit');
            return;
        }

        if (!bulkAction) {
            toast.error('Please select a bulk action');
            return;
        }

        if (bulkConsultants.length === 0) {
            toast.error('Please select at least one consultant');
            return;
        }

        try {
            const tokens = await tokenParser();
            const response = await fetch(`${SERVER}/api/admin/appointment-slots/bulk-edit`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken?.value || ''}`,
                    'X-Refresh-Token': tokens?.refreshToken?.value || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    slotIds: Array.from(selectedSlots),
                    action: bulkAction,
                    updates: {
                        consultants: bulkConsultants
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Bulk edit completed: ${data.summary.modified} slot(s) modified`);
                // Update local state with modified slots
                const updatedSlotsMap = new Map(data.slots.map(s => [s._id, s]));
                setSlots(slots.map(slot => 
                    updatedSlotsMap.has(slot._id) ? updatedSlotsMap.get(slot._id) : slot
                ));
                setSelectedSlots(new Set());
                setBulkAction('');
                setBulkConsultants([]);
                setShowBulkPanel(false);
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to perform bulk edit');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        }
    };

    // Toggle consultant in bulk edit
    const toggleBulkConsultant = (consultant) => {
        setBulkConsultants(prev =>
            prev.includes(consultant)
                ? prev.filter(c => c !== consultant)
                : [...prev, consultant]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterDate('');
        setFilterConsultant('');
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Appointment Slots Manager
                    </h1>
                    <p className="text-slate-600">Manage and organize your appointment schedules</p>
                </div>

                {/* Filters & Actions Bar */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 p-6 mb-6 border border-emerald-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search slots..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
                            <select
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">All Dates</option>
                                {uniqueDates.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>

                        {/* Consultant Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Consultant</label>
                            <select
                                value={filterConsultant}
                                onChange={(e) => setFilterConsultant(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">All Consultants</option>
                                {CONSULTANTS.map(consultant => (
                                    <option key={consultant} value={consultant}>{consultant}</option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={clearFilters}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedSlots.size > 0 && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-emerald-900">
                                    {selectedSlots.size} slot(s) selected
                                </span>
                                <button
                                    onClick={() => setSelectedSlots(new Set())}
                                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                                >
                                    Clear selection
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowBulkPanel(!showBulkPanel)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm shadow-md flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Bulk Edit
                                </button>
                                <button
                                    onClick={bulkDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bulk Edit Panel */}
                    {showBulkPanel && selectedSlots.size > 0 && (
                        <div className="mt-4 p-5 bg-white rounded-xl border-2 border-emerald-200">
                            <h3 className="text-sm font-semibold text-emerald-900 mb-4">Bulk Edit Consultants</h3>
                            
                            <div className="space-y-4">
                                {/* Action Selection */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-2">Action</label>
                                    <select
                                        value={bulkAction}
                                        onChange={(e) => setBulkAction(e.target.value)}
                                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                                    >
                                        <option value="">Select action...</option>
                                        <option value="add_consultants">Add Consultants</option>
                                        <option value="remove_consultants">Remove Consultants</option>
                                        <option value="replace_consultants">Replace Consultants</option>
                                    </select>
                                </div>

                                {/* Consultant Selection */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-2">Select Consultants</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {CONSULTANTS.map(consultant => (
                                            <label
                                                key={consultant}
                                                className={`
                                                    flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border
                                                    ${bulkConsultants.includes(consultant)
                                                        ? 'bg-emerald-50 border-emerald-500'
                                                        : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={bulkConsultants.includes(consultant)}
                                                    onChange={() => toggleBulkConsultant(consultant)}
                                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                />
                                                <span className="text-xs font-medium text-slate-700">{consultant}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Execute Button */}
                                <button
                                    onClick={executeBulkEdit}
                                    disabled={!bulkAction || bulkConsultants.length === 0}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Bulk Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg shadow-emerald-100/50 p-6 border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Slots</p>
                                <p className="text-3xl font-bold text-emerald-600">{slots.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg shadow-emerald-100/50 p-6 border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Filtered Slots</p>
                                <p className="text-3xl font-bold text-teal-600">{filteredSlots.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg shadow-emerald-100/50 p-6 border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Selected</p>
                                <p className="text-3xl font-bold text-cyan-600">{selectedSlots.size}</p>
                            </div>
                            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Select All */}
                {filteredSlots.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={selectAllVisible}
                            className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={selectedSlots.size === filteredSlots.length && filteredSlots.length > 0}
                                onChange={selectAllVisible}
                                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                            />
                            Select all visible ({filteredSlots.length})
                        </button>
                    </div>
                )}

                {/* Slots Display - Grouped by Date */}
                {Object.keys(groupedSlots).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 p-12 text-center border border-emerald-100">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Appointment Slots Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or add new appointment slots.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedSlots).sort().map(date => (
                            <div key={date} className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 overflow-hidden border border-emerald-100">
                                {/* Date Header */}
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                        <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                                            {groupedSlots[date].length} slots
                                        </span>
                                    </h2>
                                </div>

                                {/* Slots for this date */}
                                <div className="p-4 space-y-3">
                                    {groupedSlots[date].map(slot => (
                                        <div
                                            key={slot._id}
                                            className={`
                                                p-4 rounded-xl border-2 transition-all
                                                ${selectedSlots.has(slot._id)
                                                    ? 'bg-emerald-50 border-emerald-400 shadow-md'
                                                    : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSlots.has(slot._id)}
                                                    onChange={() => toggleSlotSelection(slot._id)}
                                                    className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-1"
                                                />

                                                {/* Slot Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-lg font-semibold text-slate-800">
                                                                    {slot.startTime} - {slot.endTime}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500">ID: {slot._id}</p>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(slot)}
                                                                className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                                                                title="Edit slot"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSingleSlot(slot._id)}
                                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                                title="Delete slot"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Consultants */}
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-600 mb-2">
                                                            Available Consultants ({slot.consultants.length}):
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {slot.consultants.map(consultant => (
                                                                <span
                                                                    key={consultant}
                                                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-full shadow-sm"
                                                                >
                                                                    {consultant}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingSlot && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Edit Appointment Slot</h2>
                            <button
                                onClick={closeEditModal}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={editForm.startTime}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={editForm.endTime}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Consultants */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Available Consultants ({editForm.consultants.length} selected)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {CONSULTANTS.map(consultant => (
                                        <label
                                            key={consultant}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2
                                                ${editForm.consultants.includes(consultant)
                                                    ? 'bg-emerald-50 border-emerald-500'
                                                    : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                                                }
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={editForm.consultants.includes(consultant)}
                                                onChange={() => toggleConsultantInEdit(consultant)}
                                                className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{consultant}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={closeEditModal}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AppointmentSlotsManager;