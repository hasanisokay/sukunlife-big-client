import { memo } from 'react';
import { Rating } from 'react-simple-star-rating';
const StarsOnly = ({ star, size }) => {
    return <Rating
        initialValue={parseFloat(star)}
        allowFraction={true}
        readonly={true}
        iconsCount={5}
        size={size || 24}
        fillColor="#ffd700"
        emptyColor="#e0e0e0"
    />

};

export default memo(StarsOnly);