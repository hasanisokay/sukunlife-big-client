
import HomeCardSlider from "./HomeCardSlider";
import TransparentGreenButton from "./TransparentGreenButton";

const ProductSectionHome = ({ topProducts }) => {
    // console.log(topProducts)
    return (
        <>
            {topProducts?.length > 0 && (
                <div className="montserrat-font text-black pb-[40px] px-4">
                    <h2 className="charisSIL-font md:text-[60px] pt-[44px] text-[30px] font-bold leading-tight text-center dark:text-white">Healing <span className="text-orange">Products</span></h2>
                    <p className="max-w-[90vw] mx-auto text-black dark:text-white text-center  pb-[44px]">We offer prophetic remedies that promote health and well-being. Our products include</p>
                    <HomeCardSlider
                        itemType="product"
                        items={topProducts}
                        sliderWrapperClassProps="flex justify-center items-center"
                        nonSliderWrapperClassProps="flex flex-wrap gap-[33px] justify-center"
                        key={'product-home'} />
                    <TransparentGreenButton hrefLink={'/shop'} text={"View More Product"} />
                </div>
            )}
        </>
    );
};

export default ProductSectionHome;