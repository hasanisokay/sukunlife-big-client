"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import getAllProducts from "@/utils/getAllProducts.mjs";
import SearchBar from "@/components/search/SearchBar";
import addToCart from "@/components/cart/functions/addToCart.mjs";
import { useDispatch, useSelector } from "react-redux";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import ProductImage2 from "@/components/home/ProductImage2";
import getTwoLinesOfDescription from "@/utils/getTwoLinesOfDescription.mjs";
import SliderOnShopHeader from "./SliderOnShopHeader";
import FixedCart from "@/components/shared/FixedCart";

const AllShopItems = ({ p, totalCount }) => {
  const cartItems = useSelector((state) => state.cart.cartData);
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


  return (
    <div className="montserrat-font text-black">

      <SliderOnShopHeader />
      {/* Main Content */}
      <div className=" p-8 relative z-10" ref={containerRef}>
        {/* Header Section */}
        <section className="mb-12 text-center px-4">
          <h2 className="charisSIL-font md:text-[60px] pt-[44px] text-[30px] font-bold leading-tight text-center dark:text-white">
            Your Path to <span className="text-green">Spiritual Healing</span> <br /> <span className="text-green">& Well-Being</span>
          </h2>
        </section>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar placeholder="Search Product" />
        </div>

        {/* Product Grid */}
        <div className="flex items-center justify-center flex-wrap gap-[30px]">
          {memorizedProducts?.map((product, index) => (
            <div key={product?._id} className="bg-[#F8F5F5] rounded-t-[26px] rounded-b-3xl ">
              <div
                className="h-[500px] rounded-t-[26px] rounded-b-3xl  overflow-hidden transition-all duration-300  group"
              >
                {/* Image Container */}
                <Link href={`/shop/${product?.productId}`} passHref>
                  <div className="relative h-[213px] overflow-hidden ">
                    <ProductImage2
                      classProps={' rounded-3xl'}
                      src={product?.images[0]}
                      alt={product?.title} width={'350px'} height={'213px'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="pt-[25px] px-[14px] flex flex-col justify-between">
                  <div>
                    <Link href={`/shop/${product?.productId}`} passHref>
                      <h4 className="text-[20px] font-semibold line-clamp-2 w-[282px] h-[35px]">{product?.title}</h4>
                      <p className="min-h-[90px] line-clamp-4 text-base text-wrapped w-[298px]">{getTwoLinesOfDescription(product?.description, 90)}</p>
                    </Link>
                    <div className="relative flex pt-[16px]  justify-between items-center">
                      {product?.previousPrice && <p className="absolute -top-1 text-[#878484] line-through">{product?.previousPrice} TK</p>}
                      <p className="text-[20px] font-bold min-w-[118px]">
                        {product.price} TK
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product, false);
                        }}
                        className="w-[180px] min-w-fit h-[59px] rounded-full  bg-orange text-black font-semibold"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

              </div>


            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div
            className="flex justify-center mt-12"
          >
            <div className="w-8 h-8 border-4 border-[#2e3e23] rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Loading more products...</p>
          </div>
        )}

        {/* No More Products Message */}
        {!hasMore && (
          <div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-12 text-gray-600 dark:text-gray-400 flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            No more products to load.
          </div>
        )}
      </div>

      {/* Fixed Cart Icon */}

      <FixedCart />
      <ToastContainer transition={Flip} />
    </div>
  );
};

export default AllShopItems;