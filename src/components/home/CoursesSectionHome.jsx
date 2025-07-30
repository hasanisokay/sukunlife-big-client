import { motion } from "framer-motion";
import Link from "next/link";
import CourseCard from "../courses/CourseCard";
const CoursesSectionHome = ({ topCourses }) => {
    if (!topCourses) return null;
    return (
        <div>
            {topCourses?.length > 0 && (
                <div className="bg-[#00060F] md:pt-[108px] md:pb-[112px] pb-[80px] pt-[80px]">
                    <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center"><span className="text-white">Courses</span> <span className="text-[#F7CA41]">& Learning</span></h2>
                    <p className="max-w-[90vw] text-white text-center pb-[40px]">We offer prophetic remedies that promote health and well-being. Our products include</p>
                    <div className="flex flex-wrap gap-[30px] justify-center">
                        {topCourses?.map((course) => (
                            <CourseCard course={course} key={course._id} />
                        ))}
                    </div>
                    <div className="flex items-center justify-center mt-[63px]">
                        <Link href={'/courses'} className="block w-[262px] h-[80px]">
                            <button className="rounded-full font-semibold hover:bg-[#ffc267] hover:text-black hover:border-none border text-white h-full w-full">
                                View More Course
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesSectionHome;