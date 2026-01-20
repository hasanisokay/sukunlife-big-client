'use client';

import Image from "next/image";
import BlogContent from "../blogs/BlogContnet";
import { useDispatch, useSelector } from "react-redux";
import addToCart from "../cart/functions/addToCart.mjs";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import literatureCover from "@/../public/images/literature.jpg";
import EmptyState from "../shared/EmptyState";

import literatureBanner from "@/../public/images/literature_banner.jpg";

const LiteratureSection = ({ literatureData = [] }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);

  const handleAddToCart = async (product, buyNow) => {
    const cartItem = {
      _id: product._id,
      type: "literature",
      productId: null,
      title: product?.title,
      price: product?.price,
      quantity: 1,
      image: product?.coverPhoto || "",
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
    <div className="mt-16 mb-12 max-w-[1200px] mx-auto px-4">
      {/* Banner */}
      <section className="text-white h-[400px]  flex flex-col items-center justify-center  text-center ">
        <div className="absolute top-0 bottom-0 right-0 left-0 h-[400px] ">
          <Image className="w-full h-[400px]   object-cover pointer-events-none select-none"
            src={literatureBanner}
            width={1000} height={1000} alt="Literature Banner" />
        </div>
        <div className="bg-black bg-opacity-[51%] w-full h-[400px]  absolute top-0 bottom-0 right-0 left-0">
        </div>
        <div className="relative z-10 max-w-4xl md:px-6 px-0  -mt-[150px]">
          <div className="flex flex-col gap-[19px]">
            <h1 className="text-white text-[28px] md:text-[40px] font-bold ">
              Literatire & Guides
            </h1>
            <p className="text-white max-w-[720px] text-base md:text-lg px-2">
              Structured knowledge to help you learn, reflect, and apply.
            </p>
          </div>
        </div>
      </section>
      {/* Empty State */}
      {literatureData.length === 0 ? (
        <EmptyState
          title="No literature available"
          description="Guides, books, and learning materials will be added soon, insha Allah."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:-mt-[20px] -mt-[50px]">
          {literatureData.map((lit) => (
            <div
              key={lit?._id}
              className="bg-[#F8F5F5] rounded-2xl overflow-hidden
                         flex flex-col min-h-[480px]"
            >
              {/* Image */}
              <div className="relative h-[210px] w-full">
                <Image
                  alt={lit.title}
                  fill
                  sizes="(max-width: 640px) 100vw,
                         (max-width: 1024px) 50vw,
                         33vw"
                  className="object-cover"
                  src={lit?.coverPhoto || literatureCover}
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <h4 className="font-bold text-[18px] leading-snug mb-2 line-clamp-2">
                  {lit?.title}
                </h4>

                <div className="text-sm text-gray-700 mb-4 h-[110px] overflow-y-auto">
                  <BlogContent content={lit?.description} />
                </div>

                {/* Price + Action */}
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div>
                    {lit?.previousPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        {parseFloat(lit.previousPrice).toFixed(2)} TK
                      </p>
                    )}

                    {lit?.litType === "paid" ? (
                      <p className="font-bold text-[18px]">
                        {parseFloat(lit.price).toFixed(2)} TK
                      </p>
                    ) : (
                      <p className="font-bold text-[18px]">Free</p>
                    )}
                  </div>

                  {lit?.litType === "free" ? (
                    <a
                      href={lit?.downloadLink}
                      target="_blank"
                      className="px-6 py-3 rounded-full bg-green text-white 
                                 font-semibold text-sm text-center"
                    >
                      Download
                    </a>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(lit, false);
                      }}
                      className="px-6 py-3 rounded-full bg-orange 
                                 text-black font-semibold text-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer transition={Flip} />
    </div>
  );
};

export default LiteratureSection;
