'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { setUserData } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import formatDate from "@/utils/formatDate.mjs";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';
import changePassword from '@/utils/changePassword.mjs';
import updateUserPhoto from '@/utils/updateUserPhoto.mjs';
import { toggleTheme } from "@/store/slices/themeSlice";
import uploadFile from '@/utils/uploadFile.mjs';
const SettingsPage = () => {
    const user = useSelector((state) => state.user.userData);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");

    const theme = useSelector((state) => state.theme.mode);
    const themeSwitch = (
        <div className="flex flex-col gap-2 w-40">
            <label
                htmlFor="theme-select"
                className="text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
                Choose Theme
            </label>

            <div className="relative">
                <select
                    id="theme-select"
                    value={theme}
                    onChange={(e) => dispatch(toggleTheme(e.target.value))}
                    className="
          w-full appearance-none rounded-xl border border-gray-300 
          bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-700 
          shadow-sm transition-all duration-200 
          focus:border-green-500 focus:ring-2 focus:ring-green-500 
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
        "
                >
                    <option value="light">🌞 Light</option>
                    <option value="dark">🌙 Dark</option>
                    {/* <option value="system">💻 System</option> */}
                </select>

                {/* Dropdown arrow */}
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>
        </div>
    );



    useEffect(() => {
        if (user?.photoUrl) setPreviewImage(user.photoUrl);
    }, [user]);


    const refreshAccessToken = async () => {
        try {
            const res = await fetch(`${SERVER}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            });
            const data = await res.json();
            dispatch(setUserData(data?.user))
        } catch {
        }
    }
    const handleImageUpload = async (e) => {
        try {
            setLoading(true);
            const file = e.target.files[0];
            if (!file) return;
            const imageUrl = await uploadFile(file);
            const resData = await updateUserPhoto(imageUrl)
            if (resData.status === 200) {
                await refreshAccessToken();
            }
            toast.success('Photo Updated Successfully.')
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setPasswordError("Passwords don't match");
        }
        try {
            setPasswordError("");
            const resData = await changePassword(passwordData.currentPassword, passwordData.newPassword)
            if (resData.status === 200) {
                setIsEditingPassword(false);
                toast.success('Password Updated Successfully.')
            } else {
                toast.error(resData.message)
                setPasswordError(resData.message);
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || "Password change failed");
        }
    };

    if (!user) return <div>Loading...</div>;

    return (<div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-6 dark:text-white"
        >
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            {/* Profile Picture Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-6 mb-8"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                >
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
                        overflow-hidden cursor-pointer relative">
                        {previewImage ? (
                            <motion.img
                                src={previewImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                            />
                        ) : (
                            <span className="text-2xl font-medium">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                        )}

                        {/* <motion.div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        >
                            <EditSVG className="text-white w-6 h-6" />
                        </motion.div> */}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <motion.button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -right-2 -bottom-2 bg-green p-2 rounded-full shadow-lg "
                        disabled={loading}
                        whileTap={{ scale: 0.9 }}
                    >
                        {loading ? (
                            <motion.span
                                className="loading-spinner w-5 h-5"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    stroke="#ffffff"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M8 13.333h6m-12 0h1.116c.326 0 .49 0 .643-.036q.205-.05.385-.16c.135-.082.25-.198.48-.428L13 4.333a1.414 1.414 0 1 0-2-2L2.625 10.71c-.23.23-.346.346-.429.48q-.11.181-.16.385C2 11.728 2 11.891 2 12.217z"
                                ></path>
                            </svg>
                        )}
                    </motion.button>
                </motion.div>
                <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Joined {formatDate(user.joined)}
                    </p>
                </div>
            </motion.div>

            {/* User Info */}
            <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="space-y-4 mb-12"
            >
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                    <div className="text-gray-900 dark:text-white">{user.name}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <div className="text-gray-900 dark:text-white">{user.email}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mobile</label>
                    <div className="text-gray-900 dark:text-white">{user.mobile}</div>
                </div>
            </motion.div>
            <div className=" logo-lg mb-10">
                {themeSwitch}
            </div>
            {/* Password Change Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t dark:border-gray-700 pt-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Password</h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="px-4 py-2 text-green rounded-lg"
                    >
                        {isEditingPassword ? 'Cancel' : 'Change Password'}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isEditingPassword && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handlePasswordChange}
                            className="space-y-4 overflow-hidden"
                        >
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
                                required
                            />
                            {passwordError && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm"
                                >
                                    {passwordError}
                                </motion.div>
                            )}
                            <button

                                type="submit"
                                className="w-[300px] h-[60px]  bg-green text-white rounded-full "
                            >
                                Update Password
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
        <ToastContainer transition={Flip} />
    </div>
    );
};

export default SettingsPage;