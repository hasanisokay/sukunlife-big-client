import React from 'react';
import TransparentGreenButton from './TransparentGreenButton';
import TestimonialCard from './TestimonialCardHome';

const TestimonialSectionHome = ({ appointmentReviews, shopReviews, courseReviews, }) => {
    // console.log({ appointmentReviews, shopReviews, courseReviews, })
    const repeatedArray = Array(4).fill(appointmentReviews[0]);
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
            <div className='flex justify-center gap-[59px] flex-wrap'>
                {appointmentReviews?.length > 0 && appointmentReviews?.map((appointmentReview) => <div key={appointmentReview?._id}>
                    <TestimonialCard testimonial={appointmentReview} />
                </div>)}
            </div>
            {appointmentReviews?.length > 0 && <TransparentGreenButton hrefLink={'/about-us'} text={'More Testimonial'} />}
        </div>
    );
};

export default TestimonialSectionHome;