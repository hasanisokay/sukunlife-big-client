'use client'
import DatePicker from '@/components/ui/datepicker/Datepicker';
import addReviewFromAdmin from '@/server-functions/addReviewFromAdmin.mjs';
import getIdsAndNameForReview from '@/server-functions/getIdsAndNameForReview.mjs';
import React, { useState, useEffect } from 'react';
import { Rating } from 'react-simple-star-rating';
import { toast, ToastContainer } from 'react-toastify';

const AddReviewFormAdmin = () => {
  const [reviewType, setReviewType] = useState('appointment');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Fetch products and courses on component mount
  useEffect(() => {
    if (reviewType !== 'appointment') {
      fetchData()
    }
  }, [reviewType]);

  const fetchData = async () => {
    if (reviewType === 'product' && products?.length > 0) return;
    if (reviewType === 'course' && courses?.length > 0) return;
    try {
      const data = await getIdsAndNameForReview(reviewType);
      if (reviewType === 'product') {
        setProducts(data.products)
      }
      else if (reviewType === 'course') {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products and courses');
    }
  };

  // Handle rating change
  const handleRating = (rate) => {
    setRating(rate);
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setComment('');
    setSelectedProductId('');
    setSelectedCourseId('');
  };

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedDate = formatDateToYYYYMMDD(date);
      let reviewData = {
        type: reviewType,
        name,
        rating,
        comment,
        date: formattedDate
      };

      // Add type-specific fields
      if (reviewType === 'appointment') {
        reviewData.appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        reviewData.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else if (reviewType === 'product') {
        if (!selectedProductId) {
          toast.error('Please select a product');
          setIsLoading(false);
          return;
        }
        reviewData.productId = selectedProductId;
        reviewData.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else if (reviewType === 'course') {
        if (!selectedCourseId) {
          toast.error('Please select a course');
          setIsLoading(false);
          return;
        }
        reviewData.courseId = selectedCourseId;
        reviewData.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      const result = await addReviewFromAdmin(reviewData);
      if (result.status === 200) {
        toast.success(result.message || "Success");
        resetForm()
      } else {
        toast.error(result.message || "ERROR")
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('An error occurred while adding the review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full p-4">
        <div className="w-[350px] md:w-[550px] lg:w-[700px] mx-auto bg-white rounded-lg shadow-md">
          <div className="rounded-t-lg px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h1 className="text-lg leading-6 font-medium text-white">Add New Review</h1>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">
              Create a review for appointments, products, or courses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
            {/* Review Type Selection */}
            <div>
              <label htmlFor="review-type" className="block text-sm font-medium text-gray-700">
                Review Type
              </label>
              <div className="mt-1">
                <select
                  id="review-type"
                  name="review-type"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                >
                  <option value="appointment">Appointment</option>
                  <option value="product">Product</option>
                  <option value="course">Course</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields Based on Review Type */}
            {reviewType === 'product' && (
              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                  Select Product
                </label>
                <div className="mt-1">
                  <select
                    id="product"
                    name="product"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {reviewType === 'course' && (
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <div className="mt-1">
                  <select
                    id="course"
                    name="course"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    <option value="">Choose a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name of the reviewer
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DatePicker defaultDate={new Date()} label={'Select Date'} onChangeHanlder={(e) => setDate(e)} />
            {/* Rating Field */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center">
                <Rating
                  onClick={handleRating}
                  ratingValue={rating}
                  size={24}
                  transition
                  fillColor="#fbbf24"
                  emptyColor="#d1d5db"
                  className="inline-block"
                />
                <span className="ml-2 text-sm text-gray-500">({rating}/5)</span>
              </div>
            </div>

            {/* Comment Field */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <div className="mt-1">
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add Review'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AddReviewFormAdmin;