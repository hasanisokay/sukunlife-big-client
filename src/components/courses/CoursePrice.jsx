import { TakaSVG } from "../svg/SvgCollection";

const CoursePrice = ({ price }) => {
    return <p className="text-lg font-bold mt-2 flex items-center"><TakaSVG /> {formatPrice(price)}</p>
};

export default CoursePrice;

export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        console.error('Invalid price: Price must be a valid number');
        return '৳ N/A';
    }
    return `${price.toLocaleString('en-BD')}`;
};