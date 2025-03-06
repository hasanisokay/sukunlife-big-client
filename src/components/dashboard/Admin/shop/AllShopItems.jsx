"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import getAllProducts from "@/utils/getAllProducts.mjs";
import StarRating from "@/components/rating/StarRating";
import SearchBar from "@/components/search/SearchBar";
import { AddCartSVG, BuyNowSVG, TakaSVG } from "@/components/svg/SvgCollection";
import addToCart from "@/components/cart/functions/addToCart.mjs";
import { useDispatch, useSelector } from "react-redux";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import ProductImage from "@/components/home/ProductImage";

// SVG Decorative Element
const WaveSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-32 text-purple-100 dark:text-purple-800" fill="currentColor" viewBox="0 0 1440 120">
    <path d="M1440 0H0v60c200 30 400 60 720 60s520-30 720-60V0z" />
  </svg>
);

const AllShopItems = ({ p, totalCount }) => {
  const [products, setProducts] = useState(p);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products?.length < totalCount || false);
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef(null);
  const memorizedProducts = useMemo(() => products, [products]);
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!hasMounted) return;
    setProducts(p);
  }, [p]);

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const newProducts = await getAllProducts(page);
        if (newProducts.status !== 200) return;
        if (newProducts?.products?.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prev) => [...prev, ...newProducts?.products]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  // Handle infinite scroll with debounce
  useEffect(() => {
    if (loading || !hasMore || !containerRef?.current) return;
    const handleScroll = () => {
      try {
        if (
          containerRef.current &&
          window.innerHeight + document.documentElement.scrollTop >=
            containerRef.current.offsetHeight - 100 &&
          !loading &&
          hasMore
        ) {
          setPage((prev) => prev + 1);
        }
      } catch (e) {
        console.log(e);
      }
    };
    const debouncedScroll = debounce(handleScroll, 200);
    window.addEventListener("scroll", debouncedScroll);
    return () => window.removeEventListener("scroll", debouncedScroll);
  }, [loading, hasMore]);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleAddToCart = async (product, buyNow) => {
    const cartItem = {
      _id: product._id,
      type: "product",
      productId: product?.productId,
      title: product?.title,
      price: product.price,
      quantity: 1,
      color: product?.colorVariants?.length > 0 ? product.colorVariants[0] : "",
      size: product?.sizeVariants?.length > 0 ? product.sizeVariants[0] : "",
      image: product?.images[0] || "",
      unit: product?.unit,
    };
    const c = await addToCart(cartItem, user);
    dispatch(setCartData(c));

    if (buyNow) {
      window.location.href = "/cart";
    } else {
      toast.success("Added to cart.", { autoClose: 700 });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotate: -2 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: i * 0.1,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-purple-900 dark:via-gray-900 dark:to-teal-900 text-gray-800 dark:text-gray-100">
      {/* Decorative Wave Background */}
      <WaveSVG />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 relative z-10" ref={containerRef}>
        {/* Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
            </svg>
            Shop All Products
          </h1>
          <p className="text-lg md:text-xl mt-4 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <svg className="w-6 h-6 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432 .917-4.995 2.638-4.995 5.458v10.391h-5.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433 .917-4.996 2.638-4.996 5.458v10.391h-5z" />
            </svg>
            Discover our curated collection of unique products.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar placeholder="Search Product" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          <AnimatePresence>
            {memorizedProducts?.map((product, index) => (
              <Link key={product?._id} href={`/shop/${product?.productId}`} passHref>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  custom={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-purple-100 dark:border-purple-800 group"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <ProductImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex flex-col justify-between h-64">
                    <div>
                      <h2 className="min-h-[56px] text-lg font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                        {product.title}
                      </h2>
                      <div className="mt-3">
                        <p className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
                          <TakaSVG className="w-5 h-5 mr-1" /> {product.price}
                        </p>
                        <StarRating
                          totalRating={product.ratingSum}
                          ratingCount={product.reviewsCount}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product, false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                      >
                        <AddCartSVG className="w-5 h-5" /> Add
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product, true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
                      >
                        <BuyNowSVG className="w-5 h-5" /> Buy
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mt-12"
          >
            <div className="w-8 h-8 border-4 border-purple-500 rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Loading more products...</p>
          </motion.div>
        )}

        {/* No More Products Message */}
        {!hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-12 text-gray-600 dark:text-gray-400 flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            No more products to load.
          </motion.div>
        )}
      </div>

      {/* Decorative Footer Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 text-teal-100 dark:text-teal-800" fill="currentColor" viewBox="0 0 1440 120">
        <path d="M1440 120H0V60C200 30 400 0 720 0s520 30 720 60v60z" />
      </svg>

      <ToastContainer transition={Flip} />
    </div>
  );
};

export default AllShopItems;