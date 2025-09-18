'use client'

import Image from "next/image";
import BlogContent from "../blogs/BlogContnet";
import { useDispatch, useSelector } from "react-redux";
import addToCart from "../cart/functions/addToCart.mjs";
import { setCartData } from "@/store/slices/cartSlice";
import { Flip, toast, ToastContainer } from "react-toastify";
import resourceCover from "@/../public/images/resources.jpg";


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
            color: "",
            size: "",
            image: product?.coverPhoto || "",
            unit: "",
        };
        const c = await addToCart(cartItem, user);
        dispatch(setCartData(c));

        if (buyNow) {
            window.location.href = "/cart";
        } else {
            toast.success("Added to cart.", { autoClose: 700 });
        }
    };
    if (literatureData?.length === 0) return;
    return (
        <section id="literature">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-[30px]">
                {literatureData?.map(lit => <div key={lit?._id} className="w-[350px] bg-[#F8F5F5] h-[496px] rounded-[27px]">
                    <Image
                        alt={lit.title}
                        height={500}
                        width={500}
                        className="w-[350px] h-[213px] object-cover rounded-[27px]"
                        src={lit?.coverPhoto || resourceCover}
                    />
                    <div className="pl-[29px]  pr-[23px] pt-[25px]">
                        <h4 className="font-bold text-[20px]">
                            {lit?.title}
                        </h4>
                        <div className="h-[130px] overflow-y-auto">
                            <BlogContent content={lit?.description} />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <div className="relative w-[130px]">
                                {lit?.previousPrice && <p className="absolute -top-[10px] font-semibold text-[#878484] text-sm line-through">{parseFloat(lit?.previousPrice)?.toFixed(2)} TK</p>
                                }                                {lit?.litType === "paid" ? <p className="font-bold text-[20px]">
                                    {parseFloat(lit.price).toFixed(2)} TK
                                </p> : <p className="font-bold text-[20px]">Free
                                </p>}
                            </div>
                            {lit?.litType === "free" ? <button className="lg:w-[180px] lg:h-[59px] w-[150px] h-[45px] bg-green rounded-full text-white font-semibold">
                                <a target="_blank" href={lit?.downloadLink}>Download</a>
                            </button> : <button onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(lit, false);
                            }}
                                className="lg:w-[180px] lg:h-[59px] w-[150px] h-[45px] rounded-full  bg-orange text-black font-semibold">
                                Add To Cart
                            </button>}
                        </div>
                    </div>
                </div>)}
            </div>
            <ToastContainer transition={Flip} />
        </section >
    );
};

export default LiteratureSection;