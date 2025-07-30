import Link from "next/link";
import ProductImage from "./ProductImage";
import Image from "next/image";
import getTwoLinesOfDescription from "@/utils/getTwoLinesOfDescription.mjs";
import ProductImage2 from "./ProductImage2";
import TransparentGreenButton from "./TransparentGreenButton";

const ProductSectionHome = ({ topProducts }) => {
    // console.log(topProducts)
    return (
        <div className="montserrat-font text-black pb-[40px]">
            {topProducts?.length > 0 && (
                <div>
                    <div >
                        <h2 className="charisSIL-font md:text-[60px] pt-[44px] text-[30px] font-bold leading-tight text-center dark:text-white">Healing <span className="text-orange">Products</span></h2>
                        <p className="max-w-[90vw] mx-auto text-black dark:text-white text-center  pb-[44px]">We offer prophetic remedies that promote health and well-being. Our products include</p>


                        <div className="flex flex-wrap gap-[33px] justify-center">
                            {topProducts?.map((product) => (
                                <div className="bg-[#F8F5F5] rounded-t-[26px] rounded-b-3xl w-[350px] h-[497px] " key={product._id}>
                                    <ProductImage2
                                        classProps={'rounded-3xl'}
                                        src={product?.images[0]}
                                        alt={product?.title} width={'350px'} height={'213px'} />
                                    <div className="pl-[29px] pr-[23px]">
                                        <h3 className="text-xl font-semibold line-clamp-2 mt-[44px]">{product?.title}</h3>
                                        <p className="mt-[10px] pb-[10px]  h-[95px] ">{getTwoLinesOfDescription(product?.description, 90)}</p>
                                        <button className="w-[266px] h-[59px] bg-orange text-black font-medium rounded-full">Place Order</button>
                                    </div>

                                </div>
                            ))}
                        </div>
                        <TransparentGreenButton hrefLink={'/shop'} text={"View More Product"} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSectionHome;