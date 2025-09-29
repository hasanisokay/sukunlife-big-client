'use client'

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import updateCart from "./functions/updateCart.mjs";
import Link from "next/link";
import { TakaSVG } from "../svg/SvgCollection";
import { removeVoucher, setCartData, setVoucher } from "@/store/slices/cartSlice";
import { SERVER } from "@/constants/urls.mjs";
import { useRouter } from "next/navigation";

const CartPage = () => {
    const user = useSelector((state) => state.user.userData);
    const [courseInCart, setCourseInCart] = useState(false);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [typedVoucher, setTypedVoucher] = useState("");
    const [voucherMessage, setVoucherMessage] = useState('')
    const [voucherError, setVoucherError] = useState('')
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartData);
    const voucher = useSelector((state) => state.cart.voucher);
    const discount = useSelector((state) => state.cart.discount);
    const totalPrice = useSelector((state) => state.cart.finalPrice);
    const validateVoucher = async (updatedCartItems = [], voucherPassed) => {
        if (!typedVoucher && !voucherPassed) return;
        let newCartItems = updatedCartItems.length > 0 ? updatedCartItems : cartItems;
        try {
            const subtotal = newCartItems?.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );

            const response = await fetch(`${SERVER}/api/public/check-voucher?code=${typedVoucher || voucherPassed}&&totalPrice=${subtotal}`);
            const data = await response.json();
            if (data.isValid) {
                const calculatedDiscount = data.discount;
                const calculatedFinalPrice = data.finalPrice;
                dispatch(setVoucher({ code: typedVoucher, discount: calculatedDiscount, voucherDetails: data.voucher }));
                setVoucherError('');
                setVoucherMessage(data.message);
                localStorage.setItem('voucher', JSON.stringify(typedVoucher || voucherPassed))
            } else {
                setVoucherMessage('')
                setVoucherError(data.message);

            }
        } catch (error) {
            console.log("Error validating voucher:", error);
            // alert("Failed to validate voucher");
        }
    };
    useEffect(() => {
        const existingIndex = cartItems?.findIndex((cartItem) => cartItem.type === 'course');
        if (existingIndex !== -1) {
            setCourseInCart(true);
        }
    }, [cartItems]);
    useEffect(() => {
        (async () => {
            if (voucher) {
                setTypedVoucher(voucher);
            } else {
                const voucherFromStorage = JSON.parse(localStorage.getItem("voucher")) || "";
                if (voucherFromStorage) {
                    setTypedVoucher(voucherFromStorage);
                    await validateVoucher(cartItems, voucherFromStorage)
                }
            }
        })()
    }, [])
    // console.log(cartItems)
    // Update quantity of an item
    const updateQuantity = async (id, newQuantity) => {
        const updatedCart = cartItems.map((item) =>
            item._id === id ? { ...item, quantity: newQuantity } : item
        );
        dispatch(setCartData(updatedCart));
        dispatch(removeVoucher());
        await updateCart(updatedCart, user);
        await validateVoucher(updatedCart);
    };

    // Remove item from cart
    const removeItem = async (item) => {
        const uniqueId = `${item?._id}-${item?.size || "default"}-${item?.color || "default"}`;
        const updatedCart = cartItems.filter((cartItem) => `${cartItem._id}-${cartItem.size || "default"}-${cartItem.color || "default"}` !== uniqueId)
          
        dispatch(removeVoucher());
        dispatch(setCartData(updatedCart));
        await updateCart(updatedCart, user);
        await validateVoucher(updatedCart);

    };
    const subtotalPrice = cartItems?.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null

    return (
        <div className={`min-h-screen p-8`}>
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            {cartItems?.length === 0 ? (
                <div className="text-center py-12 mx-auto max-w-fit">
                    <p className="text-xl">Your cart is empty.</p>
                    <Link href="/shop" className="mt-4 block w-fit px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {cartItems?.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex flex-col md:flex-row  justify-between p-6 dark:bg-gray-800 bg-white rounded-lg shadow-lg`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h2 className="md:text-xl text-base font-semibold">{item.title}</h2>
                                            <p className={` dark:text-gray-400 text-gray-600 flex items-center font-semibold`}> <TakaSVG /> {(parseFloat(item?.price) * parseInt(item.quantity))?.toLocaleString()}
                                                {item.size ? <span className="ml-2 text-xs">Variant: {item?.size} {item?.unit}</span> : <span></span>} {item.color ? <span className="ml-2 text-xs">Color: {item.color}</span> : <span></span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, Math.max(1, item.quantity - 1))
                                                }
                                                className={`px-3 py-1 dark:bg-gray-700 bg-gray-200  rounded-lg dark:hover:bg-gray-600 hover:bg-gray-300 transition`}
                                            >
                                                -
                                            </button>
                                            <span className={`px-3 py-1  dark:bg-gray-700 bg-gray-200 rounded-lg`}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className={`px-3 py-1 dark:bg-gray-700 bg-gray-200 rounded-lg dark:hover:bg-gray-600 hover:bg-gray-300 transition`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <div className="mt-8 p-6 dark:bg-gray-800 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="dark:text-gray-400 text-gray-700 ">Subtotal</p>
                                <p className="text-xl font-semibold flex items-center"><TakaSVG /> {subtotalPrice?.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="dark:text-gray-400 text-gray-700 ">Discount</p>
                                <p className="text-xl font-semibold flex items-center">-<TakaSVG />{discount?.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="dark:text-gray-400 text-gray-700 ">Total</p>
                                <p className="text-xl font-semibold flex items-center"><TakaSVG />{totalPrice?.toLocaleString()}</p>
                            </div>
                            <div className="mt-4 flex gap-4 md:flex-nowrap flex-wrap">
                                <input
                                    type="text"
                                    placeholder="Enter voucher code"
                                    value={typedVoucher}
                                    onChange={(e) => setTypedVoucher(e.target.value)}
                                    className={`w-full px-4 py-2 dark:bg-gray-700 dark:text-white bg-gray-200 text-gray-900 rounded-lg focus:outline-none`}
                                />
                                <button className="md:w-[200px] w-[130px] h-fit md:px-6 py-1 md:py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                                    onClick={validateVoucher}>Apply Voucher</button>
                            </div>
                            {voucherMessage?.length > 0 && <p className="text-green-500">{voucherMessage}</p>}
                            {voucherError?.length > 0 && <p className="text-red-500">{voucherError}</p>}
                        </div>
                        {courseInCart && !user && cartItems?.length > 0 && (
                            <div className="mt-4 text-center">
                                You need to <Link className="text-blue-500" href={'/login'}>login</Link> to buy a course.
                            </div>
                        )}
                        <button
                            disabled={courseInCart && !user}
                            onClick={() => router.push("/checkout")}
                            className="w-full mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;