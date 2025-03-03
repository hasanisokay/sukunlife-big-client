"use client"

import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import CourseCard from "./CourseCard";

const CoursesPage = ({ courses, page }) => {
    const [savedCourses, setSavedCoures] = useState(courses?.courses);
    const memorizedCourses = useMemo(() => savedCourses, [savedCourses]);
    useEffect(() => {
        setSavedCoures(courses?.courses)
    }, [courses]);
    return (
        <div className="mt-4 space-y-4">
            <section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:max-w-screen-2xl xl:max-w-6xl lg:max-w-6xl md:max-w-3xl mx-auto gap-6"
            >
                {memorizedCourses?.map((c, index) => <CourseCard key={c._id} course={c} />)}
            </section>
            {memorizedCourses?.length < courses?.totalCount && <LoadMoreButton page={page} />}
        </div>
    );
};

export default CoursesPage;