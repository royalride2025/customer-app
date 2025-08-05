// Socket response interface
export interface DriverAppliedResponse {
  booking_id: string;
  driver: {
    id: string;
    phone: string;
    vehicle: string;
    name?: string;
    rating?: number;
    vehicleType?: string;
    vehicleImage?: { uri: string };
    driverImage?: { uri: string };
  };
  estimates?: {
    price?: string;
    currency?: string;
    time?: string;
  } | null;
}

// Transformed driver interface for UI
export interface TransformedDriver {
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
  timestamp: string;
  status: 'available' | 'busy' | 'offline';
  phone?: string;
  bookingId?: string;
} 