

import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';

// Configure store
const store = configureStore({
  reducer: {
    language: languageReducer, // Add language slice reducer
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
