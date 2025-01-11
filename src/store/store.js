import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';

export const makeStore = (preloadedState={}) =>
  configureStore({
    reducer: {
      user: authSlice,
      theme: themeSlice
    },
    preloadedState, 
  });

export const store = makeStore();

export default store;
