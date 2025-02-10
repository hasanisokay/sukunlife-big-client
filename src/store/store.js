import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import cartSlice from './slices/cartSlice';


export const makeStore = (preloadedState={}) =>
  configureStore({
    reducer: {
      user: authSlice,
      theme: themeSlice,
      cart: cartSlice
    },
    preloadedState, 
  });

export const store = makeStore();

export default store;
