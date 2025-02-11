'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { motion } from "framer-motion";
import Link from "next/link";
import { TakaSVG } from "../svg/SvgCollection";
import { useRouter } from "next/navigation";
import { SERVER } from "@/constants/urls.mjs";
import { setVoucher } from "@/store/slices/cartSlice";
import convertToBanglaNumber from "../cart/functions/convertToBanglaNumber.mjs";

const CheckOutPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartData);
    const voucher = useSelector((state) => state.cart.voucher);
    const discount = useSelector((state) => state.cart.discount);
    const totalPrice = useSelector((state) => state.cart.finalPrice);
    const subtotalPrice = cartItems?.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // React Hook Form
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [deliveryCharge, setDeliveryCharge] = useState(120); // Default to Outside Dhaka

    // Delivery Options
    const deliveryOptions = [
        { value: 120, label: "Outside Dhaka - ৳120" },
        { value: 80, label: "Inside Dhaka - ৳80" },
    ];

    // Calculate Final Total
    const finalTotalPrice = totalPrice + deliveryCharge;

    // Handle Form Submission
    const onSubmit = async (data) => {
        const orderDetails = {
            ...data,
            cartItems,
            voucher,
            discount,
            subtotalPrice,
            deliveryCharge,
            finalTotalPrice,
        };

        console.log("Order Details:", orderDetails);

        // Call API to submit order
        try {
            const response = await fetch("/api/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderDetails),
            });

            if (response.ok) {
                alert("Order placed successfully!");
                router.push("/confirmation");
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        (async () => {
            if (!voucher) {
                const voucherFromStorage = JSON.parse(localStorage.getItem("voucher")) || "";
                if (voucherFromStorage) {
                    await validateVoucher(voucherFromStorage);
                }
            }
        })();
    }, []);

    const validateVoucher = async (voucherPassed) => {
        try {
            const response = await fetch(`${SERVER}/api/public/check-voucher?code=${voucherPassed}&&totalPrice=${subtotalPrice}`);
            const data = await response.json();
            if (data.isValid) {
                const calculatedDiscount = data.discount;
                dispatch(setVoucher({ code: voucherPassed, discount: calculatedDiscount, voucherDetails: data?.voucher }));
            } else {
                localStorage.removeItem('voucher');
            }
        } catch (error) {
            console.log("Error validating voucher:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen dark:bg-gray-900 dark:text-white bg-gray-100 text-gray-900 p-8"
        >
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="dark:bg-gray-800 bg-white rounded-lg shadow-lg p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        {cartItems?.map((item) => (
                            <div key={item._id} className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">{item.title}</h3>
                                        <p className="dark:text-gray-400 text-gray-600 flex items-center">
                                            <TakaSVG /> {item.price.toLocaleString()} x {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-lg font-semibold flex items-center">
                                    <TakaSVG /> {(item.price * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="dark:text-gray-400 text-gray-700">Subtotal</p>
                            <p className="text-lg font-semibold flex items-center">
                                <TakaSVG /> {subtotalPrice?.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="dark:text-gray-400 text-gray-700">Discount</p>
                            <p className="text-lg font-semibold flex items-center">
                                -<TakaSVG /> {discount.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="dark:text-gray-400 text-gray-700">Delivery Charge</p>
                            <p className="text-lg font-semibold flex items-center">
                                <TakaSVG /> {deliveryCharge.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="dark:text-gray-400 text-gray-700">Total</p>
                            <p className="text-xl font-semibold flex items-center">
                                <TakaSVG /> {finalTotalPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Information Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="dark:bg-gray-800 bg-white rounded-lg shadow-lg p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">Delivery Information</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                type="text"
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                {...register("phone", { required: "Phone is required" })}
                                type="text"
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                {...register("email", { required: "Email is required" })}
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <textarea
                                {...register("address", { required: "Address is required" })}
                                placeholder="Enter your delivery address"
                                className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none"
                                rows="3"
                            />
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delivery Area</label>
                            <Controller
                                name="deliveryArea"
                                control={control}
                                defaultValue={deliveryOptions[0]}
                                render={({ field }) => (
                                    <Select
                                        instanceId={"select-delivery-area"}
                                        {...field}
                                        options={deliveryOptions}
                                        onChange={(selected) => {
                                            field.onChange(selected);
                                            setDeliveryCharge(selected.value);
                                        }}
                                        className="dark:text-gray-900"
                                    />
                                )}
                            />
                        </div>

                        {/* Payment Instructions */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Payment Instructions</h3>
                            <p className="dark:text-gray-400 text-gray-700 mb-4">
                                আপনি <strong>017xxx</strong> নাম্বারে বিকাশে/নগদে <strong>{convertToBanglaNumber(finalTotalPrice)}</strong> টাকা সেন্ডমানি করবেন। এরপর বিকাশ নাম্বার অথবা ট্রাঞ্জেকশন আইডি নিচে দিবেন।
                            </p>
                            <div>
                                <label className="block text-sm font-medium mb-1">বিকাশ নাম্বার বা ট্রাঞ্জেকশন আইডি</label>
                                <input
                                    {...register("transactionId", { required: "Transaction ID is required" })}
                                    type="text"
                                    placeholder="Enter Bkash/Nagad Transaction ID or Number"
                                    className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none"
                                />
                                {errors.transactionId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.transactionId.message}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            Confirm Order
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Back to Cart Link */}
            <div className="mt-8 text-center">
                <Link
                    href="/cart"
                    className="px-6 py-2 dark:bg-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    Back to Cart
                </Link>
            </div>
        </motion.div>
    );
};

export default CheckOutPage;