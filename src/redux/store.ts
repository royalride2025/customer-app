

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import languageReducer from './languageSlice';
import authReducer from './authSlice';
import driverReducer from './driverSlice';
import bookingReducer from './bookingSlice';
import profileReducer from './profileSlice';
import notificationReducer from './notificationSlice';
import paymentReducer from './paymentSlice';
import messageReducer from './messageSlice';

const rootReducer = combineReducers({
  language: languageReducer,
  auth: authReducer,
  driver: driverReducer,
  booking: bookingReducer,
  profile: profileReducer,
  notification: notificationReducer,
  payment: paymentReducer,
  message: messageReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'booking', 'notification'], // Persist auth, booking, and notification slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
