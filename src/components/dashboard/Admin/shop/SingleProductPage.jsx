'use client';
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import StarRating from "@/components/rating/StarRating";
import StarsOnly from "@/components/rating/StarsOnly";
import Link from "next/link";
import formatDate from "@/utils/formatDate.mjs";
import BlogContent from "@/components/blogs/BlogContnet";
import { useDispatch, useSelector } from "react-redux";
import addToCart from "@/components/cart/functions/addToCart.mjs";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import ThumbnailImage from "./ThumbnailImage";
import ImageWithFallback from "./ImageWithFallback";
import FixedCart from "@/components/shared/FixedCart";

const SingleProductPage = ({ product }) => {
    const [selectedColor, setSelectedColor] = useState(product?.colorVariants[0]);
    const [selectedSize, setSelectedSize] = useState(product?.sizeVariants[0] || product?.variantPrices[0]?.price);
    const [quantity, setQuantity] = useState(1);
    const [currentPrice, setCurrentPrice] = useState(product?.price);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const user = useSelector((state) => state.user.userData);
    const dispatch = useDispatch()
    const totalRating = product?.reviews.reduce((sum, review) => sum + review.rating, 0);
    const ratingCount = product?.reviews.length;
    const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0); // Track selected thumbnail
    useEffect(() => {
        if (thumbsSwiper) {
            setSelectedThumbnailIndex(thumbsSwiper.activeIndex);
        }
    }, [thumbsSwiper]);
    // Update price when color or size changes
    useEffect(() => {
        if (product?.variantPrices?.length > 0) {
            let newPrice;
            newPrice = product?.variantPrices.find((p) => p.size === selectedSize);
            if (newPrice) {
                setCurrentPrice(newPrice?.price * quantity)
                setSelectedSize(newPrice?.size)
            }
            else {
                newPrice = product?.variantPrices.find((p) => p.color === selectedColor);
            }
            if (newPrice) {
                setCurrentPrice(newPrice?.price * quantity);
                setSelectedSize(newPrice?.size);
                setSelectedColor(newPrice?.color);
            }
            else {
                setCurrentPrice(variantPrices[0]?.price * quantity);
                setSelectedSize(variantPrices[0]?.size);
                setSelectedColor(variantPrices[0]?.color);
            }
        } else {
            setCurrentPrice(product?.price * quantity)
        }

    }, [selectedSize, quantity, selectedColor])


    const handleAddToCart = async (buyNow) => {
        const cartItem = {
            _id: product._id,
            type: 'product',
            productId: product?.productId,
            title: product?.title,
            price: currentPrice,
            quantity: quantity,
            color: selectedColor,
            size: parseFloat(selectedSize),
            image: product?.images[0],
            unit: product?.unit
        };
        const c = await addToCart(cartItem, user);
        dispatch(setCartData(c));

        if (buyNow) {
            window.location.href = "/cart"
        } else {
            toast.success('Added to cart.', { autoClose: 700 })
        }
    };

    // Prevent right-click on images
    const handleImageContextMenu = (e) => {
        e.preventDefault();
    };
    console.log(product)
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-8 montserrat-font">
            <div className="max-w-6xl mx-auto">
                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image Swiper */}
                        <Swiper
                            onSlideChange={(e) => {
                                setSelectedThumbnailIndex(e?.activeIndex)
                                thumbsSwiper?.slideTo(e?.activeIndex)
                            }}
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[Navigation, Thumbs]}
                            className="rounded-lg"
                            onContextMenu={handleImageContextMenu} // Prevent right-click
                        >
                            {product?.images.map((image, index) => (
                                <SwiperSlide key={index}
                                >
                                    {/* <motion.img
                                        src={image}
                                        alt={`${product?.title} ${index + 1}`}
                                        className="w-full h-96 object-cover rounded-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        onContextMenu={handleImageContextMenu} // Prevent right-click
                                    /> */}
                                    <ImageWithFallback
                                        src={image}
                                        alt={`${product?.title} ${index + 1}`}
                                        className="w-full h-96 object-cover rounded-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        onContextMenu={handleImageContextMenu} // Prevent right-click
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Thumbnail Swiper */}
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={4}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[Thumbs]}
                            className="mt-4"
                        >
                            {product?.images.map((image, index) => (
                                // <SwiperSlide key={index}>
                                //     <motion.img
                                //         src={image}
                                //         alt={`${product?.title} ${index + 1}`}
                                //         // className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                                //         className={`w-24 h-24 object-cover rounded-lg cursor-pointer transition-all duration-300
                                //             ${selectedThumbnailIndex === index ? 'border-4 border-blue-500' : 'border-2 border-transparent'}`}
                                //         whileTap={{ scale: 0.95 }}
                                //         onContextMenu={handleImageContextMenu}

                                //         onClick={() => {
                                //             setSelectedThumbnailIndex(index); // Update the selected thumbnail index
                                //             thumbsSwiper?.slideTo(index); // Change the main image to the clicked thumbnail
                                //         }}
                                //     />
                                // </SwiperSlide>
                                <SwiperSlide key={index}>
                                    <ThumbnailImage
                                        onContextMenu={handleImageContextMenu}
                                        src={image}
                                        alt={`${product?.title} ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg cursor-pointer transition-all duration-300"
                                        selected={selectedThumbnailIndex === index}
                                        onClick={() => {
                                            setSelectedThumbnailIndex(index); // Update the selected thumbnail index
                                            thumbsSwiper?.slideTo(index); // Change the main image to the clicked thumbnail
                                        }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <button className={`rounded-full w-[118px] h-[41px] ${product.stockQuantity < 1 ? 'bg-red-500 text-white' : 'text-black bg-[#68D585]'}`}>
                            {product.stockQuantity > 0 ? "In Stock" : "Out of stock"}
                        </button>
                        <h1 className="md:text-3xl text-lg font-bold">{product?.title}</h1>
                        {/* StarRating Component */}
                        <div className="flex flex-wrap justify-start items-center gap-4">
                            <p className="text-2xl font-semibold flex items-center"> BDT {currentPrice}</p>
                            <Link href={"#reviews"}>
                                <StarRating totalRating={totalRating} ratingCount={ratingCount} />
                            </Link>
                        </div>

                        {/* Quantity and Unit */}
                        <p className="text-gray-600 dark:text-gray-400">
                            {selectedSize}
                        </p>

                        {/* Stock Quantity */}


                        {/* Color Variants */}
                        {product?.colorVariants?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Color</h3>
                                <div className="flex space-x-2">
                                    {product?.colorVariants.map((color, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 ${selectedColor === color
                                                ? "border-blue-500"
                                                : "border-gray-300"
                                                }`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                        ></motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Variants */}
                        {(product?.variantPrices?.length > 0) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Size</h3>
                                <div className="flex space-x-2">
                                    {product?.variantPrices?.map((size, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                setSelectedSize(size.size)
                                                setCurrentPrice(size.price)
                                            }}
                                            className={`px-4 py-2 border rounded-lg ${selectedSize === size?.size
                                                ? "border-blue-500 bg-blue-300 dark:bg-blue-900"
                                                : "border-gray-300"
                                                }`}
                                        >
                                            {size.size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {product.stockQuantity > 0 && <div className="flex gap-[24px]">
                            <div className="flex items-center space-x-4 border rounded">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 "
                                >
                                    -
                                </motion.button>
                                <span className="text-xl">{quantity}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                    className="px-4 py-2 "
                                >
                                    +
                                </motion.button>
                            </div>
                            {product?.stockQuantity > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex gap-4"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAddToCart(false)}
                                        className=" bg-[#63953A] text-white py-3 rounded-full w-[172px] h-[52px] transition duration-300"
                                    >
                                        Add to Cart
                                    </motion.button>

                                </motion.div>
                            )}
                        </div>}



                    </div>
                </div>

                {/* Product Description */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Product Overview</h2>
                    <div className="prose dark:prose-invert">
                        <BlogContent content={product?.description} />
                    </div>
                </div>

                {/* Additional Product Details */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Product Details</h2>
                    <div className="">

                        <p className="text-gray-600 dark:text-gray-400">Brand: {product?.brand || "N/A"}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Category: <Link href={`/shop?category=${product.category}`} >{product?.category}</Link>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">Material: {product?.material || "N/A"}</p>

                        <p className="text-gray-600 dark:text-gray-400"> Dimensions:
                            {product?.dimensions.length} x {product?.dimensions.width} x {product?.dimensions.height} cm
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">SKU: {product?.sku}</p>

                        <div className="flex flex-wrap gap-2">
                            {product?.tags.split(", ").map((tag, index) => (
                                <Link key={index} href={`/shop?tags=${tag}`}>
                                    <span
                                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                </Link>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                    <div id="reviews" className="space-y-6">
                        {product?.reviews?.map((review, index) => (
                            <div key={index} className="border-b pb-4">
                                <div className="flex items-center flex-wrap space-x-4">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-semibold">
                                            {review?.name?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">{review.name}</h3>
                                        <StarsOnly size={14} star={review.rating} />

                                        {review?.date && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(review?.date)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                        {
                            product?.reviews?.length === 0 && <p>No review available.</p>
                        }
                    </div>
                </div>
            </div>
            {/* Fixed Cart Icon */}
            <FixedCart />
            <ToastContainer transition={Flip} />
        </div >
    );
};

export default SingleProductPage;