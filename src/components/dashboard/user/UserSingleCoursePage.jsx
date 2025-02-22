'use client'
import { useSelector } from 'react-redux';

const UserSingleCoursePage = ({course}) => {
    console.log(course);
    const enrolledCourses =  useSelector((state) => state.user.enrolledCourses);
    return (
        <div>
            
        </div>
    );
};

export default UserSingleCoursePage;