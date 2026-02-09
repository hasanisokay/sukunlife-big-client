"use client";
import { useState } from "react";
import { CONSULTANTS } from "@/constants/names.mjs";
import { toast, ToastContainer } from "react-toastify";
import tokenParser from "@/server-functions/tokenParser.mjs";
import { SERVER } from "@/constants/urls.mjs";

const AppointmentSchedulePage = () => {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeSettings, setTimeSettings] = useState({
    startTime: "10:00",
    endTime: "22:00",
    sessionDuration: 60, // Duration of each session in minutes
    gapBetweenSessions: 30, // Gap between sessions in minutes
    breaks: [],
  });
  const [newBreak, setNewBreak] = useState({ start: "", end: "" });
  const [consultantAvailability, setConsultantAvailability] = useState({});
  const [selectedConsultants, setSelectedConsultants] = useState([]);
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterConsultant, setFilterConsultant] = useState("");

  // Add break period
  const addBreak = () => {
    if (newBreak.start && newBreak.end) {
      setTimeSettings((prev) => ({
        ...prev,
        breaks: [...prev.breaks, { ...newBreak, id: Date.now() }],
      }));
      setNewBreak({ start: "", end: "" });
    }
  };

  // Remove break period
  const removeBreak = (id) => {
    setTimeSettings((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((b) => b.id !== id),
    }));
  };

  // Toggle consultant selection for all dates
  const toggleConsultant = (consultant) => {
    setSelectedConsultants((prev) =>
      prev.includes(consultant)
        ? prev.filter((c) => c !== consultant)
        : [...prev, consultant],
    );
  };

  // Generate time slots with session duration and gap
  const generateTimeSlots = (startTime, endTime, sessionDuration, gapBetweenSessions, breaks) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      // Session start time
      const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
      
      // Session end time (start + duration)
      const sessionEndMinutes = currentMinutes + sessionDuration;
      const slotEnd = `${String(Math.floor(sessionEndMinutes / 60)).padStart(2, "0")}:${String(sessionEndMinutes % 60).padStart(2, "0")}`;
      
      // Check if session end time exceeds the day's end time
      if (sessionEndMinutes > endMinutes) {
        break; // Don't create a session that would go past the end time
      }

      // Check if slot overlaps with any break
      const isBreak = breaks.some((b) => {
        const [bStartH, bStartM] = b.start.split(":").map(Number);
        const [bEndH, bEndM] = b.end.split(":").map(Number);
        const breakStart = bStartH * 60 + bStartM;
        const breakEnd = bEndH * 60 + bEndM;
        
        // Check if any part of the session overlaps with the break
        return (
          (currentMinutes >= breakStart && currentMinutes < breakEnd) ||
          (sessionEndMinutes > breakStart && sessionEndMinutes <= breakEnd) ||
          (currentMinutes < breakStart && sessionEndMinutes > breakEnd)
        );
      });

      if (!isBreak) {
        slots.push({ start: slotStart, end: slotEnd });
      }

      // Move to next session start time (current session end + gap)
      currentMinutes = sessionEndMinutes + gapBetweenSessions;
    }
    return slots;
  };

  // Generate date range
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Generate all appointments
  const generateAppointments = () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error("Please select start and end dates");
      return;
    }
    if (selectedConsultants.length === 0) {
      toast.error("Please select at least one consultant");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const dates = getDatesInRange(dateRange.start, dateRange.end);
      const timeSlots = generateTimeSlots(
        timeSettings.startTime,
        timeSettings.endTime,
        timeSettings.sessionDuration,
        timeSettings.gapBetweenSessions,
        timeSettings.breaks,
      );

      const appointments = [];

      dates.forEach((date) => {
        timeSlots.forEach((slot) => {
          // Get available consultants for this specific date-time
          const availableConsultants = selectedConsultants.filter(
            (consultant) => {
              const specificAvailability =
                consultantAvailability[`${consultant}-${date}-${slot.start}`];
              return specificAvailability !== false; // Available unless explicitly set to false
            },
          );

          if (availableConsultants.length > 0) {
            appointments.push({
              date,
              startTime: slot.start,
              endTime: slot.end,
              consultants: availableConsultants,
            });
          }
        });
      });

      setGeneratedSlots(appointments);
      setIsGenerating(false);
      setEditMode(true);
      toast.success(`Generated ${appointments.length} appointment slots`);
    }, 500);
  };

  // Toggle specific consultant availability for a slot
  const toggleSlotConsultant = (index, consultant) => {
    const slot = generatedSlots[index];
    const key = `${consultant}-${slot.date}-${slot.startTime}`;

    setConsultantAvailability((prev) => ({
      ...prev,
      [key]: !(prev[key] === false),
    }));

    setGeneratedSlots((prev) => {
      const updated = [...prev];
      if (updated[index].consultants.includes(consultant)) {
        updated[index].consultants = updated[index].consultants.filter(
          (c) => c !== consultant,
        );
      } else {
        updated[index].consultants = [
          ...updated[index].consultants,
          consultant,
        ];
      }
      return updated;
    });
  };

  // Bulk add consultant to filtered slots
  const bulkAddConsultant = (consultant) => {
    setGeneratedSlots((prev) => {
      return prev.map((slot) => {
        const matchesDate = !filterDate || slot.date === filterDate;
        const matchesConsultant =
          !filterConsultant || consultant === filterConsultant;

        if (
          matchesDate &&
          matchesConsultant &&
          !slot.consultants.includes(consultant)
        ) {
          return {
            ...slot,
            consultants: [...slot.consultants, consultant],
          };
        }
        return slot;
      });
    });
    toast.success(`Added ${consultant} to filtered slots`);
  };

  // Bulk remove consultant from filtered slots
  const bulkRemoveConsultant = (consultant) => {
    setGeneratedSlots((prev) => {
      return prev.map((slot) => {
        const matchesDate = !filterDate || slot.date === filterDate;
        const matchesConsultant =
          !filterConsultant || consultant === filterConsultant;

        if (matchesDate && matchesConsultant) {
          return {
            ...slot,
            consultants: slot.consultants.filter((c) => c !== consultant),
          };
        }
        return slot;
      });
    });
    toast.success(`Removed ${consultant} from filtered slots`);
  };

  // Get unique dates from generated slots
  const uniqueDates = [
    ...new Set(generatedSlots.map((slot) => slot.date)),
  ].sort();

  // Filter slots based on selected filters
  const filteredSlots = generatedSlots.filter((slot) => {
    const matchesDate = !filterDate || slot.date === filterDate;
    const matchesConsultant =
      !filterConsultant || slot.consultants.includes(filterConsultant);
    return matchesDate && matchesConsultant;
  });

  // Save appointments
  const saveAppointments = async () => {
    if (generatedSlots.length === 0) {
      toast.error("No appointments to save. Please generate slots first.");
      return;
    }

    setIsSaving(true);

    try {
      const tokens = await tokenParser();
      const response = await fetch(
        `${SERVER}/api/admin/add-appointment-dates`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens?.accessToken?.value || ""}`,
            "X-Refresh-Token": tokens?.refreshToken?.value || "",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ appointments: generatedSlots }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Check if there were any skipped appointments
        const { summary, warning } = data;

        if (summary?.skipped > 0) {
          // Show detailed information about the operation
          toast.warning(
            `Saved ${summary.inserted} appointment(s). ${summary.skipped} duplicate(s) were skipped.`,
            { autoClose: 5000 },
          );
        } else {
          // All appointments saved successfully
          toast.success(
            `All ${summary?.inserted || summary?.total} appointments saved successfully!`,
            { autoClose: 3000 },
          );
        }

        // Reset all data
        setDateRange({ start: "", end: "" });
        setTimeSettings({
          startTime: "10:00",
          endTime: "22:00",
          sessionDuration: 60,
          gapBetweenSessions: 30,
          breaks: [],
        });
        setSelectedConsultants([]);
        setConsultantAvailability({});
        setGeneratedSlots([]);
        setEditMode(false);
        setFilterDate("");
        setFilterConsultant("");
      } else {
        toast.error(data.message || "Failed to save appointments");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Appointment Scheduler
          </h1>
          <p className="text-slate-600">
            Configure and generate appointment slots for consultants
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Range */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Date Range
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Time Settings */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Session Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={timeSettings.startTime}
                    onChange={(e) =>
                      setTimeSettings((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={timeSettings.endTime}
                    onChange={(e) =>
                      setTimeSettings((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeSettings.sessionDuration}
                    onChange={(e) =>
                      setTimeSettings((prev) => ({
                        ...prev,
                        sessionDuration: parseInt(e.target.value) || 60,
                      }))
                    }
                    min="15"
                    step="5"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">How long each session lasts</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gap Between Sessions (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeSettings.gapBetweenSessions}
                    onChange={(e) =>
                      setTimeSettings((prev) => ({
                        ...prev,
                        gapBetweenSessions: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    step="5"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">Break time between sessions</p>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-medium text-indigo-900 mb-2">Example:</p>
                <p className="text-xs text-indigo-700">
                  Session starts at <strong>10:00</strong> → 
                  Ends at <strong>{(() => {
                    const start = new Date(`2000-01-01 ${timeSettings.startTime}`);
                    start.setMinutes(start.getMinutes() + timeSettings.sessionDuration);
                    return start.toTimeString().slice(0, 5);
                  })()}</strong> ({timeSettings.sessionDuration} min) →
                  Next session at <strong>{(() => {
                    const start = new Date(`2000-01-01 ${timeSettings.startTime}`);
                    start.setMinutes(start.getMinutes() + timeSettings.sessionDuration + timeSettings.gapBetweenSessions);
                    return start.toTimeString().slice(0, 5);
                  })()}</strong> (after {timeSettings.gapBetweenSessions} min gap)
                </p>
              </div>

              {/* Break Periods */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Break Periods (Sessions won't be created during these times)
                </label>
                <div className="space-y-3">
                  {timeSettings.breaks.map((breakPeriod) => (
                    <div
                      key={breakPeriod.id}
                      className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg"
                    >
                      <span className="text-sm text-slate-700 flex-1">
                        {breakPeriod.start} - {breakPeriod.end}
                      </span>
                      <button
                        onClick={() => removeBreak(breakPeriod.id)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <input
                      type="time"
                      value={newBreak.start}
                      onChange={(e) =>
                        setNewBreak((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      placeholder="Start"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="time"
                      value={newBreak.end}
                      onChange={(e) =>
                        setNewBreak((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      placeholder="End"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <button
                      onClick={addBreak}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultants */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Select Consultants (Available for All Sessions)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONSULTANTS.map((consultant) => (
                  <label
                    key={consultant}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border-2
                      ${
                        selectedConsultants.includes(consultant)
                          ? "bg-indigo-50 border-indigo-500 shadow-md"
                          : "bg-slate-50 border-slate-200 hover:border-indigo-300"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConsultants.includes(consultant)}
                      onChange={() => toggleConsultant(consultant)}
                      className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {consultant}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAppointments}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Appointment Slots
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 p-6 border border-indigo-100 sticky top-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Generated Slots
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    {generatedSlots.length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Consultants</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {selectedConsultants.length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Break Periods</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {timeSettings.breaks.length}
                  </span>
                </div>
              </div>

              {generatedSlots.length > 0 && (
                <button
                  onClick={saveAppointments}
                  disabled={isSaving}
                  className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Appointments
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generated Slots Preview */}
        {generatedSlots.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg shadow-indigo-100/50 p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Generated Appointment Slots
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${
                    editMode
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {editMode ? "Exit Edit Mode" : "Edit Mode"}
              </button>
            </div>

            {/* Edit Mode Panel */}
            {editMode && (
              <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Bulk Edit Tools
                </h3>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Filter by Date
                    </label>
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                      <option value="">All Dates</option>
                      {uniqueDates.map((date) => (
                        <option key={date} value={date}>
                          {date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Filter by Consultant
                    </label>
                    <select
                      value={filterConsultant}
                      onChange={(e) => setFilterConsultant(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                      <option value="">All Consultants</option>
                      {selectedConsultants.map((consultant) => (
                        <option key={consultant} value={consultant}>
                          {consultant}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bulk Actions */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Bulk Actions for Filtered Slots ({filteredSlots.length}{" "}
                    slots)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONSULTANTS.map((consultant) => (
                      <div
                        key={consultant}
                        className="flex items-center gap-1 bg-white rounded-lg p-2 border border-indigo-200"
                      >
                        <span className="text-xs font-medium text-slate-700 px-2">
                          {consultant}
                        </span>
                        <button
                          onClick={() => bulkAddConsultant(consultant)}
                          className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-all"
                          title={`Add ${consultant} to filtered slots`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => bulkRemoveConsultant(consultant)}
                          className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
                          title={`Remove ${consultant} from filtered slots`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs text-indigo-700 bg-indigo-100 rounded-lg p-3">
                  <strong>Tip:</strong> Use filters to select specific dates or
                  consultants, then use the + button to add or - button to
                  remove consultants from all filtered slots at once.
                </div>
              </div>
            )}

            {/* Slots Display */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">
                {editMode
                  ? `Showing ${filteredSlots.length} of ${generatedSlots.length} slots`
                  : "Click consultants to toggle availability"}
              </span>
              {(filterDate || filterConsultant) && (
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterConsultant("");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
              {(editMode ? filteredSlots : generatedSlots).map(
                (slot, index) => {
                  const actualIndex = editMode
                    ? generatedSlots.indexOf(slot)
                    : index;
                  return (
                    <div
                      key={actualIndex}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-800">
                            {slot.date}
                          </div>
                          <div className="text-sm text-slate-600">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full">
                          {slot.consultants.length} available
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedConsultants.map((consultant) => {
                          const isAvailable =
                            slot.consultants.includes(consultant);
                          return (
                            <button
                              key={consultant}
                              onClick={() =>
                                toggleSlotConsultant(actualIndex, consultant)
                              }
                              className={`
                                px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                ${
                                  isAvailable
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-white text-slate-600 border border-slate-300 opacity-50"
                                }
                              `}
                            >
                              {consultant}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AppointmentSchedulePage;