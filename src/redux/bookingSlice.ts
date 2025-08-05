import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BookingData {
  booking_id: string;
  booking: {
    pickup_location: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
    dropoff_location: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
    _id: string;
    customer_id: string;
    booking_type: string;
    status: string;
    estimated_distance_to_pickup: number;
    estimated_time_to_pickup: number;
    estimated_distance: number;
    estimated_duration: number;
    price: number;
    payment_status: string;
    candidate_drivers: string[];
    applicant_drivers: string[];
    booking_time: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    driver_id: string;
  };
  driver_id: string;
  driver: {
    id: string;
    name: string;
    profile_image: string;
    license_no: string;
    vehicle: any; // You can define a more specific type if needed
  };
}

interface BookingState {
  currentBooking: BookingData | null;
  bookingHistory: BookingData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  bookingHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Set current booking (for confirmed booking)
    setCurrentBooking: (state, action: PayloadAction<BookingData>) => {
      state.currentBooking = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Update current booking
    updateCurrentBooking: (state, action: PayloadAction<Partial<BookingData>>) => {
      if (state.currentBooking) {
        state.currentBooking = { ...state.currentBooking, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Clear current booking
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Add booking to history
    addToHistory: (state, action: PayloadAction<BookingData>) => {
      state.bookingHistory.unshift(action.payload);
      // Keep only last 50 bookings
      if (state.bookingHistory.length > 50) {
        state.bookingHistory = state.bookingHistory.slice(0, 50);
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Set booking history
    setBookingHistory: (state, action: PayloadAction<BookingData[]>) => {
      state.bookingHistory = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Clear booking history
    clearBookingHistory: (state) => {
      state.bookingHistory = [];
      state.lastUpdated = new Date().toISOString();
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setCurrentBooking,
  updateCurrentBooking,
  clearCurrentBooking,
  addToHistory,
  setBookingHistory,
  clearBookingHistory,
  setError,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer; 