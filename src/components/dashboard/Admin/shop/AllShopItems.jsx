'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import getAllProducts from '@/utils/getAllProducts.mjs';
import StarRating from '@/components/rating/StarRating';
import SearchBar from '@/components/search/SearchBar';
import { AddCartSVG, BuyNowSVG, TakaSVG } from '@/components/svg/SvgCollection';
import addToCart from '@/components/cart/functions/addToCart.mjs';
import { useDispatch, useSelector } from 'react-redux';
import { setCartData } from '@/store/slices/cartSlice';
import { Flip, toast, ToastContainer } from 'react-toastify';
import ProductImage from '@/components/home/ProductImage';

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
        setProducts(p)
    }, [p])


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
                console.error('Error fetching products:', error);
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
                console.log(e)
            }
        };
        const debouncedScroll = debounce(handleScroll, 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    // Debounce function
    const debounce = (func, delay) => {
        try {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        } catch {

        }
    };
    const handleAddToCart = async (product, buyNow) => {
        const cartItem = {
            _id: product._id,
            type: 'product',
            productId: product?.productId,
            title: product?.title,
            price: product.price,
            quantity: 1,
            color: product?.colorVariants?.length > 0 ? product.colorVariants[0] : "",
            size: product?.sizeVariants?.length > 0 ? product.sizeVariants[0] : "",
            image: product?.images[0] || "",
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
    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotate: -2 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          rotate: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: i * 0.1,
          },
        }),
        hover: {
          scale: 1.03,
          boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
          transition: { duration: 0.3 },
        },
      };
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto" ref={containerRef}>
                <div className='mb-4'>
                    <SearchBar placeholder={"Search Product"} />
                </div>
                {/* Product Grid */}
      {/* Product Grid with Enhanced Styling */}
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
                  className="bg-white dark:bg-gray-950 rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-800 group"
                >
                  {/* Enhanced Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <ProductImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Details with Enhanced Styling */}
                  <div className="p-5">
                    <h2 className="min-h-[56px] text-lg font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {product.title}
                    </h2>
                    
                    <div className=" mt-3">
                      <p className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
                        <TakaSVG className="w-5 h-5 mr-1" /> {product.price}
                      </p>
                      <StarRating
                        totalRating={product.ratingSum}
                        ratingCount={product.reviewsCount}
                        size="sm"
                      />
                    </div>

                    {/* Enhanced Buttons */}
                    <div className="mt-4 flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product, false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                      >
                        <AddCartSVG className="w-5 h-5" /> Add
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product, true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300"
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
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default AllShopItems;