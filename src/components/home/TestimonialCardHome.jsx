'use client';

import { Rating } from 'react-simple-star-rating';

const TestimonialCard = ({ testimonial }) => {
    const { name, comment, rating } = testimonial;

    return (
        <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-6 text-gray-800">
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                    <h4 className="text-lg font-semibold">{name}</h4>
                </div>
            </div>
            <div className="mb-4">
                <Rating
                    initialValue={rating}
                    size={20}
                    readonly
                    allowFraction
                />
            </div>
            {/* <p className="text-sm leading-relaxed whitespace-pre-line h-[100px]"> */}
            <p className="text-sm leading-relaxed whitespace-pre-line  text-black  line-clamp-5">
                {comment}
            </p>
        </div>
    );
};

export default TestimonialCard;
