import { Alert, FlatList, Pressable, StyleSheet, Text, View, Linking, Platform, PermissionsAndroid } from 'react-native';
import Toast from 'react-native-toast-message';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Svg from '../../lib/svg';
import { atmCard, carSvg, locationPin, rightIcon } from '../../../assets/svgAssets';
import Geolocation from '@react-native-community/geolocation';
import TripCard from '../home/makeTrip/component/tripCard';
import { StyleGuide } from '../../../StyleGuide';
import { screenWidth } from '../../utils/dimenstions';
import AppButton from '../../lib/component/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomModal from '../../lib/component/BottomModal';
import RatingModal from '../../lib/component/RatingModal';
import RideCard from './components/rideCard';
import PaymentMethods from './components/paymentCard';
import RideInfoCard from './components/rideInfoCard';
import TimeStatusCard from './components/timeStatusCard';
import { t } from 'i18next';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { useAppSelector, useAppDispatch } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { setCurrentBooking, updateCurrentBooking, clearCurrentBooking, updateBookingStatus, clearBookingStatus, setStatusInfo } from '../../redux/bookingSlice';
import { addUnreadMessage, setChatOpen } from '../../redux/messageSlice';
import { useSocketReconnection } from '../../lib/hooks/useSocketReconnection';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DurationTimer from './components/durationTimer';
import socketService from '../../services/socket';

const car = require('../../../assets/images/halfCar.png');

// Google Maps API Key - Replace with your actual API key
const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Remove hardcoded route coordinates and destination
// const routeCoordinates = [
//   {
//     latitude: 31.4926,
//     longitude: 74.3925,
//   },
//   { latitude: 31.6018, longitude: 74.3206 },
// ];

// const destination = { latitude: 31.6018, longitude: 74.3206 };

const Map = () => {
  // State variables
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [selectedRide, setSelectedRide] = useState(1);
  const [isModalVisible, setModalVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedDriverId, setAcceptedDriverId] = useState<string | null>(null);
  const [acceptedDriver, setAcceptedDriver] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);



 
  // const [locationWatcher, setLocationWatcher] = useState<number | null>(null);
  console.log(region, "region====")
  console.log(driverLocation, "//////////drivers")
  // Navigation and route
  const navigation = useNavigation();
  const route = useRoute();
  const { from } = (route.params as any) || {};
  const { booking } = (route.params as any) || {};

  // Redux selectors and dispatch
  const dispatch = useAppDispatch();
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const currentBooking = useAppSelector((state: RootState) => state.booking.currentBooking);
  const bookingStatus = useAppSelector((state: RootState) => state.booking.bookingStatus);
  const statusMessage = useAppSelector((state: RootState) => state.booking.statusMessage);
  const statusIcon = useAppSelector((state: RootState) => state.booking.statusIcon);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const messageState = useAppSelector((state: RootState) => state.message);

  console.log(currentBooking, "currentBooking/////")

  console.log(bookingStatus, "bookingStatus////")
  // Debug Redux state
  console.log('🔍 Redux State Debug:', {
    bookingStatus,
    statusMessage,
    statusIcon,
    hasCurrentBooking: !!currentBooking,
    currentBookingStatus: currentBooking?.booking?.status
  });



  // Safe area insets for proper button positioning
  const insets = useSafeAreaInsets();

  // Map ref to control camera/fit coordinates
  const mapRef = useRef<MapView | null>(null);

  console.log(currentBooking, "boooooooo")
  console.log('Current booking state:', {
    driverId: currentBooking?.driver_id,
    bookingId: currentBooking?.booking_id,
    driverName: currentBooking?.driver?.name,
    driverImage: currentBooking?.driver?.profile_image,
  });

  console.log('Current drivers state:', drivers);
  console.log('Drivers count:', drivers.length);

  // Handlers
  const handleRatingSubmit = useCallback(async (rating: number, review: string) => {
    console.log('⭐ Rating submitted:', rating, 'Review:', review);

    try {
      // Set loading state
      setIsSubmittingRating(true);

      // Get the booking ID from current booking
      const bookingId = currentBooking?.booking_id || currentBooking?._id;

      if (!bookingId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Booking ID not found. Please try again.',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsSubmittingRating(false);
        return;
      }

      // Prepare the payload
      const payload = {
        rating: rating.toString(),
        review: review
      };

      console.log('📤 Sending rating to API:', payload);

      // Make API call to submit rating
      const response = await networkClient.post(`/api/review/${bookingId}`, payload);

      console.log('✅ Rating submitted successfully:', response.data);

      Toast.show({
        type: 'success',
        text1: 'Thank You!',
        text2: 'Your rating has been submitted successfully.',
        position: 'top',
        visibilityTime: 3000,
      });

      // Close rating modal
      setShowRatingModal(false);

      // Clear all booking and driver state
      dispatch(clearCurrentBooking());
      setAcceptedDriver(null);
      setAcceptedDriverId(null);
      setDrivers([]);
      setDriverLocation(null);
      setShowDirections(false);
      dispatch(clearBookingStatus());
      setCurrentBooking(null);
      dispatch(clearBookingStatus());

      // Navigate to Main screen
      setTimeout(() => {
        (navigation as any).navigate('Main');
      }, 1000);

    } catch (error) {
      console.error('❌ Error submitting rating:', error);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit rating. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      // Always clear loading state
      setIsSubmittingRating(false);
    }
  }, [dispatch, navigation, currentBooking]);

  const handleRatingModalClose = useCallback(() => {
    setShowRatingModal(false);

    // Clear all booking and driver state
    dispatch(clearCurrentBooking());
    setAcceptedDriver(null);
    setAcceptedDriverId(null);
    setDrivers([]);
    setDriverLocation(null);
    setShowDirections(false);
    dispatch(clearBookingStatus());
    setCurrentBooking(null);
    dispatch(clearBookingStatus());

    // Navigate to Main screen
    setTimeout(() => {
      (navigation as any).navigate('Main');
    }, 500);
  }, [dispatch, navigation]);

  const handleChat = useCallback(() => {
    const chatId = currentBooking?.driver_id || currentBooking?.driver_id?._id;
    
    // Mark chat as open to clear unread messages
    if (chatId) {
      dispatch(setChatOpen({ isOpen: true, chatId }));
    }
    
    (navigation as any).navigate('customerChat', {
      driverId: chatId,
      bookingId: currentBooking?.booking_id || currentBooking?._id,
      driverName: currentBooking?.driver?.name || currentBooking?.driver_profile?.name,
      driverImage: currentBooking?.driver?.profile_image || currentBooking?.driver_profile?.driver_img,
    });
  }, [navigation, dispatch, currentBooking]);

  const toggleModal = useCallback(() => {
    setModalVisible(!isModalVisible);
  }, [isModalVisible]);

  const handleRideSelect = useCallback((rideId: number) => {
    setSelectedRide(rideId);
    console.log('Selected ride:', rideId);
  }, []);





  const handlePaymentStep = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentStep]);

  // Location permission check for Android
  const requestLocationPermission = useCallback(async () => {
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
  

  // Location functions - Set initial region based on priority
  // const setDefaultLocation = useCallback(() => {
  //   let targetLatitude: number;
  //   let targetLongitude: number;

  //   // Priority 1: Booking pickup location
  //   if (booking?.booking?.pickup_location?.coordinates) {
  //     targetLatitude = Number(booking.booking.pickup_location.coordinates[0]);
  //     targetLongitude = Number(booking.booking.pickup_location.coordinates[1]);
  //     console.log('🗺️ setDefaultLocation: Using booking pickup location:', { targetLatitude, targetLongitude });
  //   }
  //   // Priority 2: Fallback to default location (Doha, Qatar)
  //   else {
  //     targetLatitude = 25.3548;
  //     targetLongitude = 51.1839;
  //     console.log('🗺️ setDefaultLocation: Using fallback location (Doha):', { targetLatitude, targetLongitude });
  //   }

  //   const defaultRegion = {
  //     latitude: targetLatitude,
  //     longitude: targetLongitude,
  //     latitudeDelta: 0.18,
  //     longitudeDelta: 0.18,
  //   };
  //   setRegion(defaultRegion);
  //   setIsLoading(false);
  //   console.log('🗺️ Default location set and loading finished');
  // }, [booking?.booking?.pickup_location?.coordinates,currentBooking?.pickup_location?.coordinates]);

  const getCurrentLocation = useCallback(async () => {
    // Check permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Validate coordinates before setting them
        if (typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          !isNaN(latitude) &&
          !isNaN(longitude) &&
          latitude >= -90 && latitude <= 90 &&
          longitude >= -180 && longitude <= 180) {

          const newLocation = { latitude, longitude };
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.18,
            longitudeDelta: 0.18,
          };

          setCurrentLocation(newLocation);
          // When user manually requests location, center map on current location
          setRegion(newRegion);
          setLocationPermissionGranted(true);
          setIsLoading(false);
          console.log('📍 Current location obtained and map centered:', newLocation);

          // If we also have a pickup location, fit both markers into view
          const pickupCoordsFromRoute = booking?.booking?.pickup_location?.coordinates;
          const pickupCoordsFromRedux = currentBooking?.pickup_location?.coordinates || currentBooking?.booking?.pickup_location?.coordinates as any;
          const pickupCoords = pickupCoordsFromRoute || pickupCoordsFromRedux;

          if (pickupCoords && mapRef.current) {
            // Coordinate order in app: [0] => latitude, [1] => longitude
            const pickupLat = Number(pickupCoords[0]);
            const pickupLng = Number(pickupCoords[1]);

            if (!isNaN(pickupLat) && !isNaN(pickupLng)) {
              const points = [
                { latitude, longitude },
                { latitude: pickupLat, longitude: pickupLng }
              ];
              const edgePadding = { top: 120, right: 60, bottom: Math.max(120, insets.bottom + 80), left: 60 } as any;
              try {
                mapRef.current.fitToCoordinates(points, { edgePadding, animated: true });
                console.log('🗺️ Fitting map to current and pickup points:', points);
              } catch (e) {
                console.log('⚠️ fitToCoordinates error:', e);
              }
            }
          }
        } else {
          console.log('❌ Invalid coordinates received from GPS:', { latitude, longitude });
          setIsLoading(false);
          // Alert.alert(
          //   'Invalid Location Data',
          //   'Received invalid coordinates from GPS. Please try again.',
          //   [{ text: 'OK' }]
          // );
        }
      },
      (error) => {
        console.log('Location error:', error);
        setIsLoading(false);
        // Show specific error messages based on error code
        let errorMessage = 'Unable to fetch your current location.';
        if (error.code === 1) {
          errorMessage = 'Location permission denied. Please enable location services.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please check your device settings.';
        }

        // Alert.alert(
        //   'Location Error', 
        //   errorMessage,
        //   [
        //     {
        //       text: 'Settings',
        //       onPress: () => {
        //         if (Platform.OS === 'ios') {
        //           Linking.openURL('app-settings:');
        //         } else {
        //           Linking.openURL('package:' + 'com.royal_ride');
        //         }
        //       }
        //     },
        //     {
        //       text: 'Retry',
        //       onPress: () => getCurrentLocation()
        //     },
        //     {
        //       text: 'Cancel',
        //       style: 'cancel'
        //     }
        //   ]
        // );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10,
      }
    );
  }, [requestLocationPermission, booking, currentBooking]);

  // Don't start continuous location tracking - only when button is pressed
  // const startLocationTracking = useCallback(() => {
  //   if (locationPermissionGranted && !locationWatcher) {
  //     const watcher = Geolocation.watchPosition(
  //       (position) => {
  //       const { latitude, longitude } = position.coords;
  //       const newLocation = { latitude, longitude };
  //       
  //       // Only update if location changed significantly (more than 10 meters)
  //       if (currentLocation) {
  //         const distance = Math.sqrt(
  //           Math.pow(newLocation.latitude - currentLocation.latitude, 2) +
  //           Math.pow(newLocation.longitude - currentLocation.longitude, 2)
  //         );
  //         
  //         if (distance > 0.0001) { // Approximately 10 meters
  //           setCurrentLocation(newLocation);
  //           console.log('📍 Location updated:', newLocation);
  //         }
  //       } else {
  //         setCurrentLocation(newLocation);
  //       }
  //     },
  //       (error) => {
  //         console.log('Location tracking error:', error);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         distanceFilter: 10, // Update every 10 meters
  //         interval: 5000, // Update every 5 seconds
  //       }
  //     );
  //     setLocationWatcher(watcher);
  //     console.log('📍 Location tracking started');
  //   }
  // }, [locationPermissionGranted, locationWatcher, currentLocation]);

  // Don't use continuous location tracking
  // const stopLocationTracking = useCallback(() => {
  //   if (locationWatcher) {
  //     Geolocation.clearWatch(locationWatcher);
  //     setLocationWatcher(null);
  //     console.log('📍 Location tracking stopped');
  //   }
  // }, [locationWatcher]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Center map on pickup location
  const centerOnPickupLocation = useCallback(() => {
    if (booking?.booking?.pickup_location?.coordinates || currentBooking?.pickup_location?.coordinates) {
      const newRegion = {
        latitude: Number(currentBooking.pickup_location.coordinates[1]), // Correct coordinate order
        longitude: Number(currentBooking.pickup_location.coordinates[0]),
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      };
      setRegion(newRegion);
      console.log('🗺️ Map centered on pickup location:', newRegion);
    }
  }, [booking?.booking?.pickup_location?.coordinates, currentBooking?.pickup_location?.coordinates]);

  // Reset map to initial region (pickup location or fallback)
  const resetToInitialRegion = useCallback(() => {
    let targetLatitude: number;
    let targetLongitude: number;

    // Priority 1: Booking pickup location
    if (booking?.booking?.pickup_location?.coordinates || currentBooking?.pickup_location?.coordinates) {
      targetLatitude = Number(booking.booking.pickup_location.coordinates[0] || currentBooking.pickup_location.coordinates[1]);
      targetLongitude = Number(booking.booking.pickup_location.coordinates[1] || currentBooking.pickup_location.coordinates[0]);
      console.log('🗺️ Reset: Using booking pickup location:', { targetLatitude, targetLongitude });
    }
    // Priority 2: Fallback to default location (Doha, Qatar)
    else {
      targetLatitude = 25.3548;
      targetLongitude = 51.1839;
      console.log('🗺️ Reset: Using fallback location (Doha):', { targetLatitude, targetLongitude });
    }

    const newRegion = {
      latitude: targetLatitude,
      longitude: targetLongitude,
      latitudeDelta: 0.18,
      longitudeDelta: 0.18,
    };
    setRegion(newRegion);
    console.log('🗺️ Map reset to initial region:', newRegion);
  }, [booking?.booking?.pickup_location?.coordinates, currentBooking?.pickup_location?.coordinates]);

  const handleMarkerDragEnd = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setCurrentLocation(coordinate);
  }, []);

  const handlePickupLocationDragEnd = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    // Update the pickup location in the booking
    if (currentBooking?.booking?.pickup_location?.coordinates || currentBooking?.pickup_location?.coordinates) {
      const updatedCoordinates = [
        coordinate.longitude, // API expects [longitude, latitude]
        coordinate.latitude
      ];

      // You can emit this update via socket or API call
      console.log('📍 Pickup location updated to:', coordinate);
      console.log('📍 New coordinates for API:', updatedCoordinates);

      // Optionally emit the update via socket
      // emitEvent('updatePickupLocation', {
      //   booking_id: currentBooking.booking_id,
      //   coordinates: updatedCoordinates
      // });
    }
  }, [currentBooking]);

  // Socket reconnection hook
  const {
    isConnected: socketConnected,
    isConnecting,
    reconnectAttempts,
    reconnect,
    disconnect,
    addEventListener,
    removeEventListener,
    emitEvent
  } = useSocketReconnection({
    autoReconnect: true,
    reconnectDelay: 5000,
    maxReconnectAttempts: 10,
    onConnect: () => {
      console.log('🎉 Socket connected successfully!');
    },
    onDisconnect: () => {
      console.log('😞 Socket disconnected');
    },
    onError: (error) => {
      console.log('💥 Socket error occurred:', error);
    }
  });

  // Driver applied event handler
  const handleDriverApplied = useCallback((data: any) => {
    console.log('🚗 Driver Applied Event Received: ' + JSON.stringify(data));
    console.log('🔍 Raw data structure:', {
      booking_id: data.booking_id,
      driver: data.driver,
      estimates: data.estimates
    });

    // Map the data according to the actual API structure
    const driverData = {
      id: data.booking_id || data.driver?.id || `driver-${Date.now()}`,
      driverId: data.driver?.id || '',
      driverName: data.driver?.name || `Driver ${data.driver?.id?.slice(-4) || 'Unknown'}`,
      vehicleName: data.driver?.vehicle?._doc?.car_make,
      vehicleModel: data.driver?.vehicle?._doc?.car_model || data.driver?.vehicle?.model || 'Unknown Model',
      vehicleRating: 4.5, // Default rating
      driverRating: 4.5, // Default rating
      price: data?.booking?.price ? Math.round(data.booking.price).toString() : '0',
      currency: 'QR', // Default currency
      vehicleImage: data.driver?.vehicle?.vehicle_pictures?.[0] || { uri: 'https://example.com/default-vehicle.jpg' },
      driverImage: data.driver?.profile_image || { uri: 'https://example.com/default-driver.jpg' },
      estimatedTime: `${data?.booking?.estimated_duration || 5} minutes`,
      vehicleType: data.driver?.vehicle?.vehicle_type || data.driver?.vehicle?.type || 'Standard',
      timestamp: new Date().toISOString(),
      status: 'available',
      phone: data.driver?.phone || '',
      bookingId: data.booking_id || '',
      // Keep the original data structure for direct access
      driver: data.driver,
      booking: data.booking,
      // Additional fields from the actual structure
      licensePlate: data.driver?.vehicle?._doc?.license_plate || data.driver?.vehicle?.license_plate || 'Unknown',
      vehicleColor: data.driver?.vehicle?._doc?.vehicle_color || data.driver?.vehicle?.color || 'Unknown',
      vehicleYear: data.driver?.vehicle?._doc?.car_year || data.driver?.vehicle?.year || 'Unknown',
      estimatedDistance: data?.booking?.estimated_distance || 0,
      estimatedDuration: data?.booking?.estimated_duration || 0
    };

    // Add to existing drivers array
    setDrivers(prevDrivers => {
      const existingIndex = prevDrivers.findIndex(driver => driver.id === driverData.id);
      if (existingIndex >= 0) {
        // Update existing driver
        const updatedDrivers = [...prevDrivers];
        updatedDrivers[existingIndex] = driverData;
        return updatedDrivers;
      } else {
        // Add new driver
        return [...prevDrivers, driverData];
      }
    });

    console.log('💾 Driver data saved:', driverData);
  }, []);

  // New message handler for badge (using socketService)
  const handleNewMessageForBadge = useCallback((data: any) => {
    console.log('📨 New message received for badge (socketService):', data);
    
    // Only add to unread count if the message is not from current user
    const messageSenderId = data.senderId || data.sender_id;
    const currentUserId = user?.id;
    const chatId = currentBooking?.driver_id || currentBooking?.driver_id?._id;
    
    if (messageSenderId !== currentUserId && chatId && !messageState.isChatOpen) {
      dispatch(addUnreadMessage({ 
        chatId, 
        messageId: data.messageId || data.id || `msg_${Date.now()}` 
      }));
      console.log('📨 Badge updated for new message from:', messageSenderId);
    } else {
      console.log('📨 Message not counted for badge:', {
        isFromCurrentUser: messageSenderId === currentUserId,
        chatId,
        isChatOpen: messageState.isChatOpen
      });
    }
  }, [dispatch, currentBooking, user, messageState.isChatOpen]);

  // New message handler for badge (using useSocketReconnection)
  const handleNewMessage = useCallback((data: any) => {
    console.log('📨 New message received for badge (useSocketReconnection):', data);
    
    // Only add to unread count if the message is not from current user
    const messageSenderId = data.senderId || data.sender_id;
    const currentUserId = user?.id;
    const chatId = currentBooking?.driver_id || currentBooking?.driver_id?._id;
    
    if (messageSenderId !== currentUserId && chatId && !messageState.isChatOpen) {
      dispatch(addUnreadMessage({ 
        chatId, 
        messageId: data.messageId || data.id || `msg_${Date.now()}` 
      }));
      console.log('📨 Badge updated for new message from:', messageSenderId);
    } else {
      console.log('📨 Message not counted for badge:', {
        isFromCurrentUser: messageSenderId === currentUserId,
        chatId,
        isChatOpen: messageState.isChatOpen
      });
    }
  }, [dispatch, currentBooking, user, messageState.isChatOpen]);

  // Driver location update handler
  const handleDriverLocationUpdate = useCallback((data: any) => {
    console.log('🚗🚗🚗 DRIVER LOCATION UPDATE RECEIVED 🚗🚗🚗');
    console.log('📡 Raw data received:', JSON.stringify(data));
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Data structure:', {
      hasData: !!data,
      hasLatitude: !!(data && data.latitude),
      hasLongitude: !!(data && data.longitude),
      hasCoordinates: !!(data && data.coordinates),
      dataKeys: data ? Object.keys(data) : 'null'
    });

    // First, set the raw data for debugging
    setDriverLocation(data);

    // Validate coordinates before setting driver location
    if (data &&
      typeof data.latitude === 'number' &&
      typeof data.longitude === 'number' &&
      !isNaN(data.latitude) &&
      !isNaN(data.longitude) &&
      data.latitude >= -90 && data.latitude <= 90 &&
      data.longitude >= -180 && data.longitude <= 180) {

      console.log('✅ Valid driver coordinates received:', data);
      console.log('📍 Latitude:', data.latitude, 'Longitude:', data.longitude);
      // Don't call setDriverLocation again since we already did above
    } else {
      console.log('❌ Invalid driver coordinates received:', data);
      console.log('Coordinates must be valid numbers within valid ranges');
      console.log('🔍 Validation details:', {
        hasData: !!data,
        latitudeType: data ? typeof data.latitude : 'undefined',
        longitudeType: data ? typeof data.longitude : 'undefined',
        latitudeValue: data?.latitude,
        longitudeValue: data?.longitude,
        latitudeValid: data ? (typeof data.latitude === 'number' && !isNaN(data.latitude) && data.latitude >= -90 && data.latitude <= 90) : false,
        longitudeValid: data ? (typeof data.longitude === 'number' && !isNaN(data.longitude) && data.longitude >= -180 && data.longitude <= 180) : false
      });
    }

    // if (data.latitude && data.longitude) {
    //   const newLocation = {
    //     latitude: data.latitude,
    //     longitude: data.longitude
    //   };

    //   // Only update if the location has changed significantly (more than 10 meters)
    //   setDriverLocation(prevLocation => {
    //     if (!prevLocation) {
    //       setShowDirections(true);
    //       return newLocation;
    //     }

    //     const distance = Math.sqrt(
    //       Math.pow(newLocation.latitude - prevLocation.latitude, 2) +
    //       Math.pow(newLocation.longitude - prevLocation.longitude, 2)
    //     );

    //     // Only update if distance is significant (approximately 10 meters)
    //     if (distance > 0.0001) {
    //       return newLocation;
    //     }

    //     return prevLocation;
    //   });
    // }
  }, []);

  console.log('//////////////////currentLocation:', currentBooking?.booking?.pickup_location?.coordinates);

  // Booking confirmed event handler
  const handleBookingConfirmed = useCallback((data: any) => {
    console.log('✅ Booking Confirmed: ' + JSON.stringify(data));

    // Store the complete booking data in Redux as received from the API
    dispatch(setCurrentBooking(data));

    // Set initial booking status when booking is confirmed
    dispatch(updateBookingStatus({
      status: data.booking?.status || 'confirmed',
      message: 'Your ride has been confirmed!',
      icon: '✅'
    }));

    setPickupLocation({
      latitude: Number(data.booking.pickup_location.coordinates[0]),
      longitude: Number(data.booking.pickup_location.coordinates[1])
    });
    setDropoffLocation({
      latitude: Number(data.booking.dropoff_location.coordinates[0]),
      longitude: Number(data.booking.dropoff_location.coordinates[1])
    });
    console.log('💾 Complete booking data stored in Redux:', data);
    console.log('🎉 Booking has been confirmed successfully!');
    console.log('📊 Initial booking status set:', data.booking?.status || 'confirmed');

  }, [dispatch]);

  // Booking cancelled event handler
  const handleBookingCancelled = useCallback((data: any) => {
    console.log('❌ Booking Cancelled: ' + JSON.stringify(data));

    // Clear the current booking from Redux
    dispatch(clearCurrentBooking());

    // Clear all driver-related state
    setAcceptedDriver(null);
    setAcceptedDriverId(null);
    setDrivers([]);
    setDriverLocation(null);
    setShowDirections(false);
    setCurrentBooking(null)
    dispatch(clearBookingStatus());
    // Show cancellation message to user
    Toast.show({
      type: 'info',
      text1: 'Ride Cancelled',
      text2: data.message || 'Your ride has been cancelled.',
      position: 'top',
      visibilityTime: 4000,
      onPress: () => {
        // Navigate back to previous screen
        (navigation as any).navigate('Main');
      },
      onShow: () => {
        // Auto-navigate after toast shows
        setTimeout(() => {
          (navigation as any).navigate('Main');
        }, 2000);
      }
    });

    console.log('🗑️ All booking data cleared due to cancellation');
  }, [dispatch, navigation]);
  console.log('🔍 Booking status:========>>', bookingStatus);

  // Booking status update event handler
  const handleBookingStatusUpdate = useCallback((data: any) => {
    console.log('🔄 Booking Status Update: ' + JSON.stringify(data));
    console.log('🔍 Current booking ID:', currentBooking?.booking_id);
    console.log('🔍 Received booking ID:', data.booking_id);
    console.log('🔍 Status:', data.status);

    // Store the status in Redux
    dispatch(updateBookingStatus({ status: data.status || '' }));

    console.log('🔍 Booking status:========>>', data.status);
    console.log(bookingStatus, "bookingStatus////")
    // Update status message and icon based on status
    switch (data.status || bookingStatus) {
      case 'driver_arrived':
        console.log('🚗 Driver arrived case triggered');
        dispatch(setStatusInfo({
          message: 'Your driver has arrived at the pickup location.',
          icon: '🚗'
        }));
        break;

      case 'started':
        console.log('🚀 Ride started case triggered');
        dispatch(setStatusInfo({
          message: 'Your ride has begun. Enjoy your journey!',
          icon: '🚀'
        }));
        break;

      case 'completed':
        console.log('🎉 Ride completed case triggered - showing rating modal');
        console.log('🔍 Exact status received:', data.status);

        // Show completion toast
        Toast.show({
          type: 'success',
          text1: 'Ride Completed',
          text2: 'Your ride has been completed. Please rate your experience!',
          position: 'top',
          visibilityTime: 4000,
        });

        // Transfer credits for completed booking
        if (currentBooking) {
          transferCredits(currentBooking);
        }

        // Show rating modal
        setShowRatingModal(true);
        break;

      case 'driver_on_the_way':
        console.log('🚗 Driver is on the way to pickup location');
        dispatch(setStatusInfo({
          message: 'The Driver is heading toward you.',
          icon: '🚗'
        }));
        break;

      default:
        console.log('📊 Status updated to:', data.status, '- no specific handler');
        dispatch(setStatusInfo({
          message: 'Status updated: ' + data.status,
          icon: '📊'
        }));
    }

    // Update the current booking in Redux with new status
    if (currentBooking && data?.booking_id === currentBooking?.booking_id) {
      const updatedBooking = {
        ...currentBooking,
        booking: {
          ...currentBooking.booking,
          status: data.status,
          ...data.updated_fields // Include any other updated fields
        }
      };

      dispatch(updateCurrentBooking(updatedBooking));
      console.log('💾 Booking status updated in Redux:', data.status);

      // Handle specific status changes
      console.log('🔍 Processing status:', data.status);
      switch (data.status) {
        case 'driver_arrived':
          console.log('🚗 Driver arrived case triggered');
          Toast.show({
            type: 'success',
            text1: 'Driver Arrived',
            text2: 'Your driver has arrived at the pickup location.',
            position: 'top',
            visibilityTime: 4000,
          });
          // Alert.alert(
          //   'Driver Arrived',
          //   'Your driver has arrived at the pickup location.',
          //   [{ text: 'OK' }]
          // );
          break;

        case 'ride_started':
          console.log('🚀 Ride started case triggered');
          // Alert.alert(
          //   'Ride Started',
          //   'Your ride has begun. Enjoy your journey!',
          //   [{ text: 'OK' }]
          // );
          break;

        case 'completed':
          console.log('🎉 Ride completed case triggered - showing rating modal');
          console.log('🔍 Exact status received:', data.status);

          // Show rating modal
          setShowRatingModal(true);
          setShowDirections(false);

          // Show completion toast and navigate
          Toast.show({
            type: 'success',
            text1: 'Ride Completed',
            text2: 'Your ride has been completed. Thank you for choosing our service!',
            position: 'top',
            visibilityTime: 4000,
            onPress: () => {
              console.log('🚀 Navigating to Main screen after ride completion');
              (navigation as any).navigate('Main');
            }
          });
          break;

        case 'driver_on_the_way':
          console.log('🚗 Driver is on the way to pickup location');
          break;

        default:
          console.log('📊 Status updated to:', data.status, '- no specific handler');
      }
    } else {
      console.log('⚠️ Status update received for different booking or no current booking');
      console.log('⚠️ Current booking exists:', !!currentBooking);
      console.log('⚠️ IDs match:', data.booking_id === currentBooking?.booking_id);
    }
  }, [currentBooking, dispatch, navigation,]);

  // Credits transfer function
  const transferCredits = useCallback(async (bookingData: any) => {
    try {
      console.log('💰 Starting credits transfer for completed booking...');

      // Extract required data from booking
      const customerId = bookingData?.booking?.customer_id;
      const driverId = bookingData?.booking?.driver_id || bookingData?.driver_id;
      const bookingId = bookingData?.booking_id || bookingData?.booking?._id;
      const amount = bookingData?.booking?.price?.toString() || '0';

      // Validate required fields
      if (!customerId || !driverId || !bookingId) {
        console.error('❌ Missing required data for credits transfer:', {
          customerId,
          driverId,
          bookingId,
          amount
        });
        return;
      }

      const payload = {
        customerId,
        driverId,
        bookingId,
        amount
      };

      console.log('💰 Credits transfer payload:', payload);

      const response = await networkClient.post(API_ENDPOINTS.CREDITS_TRANSFER, payload);

      console.log('✅ Credits transfer successful:', response.data);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Payment Processed',
        text2: 'Credits have been transferred successfully!',
        position: 'top',
        visibilityTime: 3000,
      });

    } catch (error: any) {
      console.error('❌ Credits transfer failed:', error);

      const errorMessage = error?.response?.data?.message || error.message || 'Failed to transfer credits';

      // Show error message
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  }, []);

  useEffect(() => {
    // Don't get current location automatically - only when button is pressed
    // getCurrentLocation();

    if (socketConnected) {
      console.log('🔌 Socket connected, adding event listeners...');
      addEventListener('driverApplied', handleDriverApplied);
      addEventListener('bookingConfirmed', handleBookingConfirmed);
      addEventListener('bookingCancelled', handleBookingCancelled);
      addEventListener('bookingStatusUpdate', handleBookingStatusUpdate);
      addEventListener('driverLocationUpdate', handleDriverLocationUpdate);
      addEventListener('newMessage', handleNewMessage);
      console.log('✅ Event listeners added successfully');
      console.log('🎯 Driver location update listener added - waiting for events...');
      console.log('🔍 Socket connection status:', {
        isConnected: socketConnected,
        isConnecting,
        reconnectAttempts
      });
    } else {
      console.log('❌ Socket not connected, cannot add event listeners');
      console.log('🔍 Socket connection status:', {
        isConnected: socketConnected,
        isConnecting,
        reconnectAttempts
      });
    }

    // Also listen to socketService for newMessage events (same as customer chat)
    console.log('🔌 Adding socketService listener for newMessage...');
    socketService.on('newMessage', handleNewMessageForBadge);

    console.log('🔍 pickupp location:', pickupLocation);
    console.log('✅ Accepted driver state:', acceptedDriver);
    if (acceptedDriver) {
      console.log('📋 Accepted driver keys:', Object.keys(acceptedDriver));
      console.log('👤 Driver name:', acceptedDriver.driverName);
      console.log('🚗 Vehicle type:', acceptedDriver.vehicleType);
      console.log('🔢 Vehicle model:', acceptedDriver.vehicleModel);
    }
    
    // Cleanup function
    return () => {
      removeEventListener('driverApplied', handleDriverApplied);
      removeEventListener('bookingConfirmed', handleBookingConfirmed);
      removeEventListener('bookingCancelled', handleBookingCancelled);
      removeEventListener('bookingStatusUpdate', handleBookingStatusUpdate);
      removeEventListener('driverLocationUpdate', handleDriverLocationUpdate);
      removeEventListener('newMessage', handleNewMessage);
      socketService.off('newMessage', handleNewMessageForBadge);
    };
  }, [socketConnected, addEventListener, removeEventListener, handleDriverApplied, handleBookingConfirmed, handleDriverLocationUpdate, handleNewMessage, handleNewMessageForBadge, currentBooking]);

  // Set initial region: prioritize driver location, then current location, then pickup location, then fallback to default
  useEffect(() => {
    if (!region) {
      let targetLatitude: number;
      let targetLongitude: number;

      // Priority 1: Driver location (if available)
      if (driverLocation &&
        driverLocation.coordinates &&
        Array.isArray(driverLocation.coordinates) &&
        driverLocation.coordinates.length >= 2 &&
        typeof driverLocation.coordinates[1] === 'number' &&
        typeof driverLocation.coordinates[0] === 'number' &&
        !isNaN(driverLocation.coordinates[1]) &&
        !isNaN(driverLocation.coordinates[0])) {
        targetLatitude = driverLocation.coordinates[1];
        targetLongitude = driverLocation.coordinates[0];
        console.log('🗺️ Setting initial region to driver location:', { targetLatitude, targetLongitude });
      }
      // Priority 2: Current user location (if available)
      else if (currentLocation &&
        typeof currentLocation.latitude === 'number' &&
        typeof currentLocation.longitude === 'number' &&
        !isNaN(currentLocation.latitude) &&
        !isNaN(currentLocation.longitude)) {
        targetLatitude = currentLocation.latitude;
        targetLongitude = currentLocation.longitude;
        console.log('🗺️ Setting initial region to current user location:', { targetLatitude, targetLongitude });
      }
      // Priority 3: Booking pickup location
      else if (booking?.booking?.pickup_location?.coordinates || currentBooking?.pickup_location?.coordinates || currentBooking?.booking?.pickup_location?.coordinates) {
        targetLatitude = Number(booking?.booking?.pickup_location?.coordinates[0] || currentBooking?.pickup_location?.coordinates[1] || currentBooking?.booking?.pickup_location?.coordinates[0]);
        targetLongitude = Number(booking?.booking?.pickup_location?.coordinates[1] || currentBooking?.pickup_location?.coordinates[0] || currentBooking?.booking?.pickup_location?.coordinates[1]);
        console.log('🗺️ Setting initial region to booking pickup location:', { targetLatitude, targetLongitude });
      }
      // Priority 4: Fallback to default location (Doha, Qatar)
      else {
        targetLatitude = 25.3548;
        targetLongitude = 51.1839;
        console.log('🗺️ Setting initial region to default location (Doha):', { targetLatitude, targetLongitude });
      }

      const newRegion = {
        latitude: targetLatitude,
        longitude: targetLongitude,
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      };
      setRegion(newRegion);
      setIsLoading(false); // Stop loading once we have a region
      console.log('🗺️ Initial map region set and loading finished:', newRegion);
      console.log('🗺️ Region details:', {
        source: driverLocation ? 'Driver Location' : currentLocation ? 'Current Location' : 'Pickup/Fallback',
        coordinates: [targetLatitude, targetLongitude]
      });
    }
  }, [driverLocation, currentLocation, booking?.booking?.pickup_location?.coordinates,  currentBooking]);

  // Automatically get current location when map screen loads
  useEffect(() => {
    if (!currentLocation && !isLoading) {
      console.log('📍 Auto-getting current location for map region...');
      getCurrentLocation();
    }
  }, [currentLocation, isLoading, getCurrentLocation]);

  // Update region when driver location changes (if we have an accepted driver)
  useEffect(() => {
    console.log('🔄 Driver location effect triggered:', {
      hasDriverLocation: !!driverLocation,
      driverLocation,
      hasAcceptedDriver: !!acceptedDriverId,
      acceptedDriverId
    });

    if (driverLocation &&
      driverLocation.coordinates &&
      Array.isArray(driverLocation.coordinates) &&
      driverLocation.coordinates.length >= 2 &&
      typeof driverLocation.coordinates[1] === 'number' &&
      typeof driverLocation.coordinates[0] === 'number' &&
      !isNaN(driverLocation.coordinates[1]) &&
      !isNaN(driverLocation.coordinates[0])) { // Removed acceptedDriverId requirement for testing

      const newRegion = {
        latitude: driverLocation.coordinates[1], // [1] = latitude
        longitude: driverLocation.coordinates[0], // [0] = longitude
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      };
      setRegion(newRegion);
      console.log('🗺️ Map region updated to driver location:', newRegion);
    } else {
      console.log('❌ Driver location effect conditions not met:', {
        hasValidDriverLocation: !!(driverLocation && driverLocation.coordinates),
        hasValidCoordinates: !!(driverLocation?.coordinates && Array.isArray(driverLocation.coordinates) && driverLocation.coordinates.length >= 2),
        hasValidNumbers: !!(driverLocation?.coordinates && typeof driverLocation.coordinates[1] === 'number' && typeof driverLocation.coordinates[0] === 'number'),
        hasAcceptedDriver: !!acceptedDriverId
      });
    }
  }, [driverLocation, acceptedDriverId]);



  // Auto-restart tracking when app resumes and there's an accepted driver
  console.log(currentBooking?.driver_id, "currentBooking?.driver_id")

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 Map screen focused - checking if tracking needs to restart...');

      // If we have an accepted driver and socket is connected, restart tracking
      if (socketConnected) {
        console.log('🔄 Restarting driver tracking for driver:', acceptedDriverId);
        emitEvent('startTracking', currentBooking?.driver_id || currentBooking?.driver_id?._id);

        // Also request current driver location immediately
        emitEvent('getDriverLocation', currentBooking?.driver_id);
      } else {
        console.log('⏸️ No need to restart tracking:', {
          hasAcceptedDriver: !!acceptedDriverId,
          socketConnected,
          hasCurrentBooking: !!currentBooking?.driver_id,
          driverId: currentBooking?.driver_id
        });
      }
    }, [currentBooking])
  );

  // Don't start automatic location tracking - only when button is pressed
  // useEffect(() => {
  //   if (locationPermissionGranted) {
  //     startLocationTracking();
  //   }
  //   
  //   // Cleanup location tracking on unmount
  //   return () => {
  //     stopLocationTracking();
  //   };
  // }, [locationPermissionGranted, startLocationTracking, stopLocationTracking]);



  // Set pickup and dropoff locations from booking data
  // useEffect(() => {
  //   if (currentBooking?.booking?.pickup_location?.coordinates) {
  //     const pickup = {
  //       latitude: Number(currentBooking.booking.pickup_location.coordinates[1]),
  //       longitude: Number(currentBooking.booking.pickup_location.coordinates[0])
  //     };
  //     setPickupLocation(pickup);
  //     console.log('📍 Pickup location set:', pickup);
  //   }

  //   if (currentBooking?.booking?.dropoff_location?.coordinates) {
  //     const dropoff = {
  //       latitude: Number(currentBooking.booking.dropoff_location.coordinates[1]),
  //       longitude: Number(currentBooking.booking.dropoff_location.coordinates[0])
  //     };
  //     setDropoffLocation(dropoff);
  //     console.log('🎯 Dropoff location set:', dropoff);
  //   }
  // }, [currentBooking]);

  // Handle accept driver (defined after socket hook)
  const handleAccept = useCallback(async (driverId: string, item: any, bookingId?: string) => {
    console.log('🚗 Ride accepted for driver:', driverId);
    console.log('📦 Received item data:', item);
    console.log('🔑 Item keys:', Object.keys(item));

    // Get booking ID from route params or use the one from driver data
    const currentBookingId = bookingId || booking?.id || booking?.booking_id;

    if (!currentBookingId) {
      console.error('❌ No booking ID available for accept driver');
      return;
    }

    console.log('aasss', item);
    setAcceptedDriver(item);

    // Emit accept driver event via socket
    emitEvent('acceptDriver', {
      booking_id: currentBookingId,
      driver_id: driverId
    });

    console.log('📤 Emitted acceptDriver event:', {
      booking_id: currentBookingId,
      driver_id: driverId
    });

    // Emit start tracking event via socket
    emitEvent('startTracking', driverId);

    console.log('📡 Emitted startTracking event for driver:', driverId);

    // Update UI to show accepted state
    setAcceptedDriverId(driverId);

    // Clear the drivers list after successful acceptance
    setDrivers([]);

    console.log('✅ Driver accepted, drivers list cleared');

  }, [booking, emitEvent]);

  // Handle cancel ride
  const handleCancelRide = useCallback(async () => {
    console.log('🚫 Cancel ride pressed');

    // Check if there's a current booking
    if (!currentBooking) {
      console.log('📱 No current booking, going back');
      (navigation as any).navigate('Main');
      return;
    }

    // Get booking ID from route params or accepted driver
    const currentBookingId = booking?.id || booking?.booking_id || acceptedDriver?.bookingId || currentBooking?.booking_id || currentBooking?._id;

    if (!currentBookingId) {
      console.error('❌ No booking ID available for cancel ride');
      // Alert.alert('Error', 'No booking found to cancel');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              console.log('🔄 Cancelling booking:', currentBookingId);

              // Emit stop tracking event if there's an accepted driver
              if (acceptedDriverId) {
                emitEvent('stopTracking', acceptedDriverId);
                console.log('📡 Emitted stopTracking event for driver:', acceptedDriverId);
              }

              // Call the cancel booking API directly
              const response = await networkClient.post(
                `/api/booking/${currentBookingId}/cancel`,
                {
                  reason: 'Customer cancelled ride',
                  cancelled_by: 'customer'
                }
              );

              console.log('✅ Ride cancelled successfully:', response);

              // Clear the accepted driver and drivers list
              setAcceptedDriver(null);
              setAcceptedDriverId(null);
              setDrivers([]);
              dispatch(clearBookingStatus());

              // Clear the current booking from Redux
              dispatch(clearCurrentBooking());

              // Show success message
              // Alert.alert(
              //   'Ride Cancelled',
              //   'Your ride has been cancelled successfully.',
              //   [
              //     {
              //       text: 'OK',
              //       onPress: () => {
              //         // Navigate back
              //         (navigation as any).goBack();
              //       }
              //     }
              //   ]
              // );

            } catch (error: any) {
              console.error('❌ Error cancelling ride:', error);

              // Show error message
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel ride. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  }, [currentBooking, booking, acceptedDriver, navigation, acceptedDriverId, emitEvent, dispatch]);

  // API Functions

  // Handle reject driver (defined after socket hook)
  const handleReject = useCallback(async (driverId: string, bookingId?: string) => {
    console.log('Ride rejected for driver:', driverId);

    // Get booking ID from route params or use the one from driver data
    const currentBookingId = bookingId || booking?.id || booking?.booking_id;

    if (!currentBookingId) {
      console.error('❌ No booking ID available for reject driver');
      return;
    }

    // Emit reject driver event via socket
    emitEvent('rejectDriver', {
      booking_id: currentBookingId,
      driver_id: driverId
    });

    console.log('📤 Emitted rejectDriver event:', {
      booking_id: currentBookingId,
      driver_id: driverId
    });

    // Remove the rejected driver from the list
    setDrivers(prevDrivers => {
      const filteredDrivers = prevDrivers.filter(driver => driver.driverId !== driverId);
      console.log(`🗑️ Driver ${driverId} rejected and removed from list. Remaining drivers: ${filteredDrivers.length}`);
      return filteredDrivers;
    });
  }, [booking, emitEvent]);

  const pickupLat = Number(currentBooking?.booking?.pickup_location?.coordinates?.[1])
  const pickupLng = Number(currentBooking?.booking?.pickup_location?.coordinates?.[0])
  const dropoffLat = Number(currentBooking?.booking?.dropoff_location?.coordinates?.[1])
  const dropoffLng = Number(currentBooking?.booking?.dropoff_location?.coordinates?.[0])

  console.log('📍 Coordinates:', {
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    isValidPickup: !isNaN(pickupLat) && !isNaN(pickupLng),
    isValidDropoff: !isNaN(dropoffLat) && !isNaN(dropoffLng),
    pickupCoords: currentBooking?.booking?.pickup_location?.coordinates,
    dropoffCoords: currentBooking?.booking?.dropoff_location?.coordinates
  });

  // Calculate distance between coordinates
  if (!isNaN(pickupLat) && !isNaN(pickupLng) && !isNaN(dropoffLat) && !isNaN(dropoffLng)) {
    const distance = Math.sqrt(
      Math.pow(dropoffLat - pickupLat, 2) + Math.pow(dropoffLng - pickupLng, 2)
    );
    console.log('📏 Distance between coordinates:', distance);
    console.log('⚠️ Coordinates are very close - this might be why no route shows');
  }


  console.log('--------Current booking:', currentBooking?.booking?.pickup_location?.coordinates &&
    currentBooking?.booking?.dropoff_location?.coordinates);
  console.log('🔍 Booking data for directions:', {
    hasBooking: !!currentBooking,
    hasPickup: !!currentBooking?.booking?.pickup_location?.coordinates,
    hasDropoff: !!currentBooking?.booking?.dropoff_location?.coordinates,
    pickupCoords: currentBooking?.booking?.pickup_location?.coordinates,
    dropoffCoords: currentBooking?.booking?.dropoff_location?.coordinates,
    pickupLat: currentBooking?.booking?.pickup_location?.coordinates?.[1],
    pickupLng: currentBooking?.booking?.pickup_location?.coordinates?.[0],
    dropoffLat: currentBooking?.booking?.dropoff_location?.coordinates?.[1],
    dropoffLng: currentBooking?.booking?.dropoff_location?.coordinates?.[0]
  });

  // Debug: Check if MapViewDirections should render
  const shouldShowDirections = currentBooking?.booking?.pickup_location?.coordinates &&
    currentBooking?.booking?.dropoff_location?.coordinates;
  console.log('🎯 Should show directions:', shouldShowDirections);
  console.log('📋 Full currentBooking object:', JSON.stringify(currentBooking, null, 2));

  // Debug: Check if currentBooking exists and has coordinate

  // Test with hardcoded coordinates to see if the issue is with the data
  if (currentBooking?.booking?.pickup_location?.coordinates) {
    console.log('🧪 Testing with actual coordinates:', {
      pickup: currentBooking.booking.pickup_location.coordinates,
      dropoff: currentBooking.booking.dropoff_location.coordinates,
      pickupLat: currentBooking.booking.pickup_location.coordinates[1],
      pickupLng: currentBooking.booking.pickup_location.coordinates[0],
      dropoffLat: currentBooking.booking.dropoff_location.coordinates[1],
      dropoffLng: currentBooking.booking.dropoff_location.coordinates[0]
    });
  }
  // Data arrays
  const rides = [
    {
      id: 1,
      name: t("ride_name"),
      type: t("premium"),
      price: '160',
      currency: t("currency"),
      time: '06:44 PM',
      icon: car
    },
    {
      id: 2,
      name: t("ride_name"),
      type: t("vvip"),
      price: '160',
      currency: t("currency"),
      time: '06:44 PM',
      icon: car
    }
  ];

  const cardData = [
    {
      id: '1',
      vehicleName: t("lexus_600"),
      vehicleModel: t("model_black_cf_2826"),
      vehicleRating: 5.5,
      driverName: t("ride_name"),
      driverRating: 4.5,
      price: '120',
      currency: 'QR',
      vehicleImage: { uri: 'https://example.com/defender-image.jpg' },
      driverImage: { uri: 'https://example.com/driver-image.jpg' },
    },
    {
      id: '2',
      vehicleName: t("defender"),
      vehicleModel: t("model_black_cf_58719"),
      vehicleRating: 4.8,
      driverName: t("ride_name"),
      driverRating: 4.2,
      price: '200',
      currency: 'QR',
      vehicleImage: { uri: 'https://example.com/landcruiser-image.jpg' },
      driverImage: { uri: 'https://example.com/driver2-image.jpg' },
    },
  ];

  // Show loading state only if we don't have a region yet
  // if (isLoading && !region) {
  //   return (
  //     <View style={styles.loading}>
  //       <Text style={styles.loadingText}>Loading map...</Text>
  //       <Text style={styles.socketStatus}>Please wait while we set up your map</Text>
  //       <AppButton
  //         title="Force Load Map"
  //         onPress={() => {
  //           const fallbackRegion = {
  //             latitude: 25.3548,
  //             longitude: 51.1839,
  //             latitudeDelta: 0.18,
  //             longitudeDelta: 0.18,
  //           };
  //           setRegion(fallbackRegion);
  //           setIsLoading(false);
  //         }}
  //         style={{ marginTop: 20 }}
  //       />
  //     </View>
  //   );
  // }

  // Debug info
  console.log('🔍 Map render state:', {
    isLoading,
    hasRegion: !!region,
    region,
    hasCurrentLocation: !!currentLocation,
    hasBooking: !!booking?.booking?.pickup_location?.coordinates,
    driverLocation,
    hasDriverLocation: !!driverLocation,
    driverLocationType: driverLocation ? typeof driverLocation : 'null',
    driverCoordinates: driverLocation?.coordinates,
    acceptedDriverId
  });



  return (
    <View style={{ flex: 1 }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region || undefined}
        zoomEnabled={true}
        showsMyLocationButton={false}
        maxZoomLevel={18}
        minZoomLevel={3}
        // showsUserLocation={true}
        mapType="standard"
        onMapReady={() => setIsMapReady(true)}
        followsUserLocation={false}
        rotateEnabled={false}
        scrollEnabled={true}
        pitchEnabled={false}
        // onRegionChangeComplete={(newRegion) => {
        //   // Update region state when user manually moves the map
        //   setRegion(newRegion);
        // }}
      >
        {/* TEST: Always show a simple direction to verify component works */}
        {currentBooking && (
          <MapViewDirections
            origin={{
              latitude: driverLocation?.coordinates[1],  // [1] = latitude
              longitude: driverLocation?.coordinates[0]  // [0] = longitude
            }}
            destination={{
              latitude: bookingStatus === 'driver_on_the_way' ? Number(currentBooking?.booking?.pickup_location?.coordinates[1]) || Number(currentBooking?.pickup_location?.coordinates[1]) : Number(currentBooking?.booking?.dropoff_location?.coordinates[1]) || Number(currentBooking?.dropoff_location?.coordinates[1]),
              longitude: bookingStatus === 'driver_on_the_way' ? Number(currentBooking?.booking?.pickup_location?.coordinates[0]) || Number(currentBooking?.pickup_location?.coordinates[0]) : Number(currentBooking?.booking?.dropoff_location?.coordinates[0]) || Number(currentBooking?.dropoff_location?.coordinates[0])
            }}
            apikey={"AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ"}
            strokeWidth={6}
            strokeColor={StyleGuide.color.primary}
            optimizeWaypoints={true}
            precision="high"
            timePrecision="now"
            mode="DRIVING"
            onStart={(params) => {
              console.log('🟢 TEST Directions started:', params);
            }}
            onReady={result => {
              console.log('🟢 TEST Directions ready:', result);
            }}
            onError={(errorMessage) => {
              console.log('🟢 TEST Directions error:', errorMessage);
            }}
          />
        )}













        {/* Fallback polyline for when directions are not available */}

        {/* Driver marker */}
        {driverLocation &&
          driverLocation.coordinates &&
          Array.isArray(driverLocation.coordinates) &&
          driverLocation.coordinates.length >= 2 &&
          typeof driverLocation.coordinates[1] === 'number' &&
          typeof driverLocation.coordinates[0] === 'number' &&
          !isNaN(driverLocation.coordinates[1]) &&
          !isNaN(driverLocation.coordinates[0]) && (
            <Marker
              coordinate={{
                latitude: driverLocation.coordinates[1],  // [1] = latitude
                longitude: driverLocation.coordinates[0]  // [0] = longitude
              }}
              title="Driver"
              description="Your driver's location"
            >
              <Svg xml={carSvg} rest={{ height: 42, width: 42 }} />
            </Marker>
          )}

        {/* Current User Location Marker - Circular like button */}
        {currentLocation &&
          typeof currentLocation.latitude === 'number' &&
          typeof currentLocation.longitude === 'number' &&
          !isNaN(currentLocation.latitude) &&
          !isNaN(currentLocation.longitude) && (
            <Marker
              coordinate={currentLocation}
              title="Your Current Location"
              description="Where you are right now"
             
            >
              {/* <View style={styles.currentLocationMarker}> */}
              <Text style={styles.currentLocationMarkerText}>📍</Text>
              {/* </View> */}
            </Marker>
          )}

        {/* Pickup Location Marker */}
        {/* {currentBooking?.booking?.dropoff_location?.coordinates && (
          <Marker 
            coordinate={{
              latitude: Number(currentBooking?.booking?.dropoff_location?.coordinates[0]), // Correct coordinate order
              longitude: Number(currentBooking?.booking?.dropoff_location?.coordinates[1])
            }}
            title="Pickup Location"
            description="Pickup location"
            pinColor="green"
            // draggable={true}
            onDragEnd={handlePickupLocationDragEnd}
          >
            <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
          </Marker>
        )} */}

        {/* Destination marker */}
        {currentBooking?.booking?.dropoff_location?.coordinates &&
          <Marker
            coordinate={{
              latitude: (bookingStatus === 'started' || bookingStatus === 'completed' || bookingStatus === 'driver_arrived') ? Number(booking?.booking?.dropoff_location?.coordinates[1] || currentBooking.booking?.dropoff_location?.coordinates[1] || currentBooking.dropoff_location?.coordinates[1]) : Number(currentBooking.booking.pickup_location.coordinates[1] || currentBooking.pickup_location.coordinates[1]),
              longitude: (bookingStatus === 'started' || bookingStatus === 'completed' || bookingStatus === 'driver_arrived') ? Number(booking?.booking?.dropoff_location.coordinates[0] || currentBooking.booking?.dropoff_location.coordinates[0] || currentBooking.dropoff_location.coordinates[0]) : Number(currentBooking.booking.pickup_location.coordinates[0] || currentBooking.pickup_location.coordinates[0])
            }}
            title="Destination"
            description="Where you want to go"
            pinColor="red"
            // tracksViewChanges={tracksViewChanges}
            
          >
            <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
          </Marker>
        }
      </MapView>

      {currentBooking && (
        <>
          <TimeStatusCard
            icon={statusIcon || '🚗'}
            title={statusMessage || 'Waiting for driver...'}
            waitingTime={
              bookingStatus === 'started'
                ? currentBooking?.booking?.estimated_duration?.toString() || "5:00"
                : currentBooking?.booking?.estimated_time_to_pickup?.toString() || "5:00"
            }
            waitingLabel={t('waiting_time')}
            containerStyle={{ position: 'absolute', top: 50 }}
            iconContainerStyle={{ backgroundColor: '#ffcc80' }}
          />

          {/* Duration Timer Component - Always render but control active state */}
          {currentBooking?.duration_for_rent && (
            <View style={{
              position: 'absolute',
              top: 120,
              right: 20,
              zIndex: 1000
            }}>
              <DurationTimer
                key={`duration-timer-${currentBooking?.booking_id}`}
                isActive={bookingStatus === 'started'}
                durationHours={Number(currentBooking.duration_for_rent)}
                bookingId={currentBooking?.booking_id || 'default'}
                shouldReset={bookingStatus === 'completed' || bookingStatus === 'cancelled' || currentBooking?.booking?.status === 'completed' || currentBooking?.booking?.status === 'cancelled'}
                onTimerExpired={() => {
                  console.log('⏰ Duration timer expired!');
                  // Handle timer expiration if needed
                }}
              />
            </View>
          )}
        </>
      )}


      {/* Plan Trip Cards */}
      {/* {from === 'plan' && ( */}
      {currentBooking && (
        <RideInfoCard
          price={currentBooking?.booking?.price || currentBooking?.price}
          currency={currentBooking?.booking?.currency || currentBooking?.currency}
          driverName={currentBooking?.driver?.vehicle?.make || currentBooking?.driver_active_vehicle
            ?.car_make || "Unknown Driver"}
          driverRating={acceptedDriver?.driverRating || 4.5}
          carColor={currentBooking?.driver?.vehicle?.color || currentBooking?.driver_active_vehicle?.vehicle_color || "Standard"}
          carModel={currentBooking?.driver?.vehicle?.model || currentBooking?.driver_active_vehicle?.car_model || "Unknown"}
          licensePlate={currentBooking?.driver?.vehicle?.license_plate || currentBooking?.driver_active_vehicle?.license_plate || "Unknown"}
          onCallPress={() => {
            const emergencyNumber = "";  // Example emergency number, change if needed
            Linking.openURL(`tel:${emergencyNumber}`)
              .catch(err => console.error("Failed to open dialer", err));
          }}
          onMessagePress={handleChat}
          onShowDetailsPress={() => console.log('Show details pressed for:', acceptedDriver?.driverName)}
          style={{
            position: 'absolute',
            bottom: Math.max(90, insets.bottom + 80), // Account for bottom navigation
            width: screenWidth * 0.92,
            zIndex: 1000
          }}
          booking_type={currentBooking?.booking?.booking_type || currentBooking?.booking_type}
          carImage={currentBooking?.driver?.vehicle?.vehicle_pictures[0] || currentBooking?.driver_active_vehicle?.vehicle_pictures[0]}
          profileImage={currentBooking?.driver?.profile_image || currentBooking?.driver_profile?.driver_img}
          carDriverName={currentBooking?.driver?.name || currentBooking?.driver_profile?.name}
          currentLocation={currentBooking?.booking?.pickup_location?.address || currentBooking?.pickup_location?.address}
          officeLocation={currentBooking?.booking?.dropoff_location?.address || currentBooking?.dropoff_location?.address}
          estimatedTime={currentBooking?.booking?.estimated_duration?.toString() || currentBooking?.estimated_duration?.toString()}
          distance={currentBooking?.booking?.estimated_distance?.toString() || currentBooking?.estimated_distance?.toString()}
          chatId={currentBooking?.driver_id || currentBooking?.driver_id?._id}
        />
      )}
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripCard
            vehicleImage={item.vehicleImage}
            vehicleName={item.vehicleName}
            vehicleModel={item.vehicleModel}
            vehicleRating={item.vehicleRating}
            driverName={item.driverName}
            driverImage={item.driverImage}
            driverRating={item.driverRating}
            price={item.price}
            currency={item.currency}
            onAccept={() => handleAccept(item.driverId, item, item.bookingId)}
            onReject={() => handleReject(item.driverId, item.bookingId)}
          />
        )}
        style={styles.overlayContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      // ListEmptyComponent={() => (
      //   <View style={{ padding: 20, alignItems: 'center' }}>
      //     <Text style={{ color: '#666', fontSize: 16 }}>
      //       No drivers available yet...
      //     </Text>
      //     <Text style={{ color: '#999', fontSize: 14, marginTop: 5 }}>
      //       Drivers will appear here when they apply
      //     </Text>
      //   </View>
      // )}
      />
      {/* )} */}

      {/* Book Ride Modal */}
      {from === 'bookRide' && (
        <>
          <BottomModal
            showHandle={true}
            isVisible={isModalVisible}
            onClose={toggleModal}
            style={{}}
            contentStyle={{}}
          >
            <View style={styles.modalHeader}>
              {currentStep === 2 && (
                <Pressable onPress={() => setCurrentStep(1)} style={styles.backButton}>
                  <Svg
                    xml={rightIcon}
                    rest={{
                      height: 24,
                      width: 24,
                      transform: [{ rotate: '180deg' }]
                    }}
                  />
                </Pressable>
              )}
              <Text style={styles.modalTitle}>
                {currentStep === 1 ? t("choose_ride") : t("payment_method")}
              </Text>
            </View>

            {currentStep === 1 && (
              <>
                <View style={{ marginBottom: 10 }}>
                  {rides.map((ride) => (
                    <RideCard
                      image={ride?.icon}
                      key={ride.id}
                      ride={ride}
                      isSelected={selectedRide === ride.id}
                      onSelect={handleRideSelect}
                    />
                  ))}
                </View>
                <Pressable onPress={handlePaymentStep} style={[styles.paymentButton, flexDirection]}>
                  <View style={[{ alignItems: 'center' }, flexDirection]}>
                    <Svg xml={atmCard} rest={{ height: 24, width: 30 }} />
                    <Text style={[styles.paymentText, isRTL ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                      {t('card_payment')}
                    </Text>
                  </View>
                  <Svg xml={rightIcon} rest={{ height: 18, width: 18, transform: [{ rotate: '180deg' }] }} />
                </Pressable>
              </>
            )}

            {currentStep === 2 && <PaymentMethods />}

            <AppButton
              title={t("next")}
              onPress={() => {
                // Add next step logic here
                console.log('Next button pressed');
              }}
            />
          </BottomModal>

          <RideInfoCard
            driverName="RR Cullinan"
            driverRating={5.5}
            carColor="White"
            licensePlate="CF 21536"
            onCallPress={() => console.log('Call pressed')}
            onMessagePress={handleChat}
            onShowDetailsPress={() => console.log('Show details pressed')}
            style={{
              position: 'absolute',
              bottom: Math.max(90, insets.bottom + 80), // Account for bottom navigation
              width: screenWidth * 0.92
            }}
          />
        </>
      )}

      {/* Current Location Button - Circular */}
      <AppButton
        style={styles.currentLocationButton}
        variant="secondary"
        title="📍"
        onPress={() => {
          console.log('📍 Current location button pressed');
          getCurrentLocation();
        }}
        disabled={isLoading}
      />



      {/* Cancel Ride Button */}
      <AppButton
        style={{
          ...styles.cancelButton,
          bottom: Math.max(20, insets.bottom + 10), // Back to original position
        }}
        variant="secondary"
        title={t('cancel_ride')}
        onPress={handleCancelRide}
        loading={isLoading}
        disabled={isCancelling}
      />

      {/* Toast Component for notifications */}
      <Toast />

      {/* Rating Modal */}
      <RatingModal
        isVisible={showRatingModal}
        onClose={handleRatingModalClose}
        onSubmit={handleRatingSubmit}
        driverName={currentBooking?.driver?.name || currentBooking?.driver_profile?.name || 'Driver'}
        isLoading={isSubmittingRating}
      />
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: StyleGuide?.fontFamily?.semiBold || 'System',
    marginBottom: 10,
  },
  socketStatus: {
    fontSize: 14,
    color: '#666',
  },
  overlayContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'column',
  },
  modalHeader: {
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    marginBottom: 15,
    borderBottomColor: StyleGuide?.color?.lightGrey || '#e0e0e0',
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 7,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: StyleGuide?.fontFamily?.bold || 'System',
  },
  paymentButton: {
    backgroundColor: '#C8A7774D',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentText: {
    fontFamily: StyleGuide?.fontFamily?.semiBold || 'System',
    fontSize: 18,
    color: StyleGuide?.color?.primary || '#000',
  },
  cancelButton: {
    marginHorizontal: 20,
    position: 'absolute',
    width: '90%',
    zIndex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    top: Math.max(20, 30),
    right: 20,
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: 28, // Make it perfectly circular
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationMarker: {
    width: 56,
    height: 56,
    borderRadius: 28, // Same size as button
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationMarkerText: {
    fontSize: 24,
    textAlign: 'center',
  },

  socketIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  socketText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  socketControls: {
    position: 'absolute',
    top: 150,
    right: 10,
    zIndex: 2,
    gap: 5,
  },
  socketButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    minWidth: 80,
  },
});