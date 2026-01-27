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
import { setCartData, setVoucher } from "@/store/slices/cartSlice";
import convertToBanglaNumber from "../cart/functions/convertToBanglaNumber.mjs";
import updateCart from "../cart/functions/updateCart.mjs";
import { Flip, toast, ToastContainer } from "react-toastify";
import startPaystationPayment from "@/payments/startPaystationPayment.mjs";

const CheckOutPage = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isClient, setIsClient] = useState(false);
    const user = useSelector((state) => state.user.userData);
    const cartItems = useSelector((state) => state.cart.cartData);
    const voucher = useSelector((state) => state.cart.voucher);
    const discount = useSelector((state) => state.cart.discount);
    const theme = useSelector((state) => state.theme.mode);
    const totalPrice = useSelector((state) => state.cart.finalPrice);
    const subtotalPrice = cartItems?.length > 0 ? cartItems?.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    ) : 0
    const [courseInCart, setCourseInCart] = useState(false);
    const [noProductInPage, setNoProductInPage] = useState(false);



    // React Hook Form
    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
    const [deliveryCharge, setDeliveryCharge] = useState(120);

    // Delivery Options
    const deliveryOptions = [
        { value: 120, label: "Outside Dhaka - ৳120" },
        { value: 80, label: "Inside Dhaka - ৳80" },
    ];

    useEffect(() => {
        const existingIndex = cartItems?.findIndex((cartItem) => cartItem.type === 'course');
        const existingIndexForProduct = cartItems?.findIndex((cartItem) => cartItem.type === 'product');
        if (existingIndex !== -1) {
            setCourseInCart(true);
        }
        if (existingIndex !== -1 && existingIndexForProduct === -1) {
            setNoProductInPage(true);
            setDeliveryCharge(0)
        }

    }, [cartItems]);

    useEffect(() => {
        if (user) {
            setValue('name', user.name)
            setValue('phone', user.mobile)
            setValue('email', user.email)
            setValue('address', user?.address || "")
        }
    }, [])
    // Calculate Final Total
    const finalTotalPrice = totalPrice + deliveryCharge;
    const onSubmit = async (data) => {
        if (courseInCart && Object.entries(user ?? {}).length === 0) {
            return toast.error("Login to buy course.");
        }

        const payload = {
            source: "shop",
            name: data.name,
            mobile: data.phone,
            email: data.email,
            address: data.address,
            items: cartItems?.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                variant: {
                    size: item.size || null,
                    color: item.color || null,
                },
                unit: item?.unit || "",
                type: item.type,
            })),
            voucherCode: voucher?.code || null,
            // deliveryArea: data.deliveryArea?.value === 80 ? "Inside Dhaka" : "Outside Dhaka",
            deliveryArea: "test",
        };

        if (user) {
            payload.loggedInUser = { _id: user._id, name: user.name };
        }
// return payload;
        try {
            await startPaystationPayment(payload);
        } catch (err) {
            toast.error("Something went wrong");
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
    const customStyles = (theme = 'light') => ({
        control: (provided) => ({
            ...provided,
            backgroundColor: theme === "dark" ? '#384152' : '#fff', // Dark or light background
            color: theme === "dark" ? '#fff' : '#333', // Text color
            borderColor: theme === "dark" ? '#555' : '#ccc', // Border color
            boxShadow: theme === "dark" ? '0 0 0 1px #555' : '0 0 0 1px #ccc', // Border focus shadow
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? theme === "dark"
                    ? '#444'
                    : '#ddd'
                : state.isFocused
                    ? theme === "dark"
                        ? '#555'
                        : '#f2f2f2'
                    : theme === "dark"
                        ? '#2D2D2D'
                        : '#fff', // Option background colors based on dark or light theme
            color: theme === "dark" ? '#fff' : '#333', // Option text color
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === "dark" ? '#fff' : '#333', // Text color for the selected value
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === "dark" ? '#384152' : '#fff', // Dropdown menu background color
        }),
    });

    useEffect(() => {
        setIsClient(true);
    }, []);
    if (!isClient) return null
    return (
        <>
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
                            {cartItems?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
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
                                                {item.size ? <span className="ml-2 text-xs">Variant: {item?.size} {item?.unit}</span> : <span></span>} {item.color ? <span className="ml-2 text-xs">Color: {item.color}</span> : <span></span>}
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
                                    <TakaSVG /> {subtotalPrice.toLocaleString()}
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
                        className="dark:bg-gray-800 bg-white rounded-lg h-fit shadow-lg p-6"
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
                            {!noProductInPage && <div>
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
                                            styles={customStyles(theme)}
                                            className="dark:text-gray-900"
                                        />
                                    )}
                                />
                            </div>}

                            {/* Payment Instructions */}
                            {/* <div className="mt-10">
                                <h3 className="text-lg font-semibold mb-2">Payment Instructions</h3>
                                <p className="dark:text-gray-400 text-gray-700 mb-4">
                                    আপনি <strong>01845426881</strong> নাম্বারে বিকাশে <strong>{convertToBanglaNumber(finalTotalPrice)}</strong> টাকা সেন্ডমানি করবেন। এরপর বিকাশ নাম্বার অথবা ট্রাঞ্জেকশন আইডি নিচে দিবেন।
                                </p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">বিকাশ নাম্বার বা ট্রাঞ্জেকশন আইডি</label>
                                    <input
                                        {...register("transactionId", { required: "Transaction ID is required" })}
                                        type="text"
                                        placeholder="Enter Bkash/Nagad Transaction ID or Number"
                                        className="w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-full focus:outline-none"
                                    />
                                    {errors.transactionId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.transactionId.message}</p>
                                    )}
                                </div>
                            </div> */}

                            <button
                                type="submit"
                                className="w-full mt-6 px-6 py-3 text-white bg-[#63953a] rounded-full transition"
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
            <ToastContainer transition={Flip} />
        </>

    );
};

export default CheckOutPage;