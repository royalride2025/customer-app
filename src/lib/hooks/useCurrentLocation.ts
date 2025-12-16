import { useState, useCallback, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Toast from 'react-native-toast-message';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UseCurrentLocationOptions {
  enableGeocoding?: boolean;
  geocodingApiKey?: string;
  onSuccess?: (location: LocationData) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  highAccuracyTimeout?: number;
  lowAccuracyTimeout?: number;
  cachedLocationTimeout?: number;
}

export interface UseCurrentLocationReturn {
  getCurrentLocation: () => Promise<void>;
  isLoading: boolean;
  location: LocationData | null;
  error: string | null;
}

/**
 * Custom hook for getting current location with fallback strategy
 * Tries high accuracy first, then low accuracy, then cached location
 */
export const useCurrentLocation = (
  options: UseCurrentLocationOptions = {}
): UseCurrentLocationReturn => {
  const {
    enableGeocoding = false,
    geocodingApiKey,
    onSuccess,
    onError,
    showToast = true,
    highAccuracyTimeout = 5000, // Reduced from 10000 to 5000ms
    lowAccuracyTimeout = 5000, // Reduced from 10000 to 5000ms
    cachedLocationTimeout = 2000, // Reduced from 5000 to 2000ms
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLocationRequestInProgress = useRef(false);

  // Request location permission for Android
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide ride services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('📍 Location permission granted');
          return true;
        } else {
          console.log('❌ Location permission denied');
          return false;
        }
      } catch (err) {
        console.warn('❌ Error requesting location permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }, []);

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      if (!enableGeocoding || !geocodingApiKey) {
        return null;
      }

      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${geocodingApiKey}`;
        console.log('📍 Calling geocoding API...');

        const response = await fetch(geocodeUrl);
        const data = await response.json();

        console.log('📍 Geocoding response status:', data.status);

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log('📍 Got address:', address);
          return address;
        } else {
          console.error('📍 Geocoding failed. Status:', data.status);
          return null;
        }
      } catch (error) {
        console.error('📍 Error reverse geocoding:', error);
        return null;
      }
    },
    [enableGeocoding, geocodingApiKey]
  );

  // Process location data - waits for geocoding if enabled (with timeout)
  const processLocation = useCallback(
    async (position: any): Promise<LocationData | null> => {
      const { latitude, longitude } = position.coords;
console.log('🗺️ Processing location:', { latitude, longitude });
      // Validate coordinates
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        console.log('❌ Invalid coordinates received:', { latitude, longitude });
        return null;
      }

      // Create location data object
      const locationData: LocationData = {
        latitude,
        longitude,
      };

      // If geocoding is enabled, try to get address (with timeout to not block too long)
      if (enableGeocoding) {
        try {
          // Wait for geocoding but with a timeout (max 3 seconds)
          const geocodePromise = reverseGeocode(latitude, longitude);
          const timeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 3000)
          );
          
          const address = await Promise.race([geocodePromise, timeoutPromise]);
          
          if (address) {
            locationData.address = address;
            console.log('✅ Geocoding completed with address:', address);
          } else {
            console.log('⏱️ Geocoding timed out or failed, using coordinates');
          }
        } catch (error) {
          console.error('📍 Geocoding error:', error);
          // Continue with coordinates only
        }
      }

      // Set location with address (if available)
      setLocation(locationData);
      setError(null);

      // Call success callback with location data (with address if geocoding succeeded)
      if (onSuccess) {
        onSuccess(locationData);
      }

      return locationData;
    },
    [enableGeocoding, reverseGeocode, onSuccess]
  );

  // Handle location errors
  const handleLocationError = useCallback(
    (error: any, attemptType: string): string => {
      console.log(`Location error (${attemptType}):`, error);

      let errorMessage = 'Unable to fetch your current location.';
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please enable location services.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please ensure GPS is enabled and try again.';
      }

      setError(errorMessage);

      // Call error callback if provided
      if (onError) {
        onError(errorMessage);
      }

      // Show toast if enabled
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 4000,
        });
      }

      return errorMessage;
    },
    [onError, showToast]
  );

  // Main function to get current location with fallback strategy
  const getCurrentLocation = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous location requests
    if (isLocationRequestInProgress.current) {
      console.log('📍 Location request already in progress, skipping...');
      return;
    }

    // Check permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      const errorMsg = 'Location permission is required. Please enable location services in your device settings.';
      setError(errorMsg);
      
      if (showToast) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to work properly. Please enable location services in your device settings.',
          [
            {
              text: 'Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openURL('package:' + 'com.royal_ride');
                }
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
      
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    isLocationRequestInProgress.current = true;
    setIsLoading(true);
    setError(null);

    // Strategy: Try cached location first (fastest), then low accuracy (fast), then high accuracy (slower but more precise)
    // Step 1: Try cached location first (fastest - instant if available)
    console.log('📍 Attempting cached location first...');
    Geolocation.getCurrentPosition(
      async (position) => {
            console.log('✅ Cached location success (fastest):', position);
            const locationData = await processLocation(position);
            setIsLoading(false);
            isLocationRequestInProgress.current = false;
      },
      (error) => {
        console.log('⚠️ Cached location not available, trying low accuracy...', error);

        // Step 2: Try low accuracy (network-based, faster than GPS)
        Geolocation.getCurrentPosition(
          async (position) => {
            console.log('✅ Low accuracy location success (fast):', position);
            const locationData = await processLocation(position);
            setIsLoading(false);
            isLocationRequestInProgress.current = false;
          },
          (error) => {
            console.log('⚠️ Low accuracy failed, trying high accuracy GPS...', error);

            // Step 3: Fallback to high accuracy GPS (slower but most precise)
            Geolocation.getCurrentPosition(
              async (position) => {
                console.log('✅ High accuracy GPS location success:', position);
                const locationData = await processLocation(position);
                setIsLoading(false);
                isLocationRequestInProgress.current = false;
              },
              (error) => {
                console.log('❌ All location attempts failed:', error);
                setIsLoading(false);
                isLocationRequestInProgress.current = false;
                handleLocationError(error, 'high-accuracy');
              },
              {
                enableHighAccuracy: true,
                timeout: highAccuracyTimeout,
                maximumAge: 300000, // Accept cached locations up to 5 minutes old
              }
            );
          },
          {
            enableHighAccuracy: false,
            timeout: lowAccuracyTimeout,
            maximumAge: 300000, // Accept cached locations up to 5 minutes old (increased for faster response)
          }
        );
      },
      {
        enableHighAccuracy: false,
        timeout: cachedLocationTimeout,
        maximumAge: 300000, // Accept cached locations up to 5 minutes old (increased for faster response)
      }
    );
  }, [
    requestLocationPermission,
    processLocation,
    handleLocationError,
    showToast,
    enableGeocoding,
    highAccuracyTimeout,
    lowAccuracyTimeout,
    cachedLocationTimeout,
  ]);

  return {
    getCurrentLocation,
    isLoading,
    location,
    error,
  };
};

