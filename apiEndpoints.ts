// apiEndpoints.ts
// Centralized API endpoint definitions

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: `/api/auth/register-customer`,
  VERIFY_OTP: '/api/auth/verify-otp',
  // FORGOT_PASSWORD: '/api/auth/forgot-password',
  // RESET_PASSWORD: '/api/auth/reset-password',
  GET_PROFILE: `/api/auth/profile`,
  GOOGLE_AUTH: '/api/auth/google-mobile',
  GET_OTP:`/api/auth/forget-password-phone`,
  RESET_PASSWORD:`/api/auth/reset-password-phone`,
  uploadImageToServer:`/api/auth/upload-file`,
  CHANGE_PASSWORD:`/api/auth/change-password`,
  UPDATE_PROFILE:`/api/profile/customer/update-profile`,
  REGISTER_DEVICE: '/api/auth/register-device',
  

  // Booking
  CREATE_INSTANT_BOOKING: `/api/booking/create`,
  GET_BOOKING: (bookingId: string) => `/api/booking/${bookingId}`,
  GET_SCHEDULED_BOOKING:`/api/booking/scheduled`,
  GET_BOOKINGS: '/api/booking/list',
  CANCEL_BOOKING: (bookingId: string) => `/api/booking/${bookingId}/cancel`,
  UPDATE_BOOKING: (bookingId: string) => `/api/booking/${bookingId}`,
  GET_CUSTOMER_BOOKINGS: (customerId: string) => `/api/booking/customer/${customerId}?status=scheduled`,
  GET_CUSTOMER_REQUESTS: (customerId: string) => `/api/booking/customer/${customerId}?status=pending`,
  GET_HISTORY:`/api/booking/completed-or-cancelled`,

  //address

  ADD_ADDRESS:`/api/address`,
  GET_ADDRESS_LIST:`/api/address`,
  UPDATE_ADDRESS:(id: string)=>`/api/address/${id}`,
  DELET_ADDRESS:(id: string)=>`/api/address/${id}`,



  // Driver
  GET_DRIVERS: '/api/driver/list',
  GET_DRIVER: (driverId: string) => `/api/driver/${driverId}`,
  ACCEPT_DRIVER: (bookingId: string) => `/api/booking/${bookingId}/accept-driver`,
  REJECT_DRIVER: (bookingId: string) => `/api/booking/${bookingId}/reject-driver`,

  // Vehicles
  GET_VEHICLES_WITH_OWNERS: '/api/list/vehicles-with-owners',

  // Payment
  CREATE_CHARGE: '/api/create-charge',

  // Credits
  CREDITS_HISTORY: (page: number = 1, limit: number = 100) => `/api/credits/history?page=${page}&limit=${limit}`,
  CREDITS_TRANSFER: '/api/credits/transfer',


}; 