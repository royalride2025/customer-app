import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
import RideCard from './components/rideCard';
import PaymentMethods from './components/paymentCard';
import RideInfoCard from './components/rideInfoCard';
import TimeStatusCard from './components/timeStatusCard';
import { t } from 'i18next';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { useAppSelector, useAppDispatch } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { setCurrentBooking, updateCurrentBooking, clearCurrentBooking } from '../../redux/bookingSlice';
import { useSocketReconnection } from '../../lib/hooks/useSocketReconnection';
import networkClient from '../../../networkClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const car = require('../../../assets/images/halfCar.png');

// Google Maps API Key - Replace with your actual API key
const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY';

const routeCoordinates = [
  {
    latitude: 31.4926,
    longitude: 74.3925,
  },
  { latitude: 31.6018, longitude: 74.3206 },
];

const destination = { latitude: 31.6018, longitude: 74.3206 };

const Map = () => {
  // State variables
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [region, setRegion] = useState<{latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number} | null>(null);
  const [selectedRide, setSelectedRide] = useState(1);
  const [isModalVisible, setModalVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedDriverId, setAcceptedDriverId] = useState<string | null>(null);
  const [acceptedDriver, setAcceptedDriver] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('');
  

  console.log(drivers,"//////////drivers")
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
  
  // Safe area insets for proper button positioning
  const insets = useSafeAreaInsets();


  console.log('Current booking state:',  {driverId: currentBooking?.driver_id,
    bookingId: currentBooking?.booking_id,
    driverName: currentBooking?.driver?.name,
    driverImage: currentBooking?.driver?.profile_image,});

  console.log('Current drivers state:', drivers);
  console.log('Drivers count:', drivers.length);

  // Handlers
  const handleChat = useCallback(() => {
    (navigation as any).navigate('customerChat',{
      driverId: currentBooking?.driver_id,
      bookingId: currentBooking?.booking_id,
      driverName: currentBooking?.driver?.name,
      driverImage: currentBooking?.driver?.profile_image,
    });
  }, [navigation]);

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

  // Location functions
  const setDefaultLocation = useCallback(() => {
    const defaultRegion = {
      latitude: 31.4926,
      longitude: 74.3925,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(defaultRegion);
    setCurrentLocation({
      latitude: 31.4926,
      longitude: 74.3925,
    });
    setIsLoading(false);
  }, []);

  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setCurrentLocation(newLocation);
        setRegion(newRegion);
        setIsLoading(false);
      },
      (error) => {
        console.log('Location error:', error);
        // Alert.alert('Error', 'Unable to fetch location. Using default location.');
        setDefaultLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10,
      }
    );
  }, [setDefaultLocation]);

  const handleMarkerDragEnd = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setCurrentLocation(coordinate);
  }, []);

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

  // Driver location update handler
  const handleDriverLocationUpdate = useCallback((data: any) => {
    console.log('Driver Location Update: ' + JSON.stringify(data));
    
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
    
    // Show cancellation message to user
    Alert.alert(
      'Ride Cancelled',
      data.message || 'Your ride has been cancelled.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to previous screen
            (navigation as any).navigate('Main');
          }
        }
      ]
    );
    
    console.log('🗑️ All booking data cleared due to cancellation');
  }, [dispatch, navigation]);
  console.log('🔍 Booking status:========>>', bookingStatus);

  // Booking status update event handler
  const handleBookingStatusUpdate = useCallback((data: any) => {
    console.log('🔄 Booking Status Update: ' + JSON.stringify(data));
    console.log('🔍 Current booking ID:', currentBooking?.booking_id);
    console.log('🔍 Received booking ID:', data.booking_id);
    console.log('🔍 Status:', data.status);
    
         // Store the status in state
     setBookingStatus(data.status || '');
     
     console.log('🔍 Booking status:========>>', data.status);
     // Test alert to see if Alert is working
     switch (data.status) {
       case 'driver_arrived':
         console.log('🚗 Driver arrived case triggered');
         Alert.alert(
           'Driver Arrived',
           'Your driver has arrived at the pickup location.',
           [{ text: 'OK' }]
         );
         break;
         
       case 'started':
         console.log('🚀 Ride started case triggered');
         Alert.alert(
           'Ride Started',
           'Your ride has begun. Enjoy your journey!',
           [{ text: 'OK' }]
         );
         break;
         
          case 'completed':
           console.log('🎉 Ride completed case triggered - navigating to Main screen');
           console.log('🔍 Exact status received:', data.status);
           
           // Clear all booking and driver state immediately
           dispatch(clearCurrentBooking());
           setAcceptedDriver(null);
           setAcceptedDriverId(null);
           setDrivers([]);
           setDriverLocation(null);
           setShowDirections(false);
           setBookingStatus('');
           setCurrentBooking(null);
           
           Alert.alert(
             'Ride Completed',
             'Your ride has been completed. Thank you for choosing our service!',
             [
               {
                 text: 'OK',
                 onPress: () => {
                   console.log('🚀 Navigating to Main screen after ride completion');
                   // Navigate back to previous screen
                   (navigation as any).navigate('Main');
                 }
               }
             ]
           );
           break;
         
       case 'driver_on_the_way':
         console.log('🚗 Driver is on the way to pickup location');
         break;
         
       default:
         console.log('📊 Status updated to:', data.status, '- no specific handler');
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
          Alert.alert(
            'Driver Arrived',
            'Your driver has arrived at the pickup location.',
            [{ text: 'OK' }]
          );
          break;
          
        case 'ride_started':
          console.log('🚀 Ride started case triggered');
          Alert.alert(
            'Ride Started',
            'Your ride has begun. Enjoy your journey!',
            [{ text: 'OK' }]
          );
          break;
          
           case 'completed':
            console.log('🎉 Ride completed case triggered - navigating to Main screen');
            console.log('🔍 Exact status received:', data.status);
            
            // Clear all booking and driver state immediately
            dispatch(clearCurrentBooking());
            setAcceptedDriver(null);
            setAcceptedDriverId(null);
            setDrivers([]);
            setDriverLocation(null);
            setShowDirections(false);
            
            Alert.alert(
              'Ride Completed',
              'Your ride has been completed. Thank you for choosing our service!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('🚀 Navigating to Main screen after ride completion');
                    // Navigate back to previous screen
                    (navigation as any).navigate('Main');
                  }
                }
              ]
            );
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
  }, [currentBooking, dispatch, navigation]);

  useEffect(() => {
 
    setDefaultLocation();
    getCurrentLocation();

    if (socketConnected) {
      console.log('🔌 Socket connected, adding event listeners...');
      addEventListener('driverApplied', handleDriverApplied);
      addEventListener('bookingConfirmed', handleBookingConfirmed);
      addEventListener('bookingCancelled', handleBookingCancelled);
      addEventListener('bookingStatusUpdate', handleBookingStatusUpdate);
      addEventListener('driverLocationUpdate', handleDriverLocationUpdate);
      console.log('✅ Event listeners added successfully');
    } else {
      console.log('❌ Socket not connected, cannot add event listeners');
    }
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
    };
  }, [socketConnected, setDefaultLocation, getCurrentLocation, addEventListener, removeEventListener, handleDriverApplied, handleBookingConfirmed, handleDriverLocationUpdate]);

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
    
    console.log('💾 Setting accepted driver to:', item);
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
    const currentBookingId = booking?.id || booking?.booking_id || acceptedDriver?.bookingId || currentBooking?.booking_id;
    
    if (!currentBookingId) {
      console.error('❌ No booking ID available for cancel ride');
      Alert.alert('Error', 'No booking found to cancel');
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
              
              // Clear the current booking from Redux
              dispatch(clearCurrentBooking());
              
              // Show success message
              Alert.alert(
                'Ride Cancelled',
                'Your ride has been cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back
                      (navigation as any).goBack();
                    }
                  }
                ]
              );
              
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
  currentBooking?.booking?.dropoff_location?.coordinates );
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

  return (
    <View style={{ flex: 1 }}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region || undefined}
        zoomEnabled={true}
        showsMyLocationButton={false}
        maxZoomLevel={18}
        minZoomLevel={3}
        showsUserLocation={true}
        mapType="standard"
        onMapReady={() => setIsMapReady(true)}
        followsUserLocation={false}
        rotateEnabled={false}
        scrollEnabled={true}
        pitchEnabled={false}
      >
                {/* TEST: Always show a simple direction to verify component works */}
                {currentBooking?.booking?.pickup_location?.coordinates?.[0] && 
                 currentBooking?.booking?.pickup_location?.coordinates?.[1] &&
                 currentBooking?.booking?.dropoff_location?.coordinates?.[0] &&
                 currentBooking?.booking?.dropoff_location?.coordinates?.[1] && (
                                      <MapViewDirections
                      origin={{
                        latitude: currentLocation?.latitude || 0,
                        longitude: currentLocation?.longitude || 0
                      }}
                    destination={{
                      latitude:bookingStatus === 'driver_arrived' ? Number(currentBooking.booking?.dropoff_location?.coordinates[0]) :Number(currentBooking.booking.pickup_location.coordinates[0]),
                      longitude:bookingStatus === 'driver_arrived' ? Number(currentBooking.booking?.dropoff_location?.coordinates[1]) : Number(currentBooking.booking.pickup_location.coordinates[1])
                    }}
                    apikey={"AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ"}
                    strokeWidth={6}
                    strokeColor="green"
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
        {driverLocation && (
          <Marker 
            coordinate={driverLocation}
            title="Driver"
            description="Your driver's location"
          >
            <Svg xml={carSvg} rest={{ height: 42, width: 42 }} />
          </Marker>
        )}

        {/* User location marker */}
        {currentLocation && (
          <Marker 
            coordinate={currentLocation}
            onDragEnd={handleMarkerDragEnd}
            draggable={true}
            title="Your Location"
            description="Drag to update pickup location"
          >
            <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
          </Marker>
        )}

        {/* Destination marker */}
        {currentBooking?.booking?.dropoff_location?.coordinates &&
        <Marker 
          coordinate={{
            latitude:bookingStatus === 'driver_arrived' ? Number(currentBooking.booking?.dropoff_location?.coordinates[0]) :Number(currentBooking.booking.pickup_location.coordinates[0]),
            longitude:bookingStatus === 'driver_arrived' ? Number(currentBooking.booking?.dropoff_location?.coordinates[1]) : Number(currentBooking.booking.pickup_location.coordinates[1])
          }} 
          title="Destination"
        >
          <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
        </Marker>
        }
      </MapView>

{currentBooking && (
      <TimeStatusCard
        icon="🛺"
       
        waitingTime={currentBooking?.booking?.estimated_time_to_pickup?.toString() || "5:00"}
        waitingLabel={t('waiting_time')}
        containerStyle={{ position: 'absolute', top: 50 }}
        iconContainerStyle={{ backgroundColor: '#ffcc80' }}
      />
)}
      {/* Socket Status Indicator (for debugging - remove in production) */}
      {/* <View style={styles.socketIndicator}>
        <Text style={[styles.socketText, { color: socketConnected ? 'green' : 'red' }]}>
          {socketConnected ? '● Connected' : '● Disconnected'}
        </Text>
        {isConnecting && (
          <Text style={[styles.socketText, { color: 'orange' }]}>
            Connecting... (Attempt {reconnectAttempts + 1})
          </Text>
        )}
      </View> */}
      
      {/* Socket Control Buttons (for debugging - remove in production) */}
      {/* <View style={styles.socketControls}>
        <AppButton
          style={styles.socketButton}
          title="Reconnect"
          onPress={reconnect}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#f44336' }}
          title="Disconnect"
          onPress={disconnect}
        />
       
     
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#ff9800' }}
          title="Clear Drivers"
          onPress={() => setDrivers([])}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#9c27b0' }}
          title="Test Booking Confirmed"
          onPress={() => {
            // Simulate booking confirmed event with actual API structure
            const testBookingData = {
              "booking_id": "68891cd5f248a48ed1c301e5",
              "booking": {
                "pickup_location": {
                  "type": "Point",
                  "coordinates": [31.492558, 74.3924679],
                  "address": "Nishat Colony Lahore, Pakistan"
                },
                "dropoff_location": {
                  "type": "Point",
                  "coordinates": [31.4833597, 74.3968658],
                  "address": "Dha Phase 1, Lahore, Pakistan"
                },
                "_id": "68891cd5f248a48ed1c301e5",
                "customer_id": "687588a5042653985ad7d152",
                "booking_type": "instant",
                "status": "driver_on_the_way",
                "estimated_distance_to_pickup": 0.0037840576549913784,
                "estimated_time_to_pickup": 0,
                "estimated_distance": 0.5611139628943507,
                "estimated_duration": 1,
                "price": 11.622227925788701,
                "payment_status": "pending",
                "candidate_drivers": ["68835d9f4f0a05cff8431019"],
                "applicant_drivers": ["68835d9f4f0a05cff8431019"],
                "booking_time": "2025-07-29T19:11:17.603Z",
                "createdAt": "2025-07-29T19:11:17.606Z",
                "updatedAt": "2025-07-29T19:11:32.365Z",
                "__v": 1,
                "driver_id": "68835d9f4f0a05cff8431019"
              },
              "driver_id": "68835d9f4f0a05cff8431019",
              "driver": {
                "id": "68835d9f4f0a05cff8431019",
                "name": "Usman",
                "profile_image": "https://royal-ride-bucket.s3.eu-north-1.amazonaws.com/1753439630260_1000352085.jpg",
                "license_no": "1234",
                "vehicle": {}
              }
            };
            
            // Call the handler directly to test
            handleBookingConfirmed(testBookingData);
            console.log('🧪 Test booking confirmed data sent:', testBookingData);
          }}
        />
        <Text style={[styles.socketText, { color: 'blue', marginTop: 10 }]}>
          Drivers Count: {drivers.length}
        </Text>
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#ff5722' }}
          title="Show Drivers Data"
          onPress={() => {
            console.log('📋 Current drivers array:', drivers);
            drivers.forEach((driver, index) => {
              console.log(`Driver ${index + 1}:`, {
                id: driver.id,
                driverId: driver.driverId,
                driverName: driver.driverName,
                vehicleName: driver.vehicleName,
                vehicleModel: driver.vehicleModel,
                vehicleType: driver.vehicleType
              });
            });
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#e91e63' }}
          title="Test Accepted Driver"
          onPress={() => {
            // Manually set an accepted driver for testing
            const testAcceptedDriver = {
              id: "test-driver-123",
              driverId: "test-driver-123",
              driverName: "Test Driver",
              vehicleName: "Test Vehicle",
              vehicleModel: "Test Model",
              vehicleRating: 4.5,
              driverRating: 4.5,
              price: "150",
              currency: "QR",
              vehicleType: "Premium",
              timestamp: new Date().toISOString(),
              status: "available"
            };
            
            setAcceptedDriver(testAcceptedDriver);
            setAcceptedDriverId("test-driver-123");
            console.log('🧪 Test accepted driver set:', testAcceptedDriver);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#9c27b0' }}
          title="Test Socket Data"
          onPress={() => {
            // Simulate the exact socket data structure you mentioned
            const testSocketData = {
              booking_id: "6887f7c4c5ae24d3c6220d4f",
              driver: {
                id: "68835d9f4f0a05cff8431019",
                phone: "9743144226500",
                vehicle: "6856dfb60d8fce10c78b7d8e",
                name: "John Driver", // Added name
                rating: 4.8, // Added rating
                vehicleType: "Premium", // Added vehicleType
                model: "Lexus 600" // Added model
              },
              estimates: {
                price: "150",
                currency: "QR",
                time: "5 minutes"
              }
            };
            
            // Call the handler directly to test
            handleDriverApplied(testSocketData);
            console.log('🧪 Test socket data sent:', testSocketData);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#f44336' }}
          title="Test Cancel Ride"
          onPress={() => {
            console.log('🧪 Testing cancel ride functionality');
            handleCancelRide();
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#4CAF50' }}
          title="Test Driver Location"
          onPress={() => {
            console.log('🧪 Testing driver location update');
            // Simulate driver location update
            const testDriverLocation = {
              latitude: 31.5200,
              longitude: 74.3500,
              driver_id: acceptedDriverId || 'test-driver-123'
            };
            handleDriverLocationUpdate(testDriverLocation);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#FF5722' }}
          title="Test Status Update"
          onPress={() => {
            console.log('🧪 Testing booking status update');
            // Simulate booking status update
            const testStatusUpdate = {
              booking_id: currentBooking?.booking_id || 'test-booking-123',
              status: 'driver_arrived',
              updated_fields: {
                estimated_time_to_pickup: 0
              }
            };
            handleBookingStatusUpdate(testStatusUpdate);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#E91E63' }}
          title="Test Ride Completed"
          onPress={() => {
            console.log('🧪 Testing ride completed status');
            // Simulate ride completed status update
            const testRideCompleted = {
              booking_id: currentBooking?.booking_id || 'test-booking-123',
              status: 'ride_completed',
              updated_fields: {
                completed_at: new Date().toISOString()
              }
            };
            handleBookingStatusUpdate(testRideCompleted);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#9C27B0' }}
          title="Test Completed Status"
          onPress={() => {
            console.log('🧪 Testing completed status');
            // Simulate booking status update with 'completed' status
            const testCompleted = {
              booking_id: currentBooking?.booking_id || 'test-booking-123',
              status: 'completed',
              updated_fields: {
                completed_at: new Date().toISOString()
              }
            };
            handleBookingStatusUpdate(testCompleted);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#FF5722' }}
          title="Emit Status Update"
          onPress={() => {
            console.log('🧪 Emitting bookingStatusUpdate event via socket');
            // Emit the event via socket to test if it's received
            emitEvent('bookingStatusUpdate', {
              booking_id: currentBooking?.booking_id || 'test-booking-123',
              status: 'completed',
              updated_fields: {
                completed_at: new Date().toISOString()
              }
            });
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#FF9800' }}
          title="Show Redux Booking"
          onPress={() => {
            console.log('📋 Current booking in Redux:', currentBooking);
            if (currentBooking) {
              console.log('🔑 Booking ID:', currentBooking.booking_id);
              console.log('👤 Driver ID:', currentBooking.driver_id);
              console.log('🚗 Driver Name:', currentBooking.driver?.name);
              console.log('📍 Pickup Address:', currentBooking.booking?.pickup_location?.address);
              console.log('🎯 Dropoff Address:', currentBooking.booking?.dropoff_location?.address);
              console.log('💰 Price:', currentBooking.booking?.price);
              console.log('📊 Status:', currentBooking.booking?.status);
              console.log('⏰ Estimated Duration:', currentBooking.booking?.estimated_duration);
              console.log('📏 Estimated Distance:', currentBooking.booking?.estimated_distance);
              console.log('🗺️ Pickup Coordinates:', currentBooking.booking?.pickup_location?.coordinates);
              console.log('🗺️ Dropoff Coordinates:', currentBooking.booking?.dropoff_location?.coordinates);
            } else {
              console.log('❌ No current booking in Redux');
            }
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#4CAF50' }}
          title="Test Directions"
          onPress={() => {
            console.log('🧪 Testing directions functionality');
            console.log('📍 Current Location:', currentLocation);
            console.log('🚗 Driver Location:', driverLocation);
            console.log('📋 Booking Data:', currentBooking?.booking?.pickup_location?.coordinates);
            console.log('🎯 Has Pickup:', !!currentBooking?.booking?.pickup_location?.coordinates);
            console.log('🎯 Has Dropoff:', !!currentBooking?.booking?.dropoff_location?.coordinates);
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#4caf50' }}
          title="Test Create Booking"
          onPress={async () => {
            console.log('🧪 Testing create booking API');
            try {
              const bookingData = {
                pickup_location: {
                  latitude: 31.4926,
                  longitude: 74.3925,
                  address: "Test Pickup Location"
                },
                destination_location: {
                  latitude: 31.6018,
                  longitude: 74.3206,
                  address: "Test Destination"
                },
                ride_type: "premium",
                payment_method: "card"
              };
              const result = await createBooking(bookingData);
              console.log('✅ Test booking created:', result);
            } catch (error) {
              console.error('❌ Test booking failed:', error);
            }
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#2196f3' }}
          title="Test Get Drivers"
          onPress={async () => {
            console.log('🧪 Testing get drivers API');
            try {
              const result = await getDrivers();
              console.log('✅ Test drivers fetched:', result);
            } catch (error) {
              console.error('❌ Test get drivers failed:', error);
            }
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#ff9800' }}
          title="Test Get Profile"
          onPress={async () => {
            console.log('🧪 Testing get user profile API');
            try {
              const result = await getUserProfile();
              console.log('✅ Test profile fetched:', result);
            } catch (error) {
              console.error('❌ Test get profile failed:', error);
            }
          }}
        />
        <AppButton
          style={{ ...styles.socketButton, backgroundColor: '#9c27b0' }}
          title="Test Get Wallet"
          onPress={async () => {
            console.log('🧪 Testing get wallet balance API');
            try {
              const result = await getWalletBalance();
              console.log('✅ Test wallet balance fetched:', result);
            } catch (error) {
              console.error('❌ Test get wallet failed:', error);
            }
          }}
        />
      </View> */}

                    {/* Plan Trip Cards */}
                {/* {from === 'plan' && ( */}
               {currentBooking && (
                 <RideInfoCard
                   driverName={currentBooking?.driver?.vehicle?.make|| "Unknown Driver"}
                   driverRating={acceptedDriver?.driverRating || 4.5}
                   carColor={currentBooking?.driver?.vehicle?.color || "Standard"}
                   carModel={currentBooking?.driver?.vehicle?.model || "Unknown"}
                   licensePlate={currentBooking?.driver?.vehicle?.license_plate || "Unknown"}
                   onCallPress={() => console.log('Call pressed for:', acceptedDriver.driverName)}
                   onMessagePress={handleChat}
                   onShowDetailsPress={() => console.log('Show details pressed for:', acceptedDriver.driverName)}
                   style={{ 
                     position: 'absolute', 
                     bottom: Math.max(90, insets.bottom + 80), // Account for bottom navigation
                     width: screenWidth * 0.92, 
                     zIndex: 1000 
                   }}
                   carImage={currentBooking?.driver?.vehicle?.vehicle_pictures[0]}
                   profileImage={currentBooking?.driver?.profile_image}
                   carDriverName={currentBooking?.driver?.name}
                                       currentLocation={currentBooking?.booking?.pickup_location?.address}
                    officeLocation={currentBooking?.booking?.dropoff_location?.address}
                    estimatedTime={currentBooking?.booking?.estimated_duration?.toString()}
                    distance={currentBooking?.booking?.estimated_distance?.toString()}
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

      {/* Cancel Ride Button */}
      <AppButton
        style={{
          ...styles.cancelButton,
          bottom: Math.max(20, insets.bottom + 10), // Use safe area bottom + 10px padding
        }}
        variant="secondary"
        title={ t('cancel_ride')}
        onPress={handleCancelRide}
        loading={isCancelling}
        disabled={isCancelling}
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