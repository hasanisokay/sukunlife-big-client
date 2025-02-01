import EditCourse from "@/components/dashboard/Admin/courses/EditCourse";
import NotFound from "@/components/not-found/NotFound";
import getCourse from "@/utils/getCourse.mjs";


const editCoursePage = async({params}) => {
    const p = await params;
    const courseId = p.courseId
    const course = await getCourse(courseId);
    if(course.status!==200) return <NotFound />
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Course</h1>
            <EditCourse course={course?.course} />
        </div>
    );
};

export default editCoursePage;