'use client';
import { memo } from 'react';
import { Rating } from 'react-simple-star-rating';


const StarRating = ({ totalRating, ratingCount }) => {
  // Handle division by zero or invalid ratingCount
  const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';

  return (
    <div className='flex items-center gap-2'>
      <small className='inline-block text-[#d8be28] text-2xl'>{averageRating}</small>
      <Rating
          initialValue={parseFloat(averageRating)}
          allowFraction={true}
          readonly={true}
          iconsCount={5}
          size={24}
          fillColor="#ffd700"
          emptyColor="#e0e0e0"
        />
        <small className='inline-block text-sm mt-1 text-gray-600 dark:text-gray-400 '>({ratingCount} ratings)</small>
    </div>
  );
};

export default memo(StarRating);