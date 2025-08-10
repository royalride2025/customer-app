// apiEndpoints.ts
// Centralized API endpoint definitions

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: `/api/auth/register-customer`,
  VERIFY_OTP: '/api/auth/verify-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  GET_PROFILE: `/api/profile/my-profile`,

  // Booking
  CREATE_INSTANT_BOOKING: `/api/booking/create`,
  GET_BOOKING: (bookingId: string) => `/api/booking/${bookingId}`,
  GET_BOOKINGS: '/api/booking/list',
  CANCEL_BOOKING: (bookingId: string) => `/api/booking/${bookingId}/cancel`,
  UPDATE_BOOKING: (bookingId: string) => `/api/booking/${bookingId}`,

  // Driver
  GET_DRIVERS: '/api/driver/list',
  GET_DRIVER: (driverId: string) => `/api/driver/${driverId}`,
  ACCEPT_DRIVER: (bookingId: string) => `/api/booking/${bookingId}/accept-driver`,
  REJECT_DRIVER: (bookingId: string) => `/api/booking/${bookingId}/reject-driver`,

  // Vehicles
  GET_VEHICLES_WITH_OWNERS: '/api/list/vehicles-with-owners',


}; 