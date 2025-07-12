// apiEndpoints.ts
// Centralized API endpoint definitions

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',

  // User
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',

  // Ride
  CREATE_RIDE: '/ride/create',
  GET_RIDES: '/ride/list',
  RIDE_DETAILS: (rideId: string) => `/ride/${rideId}`,

  // Add more endpoints as needed
}; 