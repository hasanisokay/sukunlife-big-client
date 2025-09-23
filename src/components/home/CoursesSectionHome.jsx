import Link from "next/link";
import HomeCardSlider from "./HomeCardSlider";
const CoursesSectionHome = ({ topCourses }) => {
    if (!topCourses) return null;
    return (
        <>
            {topCourses?.length > 0 && (
                <div className="bg-[#00060F] md:pt-[108px] md:pb-[112px] pb-[80px] pt-[80px] px-4">
                    <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center"><span className="text-white">Courses</span> <span className="text-[#F7CA41]">& Learning</span></h2>
                    <p className="max-w-[90vw] text-white text-center pb-[40px]">We offer prophetic remedies that promote health and well-being. Our products include</p>

                    <HomeCardSlider
                        itemType="course"
                        items={topCourses}
                        sliderWrapperClassProps="flex justify-center items-center"
                        nonSliderWrapperClassProps="flex flex-wrap gap-[30px] justify-center"
                        key={'course-home'} />
                    <div className="flex items-center justify-center mt-[63px]">
                        <Link href={'/courses'} className="block md:w-[350px] w-[320px] h-[60px] md:h-[82px]">
                            <button className="rounded-full font-semibold hover:bg-[#ffc267] hover:text-black hover:border-none border text-white md:w-[350px] w-[320px] h-[60px] md:h-[82px]">
                                View More Course
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoursesSectionHome;