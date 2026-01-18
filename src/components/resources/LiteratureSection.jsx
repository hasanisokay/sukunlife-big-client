'use client';

import Image from "next/image";
import BlogContent from "../blogs/BlogContnet";
import { useDispatch, useSelector } from "react-redux";
import addToCart from "../cart/functions/addToCart.mjs";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import resourceCover from "@/../public/images/resources.jpg";
import EmptyState from "../shared/EmptyState";

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
    <section id="literature" className="mt-16 mb-12 max-w-[1200px] mx-auto px-4">

      {/* Empty State */}
      {literatureData.length === 0 ? (
        <EmptyState
          title="No literature available"
          description="Guides, books, and learning materials will be added soon, insha Allah."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  src={lit?.coverPhoto || resourceCover}
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
    </section>
  );
};

export default LiteratureSection;
