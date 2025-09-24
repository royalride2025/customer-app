import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Dimensions, StyleSheet, Alert, Text, Platform, Modal, TouchableOpacity, Image, Linking, ActivityIndicator, Modal as RNModal, } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Svg from '../../lib/svg';
import { check, locationPin, carIcon, bookingIcon } from '../../../assets/svgAssets';
import { StyleGuide } from '../../../StyleGuide';
import { screenHeight } from '../../utils/dimenstions';
import HomeDashBoard from './components/homeDashBoard';
import { DrawerActions, useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/stackNavigation';
import type { BottomTabParamList } from '../../navigation/bottomTabsNavigator';
import { useAppDispatch, useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import socketService from '../../services/socket';
import AppButton from '../../lib/component/AppButton';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import { setProfile } from '../../redux/profileSlice';
import Toast from 'react-native-toast-message';
const logo = require('../../../assets/images/logo.png')

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [region, setRegion] = useState<{latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number} | null>(null);
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]); // Stores fetched addresses
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'enabled' | 'disabled' | 'checking'>('checking');
  const [showLocationLoader, setShowLocationLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList & BottomTabParamList>>()
  const mapRef = useRef<MapView>(null);
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const user = useAppSelector((state: RootState) => state?.auth?.user);
  const currentBooking = useAppSelector((state: RootState) => state.booking.currentBooking);
  const dispatch = useAppDispatch();

  const profile = useAppSelector((state: RootState) => state.profile.data);
  console.log('profile========/////////', profile);

  // Set default location to Qatar (Doha) or get current location if possible
  const setDefaultLocation = useCallback(() => {
    // Try to get current location first
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Got current location on init:', position.coords);
        const currentRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(currentRegion);
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
        setLocationPermissionChecked(true);
        // Smoothly animate to the initial region when available
        if (mapRef.current) {
          mapRef.current.animateToRegion(currentRegion, 600);
        }
        console.log('🗺️ Set initial region to current location');
      },
      (error) => {
        console.log('❌ Could not get current location:', error.message);
        // Don't set hardcoded location, just show loading state
        setIsLoading(false);
        setLocationPermissionChecked(true);
        console.log('🗺️ Location unavailable, map will show loading state');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  // Initialize with default location
  useEffect(() => {
    setDefaultLocation();
  }, [setDefaultLocation]);

  useEffect(() => {
    console.log('Current user:', user);
    fetchProfile();
    if (user?.id) {
      fetchUpcomingBookings();
    }
  }, [user?.id]); // Consider adding fetchProfile to dependencies

  const fetchProfile = useCallback(async () => {
    try {
      const response = await networkClient.get(API_ENDPOINTS.GET_PROFILE);

      console.log('response========/////////', response);

      if (response.data && response.data?.data) {
        console.log('Profile data:', response.data);

        dispatch(setProfile({
          user: response.data.data.user,
          profile: response.data.data.profile
        })
        )
        // TODO: Set profile data to state
        // setProfile(response.data.profile); // or whatever your state setter is
      } else {
        console.log('API returned success: false');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  const fetchUpcomingBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_CUSTOMER_BOOKINGS(user?.id)}`);
      if (response && response.data && response.data?.data) {
        setUpcomingBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    }
  }, [user?.id]);

  // Fetch upcoming bookings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchUpcomingBookings();
      }
    }, [user?.id, fetchUpcomingBookings])
  );

  console.log("current====", currentLocation)

  useEffect(() => {
    const checkLocationServicesEnabled = () => {
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            if (error.code === 2) { // POSITION_UNAVAILABLE
              resolve(false);
            } else {
              resolve(true);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 3000,
            maximumAge: 0
          }
        );
      });
    };

    const handleLocationServicesDisabled = async () => {
      if (Platform.OS === 'android') {
        try {
          console.log('Showing Android location services dialog...');
          // For now, just show manual settings
          showManualSettingsAlert();
        } catch (error) {
          console.log('Error with location services dialog:', error);
          // Fallback to manual settings
          showManualSettingsAlert();
        }
      } else {
        // iOS - show manual settings alert
        showManualSettingsAlert();
      }
    };

    const showManualSettingsAlert = () => {
      setShowGPSModal(true);
    };
    console.log('showw', showGPSModal)
    const checkLocationAfterSettings = async () => {
      const isEnabled = await checkLocationServicesEnabled();

      if (isEnabled) {
        console.log('Location services now enabled, requesting permission...');
        await requestAppLocationPermission();
      } else {
        setShowGPSModal(true);
      }
    };

    const requestAppLocationPermission = async () => {
      try {
        let permission;
        if (Platform.OS === 'ios') {
          permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        } else {
          permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        }

        const result = await request(permission);
        console.log('App location permission result:', result);

        if (result === RESULTS.GRANTED) {
          console.log('App permission granted, getting location...');
          getLocationWithFallback();
        } else {
          handlePermissionDenied(result);
        }
      } catch (error) {
        console.log('App permission error:', error);
        setDefaultLocation();
      }
    };

    const requestLocationPermission = async () => {
      try {
        // Step 1: Check if location services are enabled
        const locationServicesEnabled = await checkLocationServicesEnabled();

        if (!locationServicesEnabled) {
          console.log('Location services are disabled, handling...');
          await handleLocationServicesDisabled();
          return;
        }

        // Step 2: Location services are enabled, request app permission
        console.log('Location services are enabled, requesting app permission...');
        await requestAppLocationPermission();

      } catch (error) {
        console.log('Location setup error:', error);
        setDefaultLocation();
      }
    };

    const getLocationWithFallback = () => {
      console.log('Attempting high accuracy location...');

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('High accuracy location success:', position);
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermissionChecked(true);
        },
        (error) => {
          console.log('High accuracy failed, trying low accuracy...', error);
          getLowAccuracyLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    };

    const getLowAccuracyLocation = () => {
      console.log('Attempting low accuracy location...');

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Low accuracy location success:', position);
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermissionChecked(true);
        },
        (error) => {
          console.log('Low accuracy also failed, trying cached location...', error);
          getCachedLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    };

    const getCachedLocation = () => {
      console.log('Attempting cached location...');

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Cached location success:', position);
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermissionChecked(true);
        },
        (error) => {
          console.log('All location attempts failed:', error);
          handleLocationError(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 600000,
        }
      );
    };

    const handleLocationError = (error: any) => {
      if (error.code === 2) { // POSITION_UNAVAILABLE
        setShowGPSModal(true);
      } else {
        // For other errors, show custom modal instead of alert
        setShowGPSModal(true);
      }
    };

    const handlePermissionDenied = (result: any) => {
      console.log('App permission not granted:', result);
      setShowGPSModal(true);
    };

    // Start the location setup process
    requestLocationPermission();
  }, [navigation]);
  // const requestLocationPermission = async () => {
  //   try {
  //     let permission;

  //     if (Platform.OS === 'ios') {
  //       permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  //     } else {
  //       permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  //     }

  //     const result = await request(permission);

  //     if (result === RESULTS.GRANTED) {
  //       getCurrentLocation();
  //     } else {
  //       Alert.alert('Permission Denied', 'Location permission is required to show your current location');
  //       // Set default location if permission denied
  //       setDefaultLocation();
  //     }
  //   } catch (error) {
  //     console.log('Permission request error:', error);
  //     setDefaultLocation();
  //   }
  // };
  useEffect(() => {
    // Don't set up socket until location permission is checked AND user exists
    if (!locationPermissionChecked || !user || !user.role) {
      console.log('⏳ Waiting for location permission and user before socket setup...');
      console.log(`- User: ${user ? 'Available' : 'Not Available'}`);
      console.log(`- Location Permission: ${locationPermissionChecked ? 'Checked' : 'Checking...'}`);
      return;
    }

    console.log('🔌 Setting up socket listeners and connection...');

    // Socket connection events
    const handleConnect = () => {
      console.log('✅ Socket connected:', socketService.getSocketId());
      setSocketConnected(true);

      // Auto-register when connected (with small delay to ensure socket is ready)
      setTimeout(() => {
        if (user && user.role) {
          const userId = user.id;
          socketService.emit('register', {
            userId: userId,
            userType: user.role
          });
          console.log('🔐 Auto-registered socket:', { userId, userType: user.role });
        }
      }, 100);
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setSocketConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.log('🚫 Socket connection error:', error);
      console.log('🚫 Error details:', JSON.stringify(error, null, 2));
      setSocketConnected(false);

      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying socket connection...');
        if (!socketService.isConnected()) {
          socketService.connect();
        }
      }, 5000);
    };

    // Add all event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);

    // Initial connection attempt
    if (!socketService.isConnected()) {
      console.log('🚀 Initiating socket connection...');
      socketService.connect();
    } else {
      // If already connected, trigger the connect handler
      handleConnect();
    }

    // Update connection status
    setSocketConnected(socketService.isConnected());

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);

    };
  }, [user, locationPermissionChecked]); // Wait for both user and location permission
  useEffect(() => {
    const checkGPSStatus = () => {
      console.log('🔍 Checking GPS status...');
      Geolocation.getCurrentPosition(
        (position) => {
          // GPS is working
          console.log('✅ GPS status check: Enabled - Hiding modal');
          setGpsStatus('enabled');
          setShowGPSModal(false);
          setShowLocationLoader(false);
        },
        (error) => {
          console.log('❌ GPS status check failed:', error.code, error.message);
          if (error.code === 2) { // POSITION_UNAVAILABLE
            setGpsStatus('disabled');
            setShowGPSModal(true);
            console.log('❌ GPS status check: Disabled - Showing modal');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    // Check GPS status every 1 second when modal is shown
    let intervalId: NodeJS.Timeout;
    if (showGPSModal) {
      console.log('🔄 Starting GPS status checker...');
      intervalId = setInterval(checkGPSStatus, 1000);
      // Also check immediately
      checkGPSStatus();
    }

    return () => {
      if (intervalId) {
        console.log('🛑 Stopping GPS status checker...');
        clearInterval(intervalId);
      }
    };
  }, [showGPSModal]);

  // Monitor GPS changes during app usage
  useEffect(() => {
    const monitorGPSChanges = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          // GPS is working - ensure modal is hidden
          if (showGPSModal) {
            console.log('✅ GPS detected during app usage - hiding modal');
            setShowGPSModal(false);
            setShowLocationLoader(false);
            setGpsStatus('enabled');
          }
        },
        (error) => {
          if (error.code === 2) { // POSITION_UNAVAILABLE
            console.log('🚨 GPS turned off during app usage - showing modal');
            setShowGPSModal(true);
            setGpsStatus('disabled');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 0
        }
      );
    };

    // Monitor GPS every 3 seconds during app usage
    const intervalId = setInterval(monitorGPSChanges, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [showGPSModal]);

  // GPS Modal handlers
  const handleEnableGPS = async () => {
    setShowLocationLoader(true);
    if (Platform.OS === 'android') {
      try {
        const result = await LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "Your location services are disabled. Please enable them to use location features.",
          ok: "ENABLE",
          cancel: "CANCEL",
          enableHighAccuracy: true,
          showDialog: true,
          openLocationServices: true,
          preventOutSideTouch: false,
          preventBackClick: false,
          providerListener: true
        });

        if (result && (result.status === "enabled" || result.alreadyEnabled)) {
          console.log('Location services enabled via dialog');
          // Don't hide modal immediately, let the GPS checker handle it
          setTimeout(() => {
            setShowLocationLoader(false);
          }, 2000);
        } else {
          console.log('User declined to enable location services');
          setShowLocationLoader(false);
          setShowGPSModal(true);
        }
      } catch (error) {
        console.log('Error with location services dialog:', error);
        handleOpenSettings();
      }
    } else {
      handleOpenSettings();
    }
  };

  const handleOpenSettings = () => {
    setShowLocationLoader(true);
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:Privacy&path=LOCATION');
    } else {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    }
    // Don't hide loader immediately, let the GPS checker handle it
    setTimeout(() => {
      setShowLocationLoader(false);
    }, 3000);
  };

  const handleRetryGPS = () => {
    setShowLocationLoader(true);
    // Force a GPS check immediately
    Geolocation.getCurrentPosition(
      (position) => {
        setGpsStatus('enabled');
        setShowGPSModal(false);
        setShowLocationLoader(false);
        console.log('✅ GPS retry successful');
      },
      (error) => {
        if (error.code === 2) {
          setGpsStatus('disabled');
          setShowGPSModal(true);
          setShowLocationLoader(false);
          console.log('❌ GPS retry failed');
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleContinueAnyway = () => {
    setShowGPSModal(false);
    // Don't set hardcoded location, let user handle it manually
    console.log('User chose to continue without location');
  };

  // Check GPS status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 Screen focused - checking GPS status...');

      const checkGPSOnFocus = () => {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ GPS is enabled on screen focus');
            setGpsStatus('enabled');
            setShowGPSModal(false);
            setShowLocationLoader(false);
          },
          (error) => {
            console.log('❌ GPS check failed on screen focus:', error.code);
            if (error.code === 2) { // POSITION_UNAVAILABLE
              console.log('🚨 GPS is disabled - showing modal');
              setGpsStatus('disabled');
              setShowGPSModal(true);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
          }
        );
      };

      // Check GPS immediately when screen is focused
      checkGPSOnFocus();

      // Also check after a short delay to ensure settings changes are detected
      const timeoutId = setTimeout(() => {
        checkGPSOnFocus();
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [])
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const getCurrentLocation = () => {
    // Prevent multiple simultaneous location requests
    if (showLocationLoader) {
      console.log('Location request already in progress, skipping...');
      return;
    }

    setShowLocationLoader(true);

    try {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained successfully:', position.coords);
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
          // Animate to the fetched region for immediate feedback
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 600);
          }
          setShowLocationLoader(false);
        },
        (error) => {
          console.log('Location error:', error);
          console.log('Error code:', error.code);
          console.log('Error message:', error.message);

          // Handle specific error codes
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              console.log('Location permission denied');
              setShowGPSModal(true);
              break;
            case 2: // POSITION_UNAVAILABLE
              console.log('Location unavailable');
              // Don't set hardcoded location, just show error
              break;
            case 3: // TIMEOUT
              console.log('Location request timed out');
              // Don't set hardcoded location, just show error
              break;
            default:
              console.log('Unknown location error');
              // Don't set hardcoded location, just show error
              break;
          }
          setShowLocationLoader(false);
        },
        {
          enableHighAccuracy: false, // Changed to false to reduce timeout issues
          timeout: 15000, // Reduced timeout
          maximumAge: 300000, // 5 minutes cache
          distanceFilter: 10,
        }
      );
    } catch (error) {
      console.log('Exception in getCurrentLocation:', error);
      // Don't set hardcoded location, just log error
      setShowLocationLoader(false);
    }
  };

  const userLocationfind = (lat: number, lng: number) => {
    // Add your location finding logic here
    console.log('User location updated:', lat, lng);
  };

  const handleMarkerDragEnd = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    userLocationfind(coordinate.latitude, coordinate.longitude);
    setCurrentLocation(coordinate);
  };

 
  useFocusEffect(
    React.useCallback(() => {
      fetchAddress();
      return () => {};
    }, [])
  );
console.log('addressState',addresses)
const handleDeleteAddress = (addressId: string) => {
  // Show confirmation alert before deleting
  Alert.alert(
    'Confirm Deletion',
    'Are you sure you want to delete this address?',
    [
      {
        text: 'Cancel',
        style: 'cancel', // Cancel action
      },
      {
        text: 'Delete',
        style: 'destructive', // Destructive action style
        onPress: async () => {
          try {
            // setLoading(true);
            // Delete address API call
            const response = await networkClient.delete(`${API_ENDPOINTS.DELET_ADDRESS(addressId)}`);
            if (response.data) {
              Toast.show({
                type: 'success',
                text1: 'Address Deleted',
                text2: 'The address has been successfully deleted.',
              });
              // Remove deleted address from state
              setAddresses((prev) => prev.filter((address) => address.id !== addressId));
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete the address.',
              });
            }
          } catch (error) {
            console.log(error)
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete the address.',
            });
          } finally {
            fetchAddress()
          }
        },
      },
    ],
    { cancelable: false }
  );
};

  const fetchAddress = async () => {
    setAddressLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_ADDRESS_LIST}`);

      console.log('fetch address',response)
      if (response && response.data) {
        setAddresses(response?.data?.addresses);  // Assuming "data" contains the request data
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setAddressLoading(false);
    }
  };
  console.log('upcomingBookings========/////////', upcomingBookings);
  return (
    <View style={styles.container}>
      {/* <View style={{ marginBottom: 12 }}>
        <Text style={{ 
          fontSize: 12, 
          color: socketConnected ? '#2e7d32' : '#d32f2f',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Socket: {socketConnected ? `🟢 Connected (${socketService.getSocketId()})` : '🔴 Disconnected'}
        </Text>
        <AppButton
          title="Register Socket"
          onPress={handleManualSocketRegister}
          style={{ marginBottom: 8 }}
        />
      </View> */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region || undefined}
        region={region || undefined}
        zoomEnabled={true}
        showsMyLocationButton={false}
        maxZoomLevel={20}
        minZoomLevel={8}
        showsUserLocation={false} // We'll use custom marker instead
        mapType="standard"
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            tracksViewChanges={true}
            onDragEnd={handleMarkerDragEnd}
            draggable={true}
            title="Your Location"
            description="Drag to update location"
          >
            <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
          </Marker>
        )}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.currentLocationButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Floating Car Button */}
      {(() => {
        const currentTime = new Date();
        const validBookings = upcomingBookings.filter((booking: any) => {
          const bookingTime = new Date(booking.start_time);
          return bookingTime <= currentTime;
        });
        
        if (validBookings.length > 0) {
          return (
            <TouchableOpacity
              style={styles.floatingCarButton}
              onPress={() => {
                if (currentBooking) {
                  // If there's a current booking, navigate directly to map
                  navigation.navigate('map');
                } else {
                  // If no booking, go to Activities screen
                  navigation.navigate('Activities', { activeTabfromHome: 'upcoming' });
                }
              }}
              activeOpacity={0.8}
            >
              <Svg xml={bookingIcon} rest={{ height: 24, width: 24 }} />
              {/* Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{validBookings.length}</Text>
              </View>
            </TouchableOpacity>
          );
        }
        return null;
      })()}

      <View style={styles.bottomContent}>
        <HomeDashBoard
          userName={profile?.profile?.name}
          greeting="Good afternoon"
          onTripPress={() => {
            if (currentBooking) {
              // If there's a current booking, navigate directly to map
              navigation.navigate('map', { from: 'plan', booking: currentBooking });
            } else {
              // If no booking, go to makeTrip screen
              navigation.navigate('makeTrip');
            }
          }}
          onDeletePress={handleDeleteAddress}
          onRentPress={() => navigation.navigate('rentRide')}
          onBookPress={() => navigation.navigate('bookRide')}
          onAirportPress={() => navigation.navigate('airportTransfer')}
          address={addresses?.length>0&&addresses}
          onProfilePress={openDrawer}
          onLocationPress={(item) => console.log("Location clicked:", item)}
          isRTL={isRTL}
        />

        <RNModal
          visible={showGPSModal}
          transparent
          animationType="fade"
          onRequestClose={() => { }} // Prevent closing with back button
        >
          <View style={styles.modalOverlay}>
            <View style={styles.gpsModalContent}>
              <View style={styles.gpsIconContainer}>
                <Text style={styles.gpsIcon}>📍</Text>
              </View>
              <Text style={styles.gpsModalTitle}>GPS is Turned Off</Text>
              <Text style={styles.gpsModalMessage}>
                Location services are required for this app to work properly. Please enable GPS to continue.
              </Text>
              <View style={styles.gpsModalButtons}>
                <AppButton
                  title="Enable GPS"
                  onPress={handleOpenSettings}
                  style={{ flex: 1, marginRight: 8 }}
                />

              </View>
            </View>
          </View>
        </RNModal>

        {/* Location Loader Modal - Global */}
        <RNModal
          visible={showLocationLoader}
          transparent
          animationType="fade"
          onRequestClose={() => { }} // Prevent closing
        >
          <View style={styles.modalOverlay}>
            <View style={styles.loaderModalContent}>
              <View style={styles.loaderContainer}>
                <Text style={styles.loaderIcon}>🔄</Text>
              </View>
              <Text style={styles.loaderTitle}>Getting Location...</Text>
              <Text style={styles.loaderMessage}>
                Please wait while we detect your location. This may take a few seconds.
              </Text>
            </View>
          </View>
        </RNModal>
        {/* <View style={styles.header}>
        <Image
          source={logo}
          style={{width:130,height:100}}
          resizeMode="contain"
        />
        </View>
        <Text style={styles.chooseLocationText}>Choose your location to start finding requests around you</Text>
       <AppButton title='Use my Loacation'/>
       <AppButton variant='secondary' title='Skip for Now'/> */}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  bottomContent: {
    // flex: 1, // Takes remaining space
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: StyleGuide.color.backgroundColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,

    // alignSelf: 'stretch',

  },

  modalText: {
    color: 'black',
    fontSize: 18,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: screenHeight * 0.03,
  },
  chooseLocationText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.regular,
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,

  },
  gpsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  gpsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsIcon: {
    fontSize: 40,
  },
  gpsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: StyleGuide.color.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  gpsModalMessage: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  gpsModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  loaderModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  loaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loaderIcon: {
    fontSize: 40,
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: StyleGuide.color.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  loaderMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  currentLocationButton: {
    position: 'absolute',
    top: 20, // Position from top instead of bottom
    right: 20,
    backgroundColor: StyleGuide.color.white,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingCarButton: {
    position: 'absolute',
    bottom: 120, // Position above the bottom content
    right: 20,
    backgroundColor: StyleGuide.color.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4757',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: StyleGuide.color.white,
  },
  badgeText: {
    color: StyleGuide.color.white,
    fontSize: 10,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  currentLocationButtonText: {
    fontSize: 18,
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default Home;
