import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DriverData {
  id: string;
  driverId: string;
  driverName: string;
  vehicleName: string;
  vehicleModel: string;
  vehicleRating: number;
  driverRating: number;
  price: string;
  currency: string;
  vehicleImage?: { uri: string };
  driverImage?: { uri: string };
  estimatedTime?: string;
  vehicleType?: string;
  timestamp?: string;
  status?: 'available' | 'busy' | 'offline';
}

interface DriverState {
  drivers: DriverData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DriverState = {
  drivers: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Add a single driver
    addDriver: (state, action: PayloadAction<DriverData>) => {
      const existingIndex = state.drivers.findIndex(
        driver => driver.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        // Update existing driver
        state.drivers[existingIndex] = action.payload;
      } else {
        // Add new driver
        state.drivers.push(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Add multiple drivers
    addDrivers: (state, action: PayloadAction<DriverData[]>) => {
      action.payload.forEach(driver => {
        const existingIndex = state.drivers.findIndex(
          existingDriver => existingDriver.id === driver.id
        );
        
        if (existingIndex >= 0) {
          // Update existing driver
          state.drivers[existingIndex] = driver;
        } else {
          // Add new driver
          state.drivers.push(driver);
        }
      });
      state.lastUpdated = new Date().toISOString();
    },
    
    // Replace all drivers
    setDrivers: (state, action: PayloadAction<DriverData[]>) => {
      state.drivers = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Remove a driver
    removeDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(
        driver => driver.id !== action.payload
      );
      state.lastUpdated = new Date().toISOString();
    },
    
    // Clear all drivers
    clearDrivers: (state) => {
      state.drivers = [];
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
  addDriver,
  addDrivers,
  setDrivers,
  removeDriver,
  clearDrivers,
  setError,
  clearError,
} = driverSlice.actions;

export default driverSlice.reducer; 