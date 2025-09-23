import React, { useMemo } from 'react';
import TransparentGreenButton from './TransparentGreenButton';
import HomeCardSlider from './HomeCardSlider';

const TestimonialSectionHome = ({ appointmentReviews, shopReviews, courseReviews, showMoreButton = true }) => {

    const allReviews = useMemo(() => {
        const fromAppointments = appointmentReviews?.map((r) => r) || [];
        const fromCourses = courseReviews?.map((r) => r?.reviews?.[0]) || [];
        const fromShops = shopReviews?.map((r) => r?.reviews?.[0]) || [];

        // filter out empty / undefined
        return [...fromAppointments, ...fromCourses, ...fromShops].filter(Boolean);
    }, [appointmentReviews, shopReviews, courseReviews]);

    if (allReviews.length === 0) return null;

    return (
        <div className='pt-[144px] px-4 md:pb-[160px] pb-[100px] '>
            <div className=" explore-self-ruqyah-now-wrapper">
                <div className="md:w-[482px] flex flex-col items-start justify-start ">
                    <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight md:text-start text-center md:mx-0 mx-auto">
                        Testimonials
                    </h2>
                    <p className="mt-[28px] md:mx-0 mx-auto max-w-[90vw] ">
                        Stay informed with our blog posts on spiritual wellness, Islamic healing, and personal development. Topics include
                    </p>
                </div>
                <div className="md:w-[482px] self-ruqyah-resources-right-side-div">
                </div>
            </div>
            <HomeCardSlider
                itemType="testimonial"
                items={allReviews}
                sliderWrapperClassProps="flex justify-center items-center py-4"
                nonSliderWrapperClassProps="flex justify-center gap-[59px] flex-wrap py-4"
                key={'testimonial-home'} />

            {showMoreButton && <TransparentGreenButton hrefLink={'/about-us#testimonial'} text={'More Testimonial'} />}
        </div>
    );
};

export default TestimonialSectionHome;