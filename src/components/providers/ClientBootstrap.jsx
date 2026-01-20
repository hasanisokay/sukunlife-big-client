'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/store/slices/authSlice';
import { setCartData } from '@/store/slices/cartSlice';
import { setEnrolledCourses } from '@/store/slices/authSlice';
import { setTheme } from '@/store/slices/themeSlice';
import getCartItemsFromDb from '../cart/functions/getCartItemsFromDb.mjs';
import getEnrolledCourses from '@/utils/getEnrolledCourses.mjs';
import getUserDataFromToken from '@/utils/getUserDataFromToken.mjs';

const ClientBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        dispatch(setTheme('light'));

        const userData = await getUserDataFromToken();
        if (!userData?._id) return;

        dispatch(setUserData(userData));

        const [cartItems, courses] = await Promise.all([
          getCartItemsFromDb(userData._id),
          getEnrolledCourses(userData._id),
        ]);

        dispatch(setCartData(cartItems?.cart?.cart || []));
        dispatch(
          setEnrolledCourses(courses?.courses?.enrolledCourses || [])
        );
      } catch (err) {
        console.error('Client bootstrap failed:', err);
      }
    };

    bootstrap();
  }, [dispatch]);

  return children;
};

export default ClientBootstrap;
