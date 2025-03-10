'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { setUserData } from "@/store/slices/authSlice";
import uploadImage from "@/utils/uploadImage.mjs";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { EditSVG, UploadSVG } from "@/components/svg/SvgCollection";
import formatDate from "@/utils/formatDate.mjs";
import { SERVER } from '@/constants/urls.mjs';
import { Flip, toast, ToastContainer } from 'react-toastify';

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
            const data = await res.json()
            dispatch(setUserData(data?.user))
        } catch {
        }
    }
    const handleImageUpload = async (e) => {
        try {
            setLoading(true);
            const file = e.target.files[0];
            if (!file) return;

            const imageUrl = await uploadImage(file);
            const res = await fetch(`${SERVER}/api/user/update-user-info`, {
                method: "PUT",
                body: JSON.stringify({
                    photoUrl: imageUrl
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const resData = await res.json();
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
            const res = await fetch(`${SERVER}/api/user/update-user-info`, {
                method: "PUT",
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const resData = await res.json();
            
            console.log(resData)
            return
            if (resData.status === 200) {
                setIsEditingPassword(false);
                toast.success('Password Updated Successfully.')
            }else{
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
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        )}

                        <motion.div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        >
                            <EditSVG className="text-white w-6 h-6" />
                        </motion.div>
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
                        className="absolute -right-2 -bottom-2 bg-purple-500 p-2 rounded-full shadow-lg hover:bg-purple-600"
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
                            <UploadSVG className="text-white w-5 h-5" />
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
                        className="px-4 py-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-lg"
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
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                            >
                                Update Password
                            </motion.button>
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