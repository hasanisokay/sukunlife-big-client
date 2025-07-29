import Link from "next/link";
import ProductImage from "./ProductImage";

const ProductSectionHome = ({ topProducts }) => {
    return (
        <div className="bg-[#F5F5F5]">
            {topProducts?.length > 0 && (
                <div>
                    <div className="mt-12">
                        <h2 className=" md:text-[60px] text-[30px] font-bold leading-tight text-center">Healing <span className="text-[#F7CA41]">Products</span></h2>
                        <p className="max-w-[90vw] text-white text-center pb-[40px]">We offer prophetic remedies that promote health and well-being. Our products include</p>


                        {topProducts?.map((product) => (
                            <div key={product._id}>
                                <div
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[550px] flex flex-col justify-between"
                                >
                                    <div>
                                        <ProductImage src={product?.images[0]} alt={product?.title} />
                                        <h3 className="text-xl font-semibold mt-4 line-clamp-2">{product?.title}</h3>
                                    </div>
                                    <Link href={`/shop/${product.productId}`}>
                                        <button

                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg w-full flex items-center justify-center"
                                        >
                                            View Product
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            )}
        </div>
    );
};

export default ProductSectionHome;