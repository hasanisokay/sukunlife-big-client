'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import getAllProducts from '@/utils/getAllProducts.mjs';
import StarRating from '@/components/rating/StarRating';

const AllShopItems = ({ p, totalCount }) => {
    const [products, setProducts] = useState(p);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(p?.length < totalCount);
    const [hasMounted, setHasMounted] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true);
            return;
        }
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const newProducts = await getAllProducts(page);
                if (newProducts?.products?.length === 0) {
                    setHasMore(false);
                } else {
                    setProducts((prev) => [...prev, ...newProducts?.products]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page]);

    // Handle infinite scroll with debounce
    useEffect(() => {
        const handleScroll = () => {
            if (
                containerRef.current &&
                window.innerHeight + document.documentElement.scrollTop >=
                    containerRef.current.offsetHeight - 100 &&
                !loading &&
                hasMore
            ) {
                setPage((prev) => prev + 1);
            }
        };

        const debouncedScroll = debounce(handleScroll, 200);
        window.addEventListener('scroll', debouncedScroll);
        return () => window.removeEventListener('scroll', debouncedScroll);
    }, [loading, hasMore]);

    // Debounce function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-8">
            <div className="max-w-6xl mx-auto" ref={containerRef}>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {products?.map((product, index) => (
                            <Link key={product._id} href={`/${product.productId}`} passHref>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={product?.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold line-clamp-2">{product.title}</h2>
                                        <p className="text-xl font-bold mt-2">${product.price}</p>
                                        {/* StarRating Component */}
                                        <div className="mt-2">
                                            <StarRating
                                                totalRating={product.ratingSum}
                                                ratingCount={product.reviewsCount}
                                            />
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
                        className="flex justify-center mt-8"
                    >
                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin"></div>
                        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading more products...</p>
                    </motion.div>
                )}

                {/* No More Products Message */}
                {!hasMore && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center mt-8 text-gray-600 dark:text-gray-400"
                    >
                        No more products to load.
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AllShopItems;