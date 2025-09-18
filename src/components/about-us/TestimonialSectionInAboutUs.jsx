'use client'
import getTopReviews from "@/utils/getTopReviews.mjs";
import { useEffect, useState } from "react";
import TestimonialSectionHome from "../home/TestimonialSectionHome";

const TestimonialSectionInAboutUs = () => {
    const [reviews, setReviews] = useState(null)
    useEffect(() => {
        (async () => {
            const r = await getTopReviews(3);
            if (r.status === 200) {
                setReviews(r)
            } else {
                setReviews(null)
            }
        })()
    }, [])
    if (!reviews) return;
    return (
        <div className='pt-[100px] '>
            <TestimonialSectionHome
                shopReviews={reviews?.shopReviews}
                appointmentReviews={reviews?.appointmentReviews}
                courseReviews={reviews?.courseReviews}
                showMoreButton={false}
            />
        </div>
    );
};

export default TestimonialSectionInAboutUs;