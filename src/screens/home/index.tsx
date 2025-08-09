import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Alert, Text, Platform, Modal, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Svg from '../../lib/svg';
import { check, locationPin } from '../../../assets/svgAssets';
import { StyleGuide } from '../../../StyleGuide';
import { screenHeight } from '../../utils/dimenstions';
import HomeDashBoard from './components/homeDashBoard';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import socketService from '../../services/socket';
import AppButton from '../../lib/component/AppButton';
const logo=require('../../../assets/images/logo.png')

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

const navigation=useNavigation()
const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
const user = useAppSelector((state: RootState) => state?.auth?.user);
const currentBooking = useAppSelector((state: RootState) => state.booking.currentBooking);
  useEffect(() => {
    // Directly set hardcoded location instead of requesting permissions
    const hardcodedRegion = {
      latitude: 31.4926,
      longitude: 74.3925,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(hardcodedRegion);
    setCurrentLocation({
      latitude: 31.4926,
      longitude: 74.3925,
    });
  }, []);


  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        let permission;
        if (Platform.OS === 'ios') {
          permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        } else {
          permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        }
        
        const result = await request(permission);
        console.log('Location permission result:', result);
        
        if (result === RESULTS.GRANTED) {
          console.log('Permission granted, getting location...');
          getLocationWithFallback();
        } else {
          handlePermissionDenied(result);
        }
      } catch (error) {
        console.log('Location permission error:', error);
        // Alert.alert('Error', 'Unable to request location permission. Using default location.');
        setDefaultLocation();
      }
    };
  
    const getLocationWithFallback = () => {
      // First attempt: High accuracy with longer timeout
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
          // Fallback: Low accuracy with shorter timeout
          getLowAccuracyLocation();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, // 15 seconds for high accuracy
          maximumAge: 30000, // Accept cached location up to 30 seconds old
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
          // Final fallback: Try with very old cached data
          getCachedLocation();
        },
        { 
          enableHighAccuracy: false, // Use network/cell tower location
          timeout: 10000, // 10 seconds for low accuracy
          maximumAge: 300000, // Accept cached location up to 5 minutes old
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
          timeout: 5000, // Very short timeout
          maximumAge: 600000, // Accept very old cached data (10 minutes)
        }
      );
    };
  
    const handleLocationError = (error) => {
      let errorMessage = 'Unable to get your location. ';
      let showRetry = false;
      
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage += 'Location permission was denied.';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage += 'Location services are unavailable. Please check your GPS settings.';
          showRetry = true;
          break;
        case 3: // TIMEOUT
          errorMessage += 'Location request timed out. This may happen indoors or in areas with poor GPS signal.';
          showRetry = true;
          break;
        default:
          errorMessage += `Unknown error (code: ${error.code}).`;
          showRetry = true;
          break;
      }
      
      if (showRetry) {
        console.log(
          'Location Timeout', 
          errorMessage + ' Would you like to try again or use default location?',
          [
            { 
              text: 'Try Again', 
              onPress: () => getLocationWithFallback() 
            },
            { 
              text: 'Use Default', 
              onPress: () => setDefaultLocation() 
            }
          ]
        );
      } else {
        console.log('Location Error', errorMessage + ' Using default location.');
        setDefaultLocation();
      }
    };
  
    const handlePermissionDenied = (result) => {
      let message = 'Location permission is required. Using default location.';
      
      if (result === RESULTS.DENIED) {
        message = 'Location permission was denied. You can enable it later in settings.';
      } else if (result === RESULTS.BLOCKED) {
        message = 'Location permission is blocked. Please enable it in device settings.';
      } else if (result === RESULTS.UNAVAILABLE) {
        message = 'Location services are not available on this device.';
      }
      
      console.log('Permission not granted:', result);
      console.log('Permission Required', message);
      setDefaultLocation();
    };
  
    const setDefaultLocation = () => {
      // Set your default location here (replace with your preferred default coordinates)
      const defaultCoords = {
        latitude: 37.7749, // San Francisco as example
        longitude: -122.4194,
      };
      
      console.log('Setting default location:', defaultCoords);
      setCurrentLocation(defaultCoords);
      setLocationPermissionChecked(true);
    };
  
    requestLocationPermission();
  }, []);
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

  const setDefaultLocation = () => {
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
  };
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const getCurrentLocation = () => {
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
  };

  const userLocationfind = (lat, lng) => {
    // Add your location finding logic here
    console.log('User location updated:', lat, lng);
  };

  const handleMarkerDragEnd = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    userLocationfind(coordinate.latitude, coordinate.longitude);
    setCurrentLocation(coordinate);
  };

  if (!locationPermissionChecked) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text>Checking location permission...</Text>
        <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          Socket setup will begin after permission check
        </Text>
      </View>
    );
  }
  const handleManualSocketRegister = () => {
    if (user && user.role) {
      const userId = user.id;
      socketService.emit('register', { 
        userId: userId, 
        userType: user.role 
      });
      Alert.alert(
        'Socket Registered', 
        `UserId: ${userId}\nUserType: ${user.role}\nConnected: ${socketConnected ? 'Yes' : 'No'}\nSocket ID: ${socketService.getSocketId() || 'None'}`
      );
    } else {
      Alert.alert('User not found', 'Cannot register socket without user info.');
    }
  };

  console.log('user========/////////', user);
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
      
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
        zoomEnabled={true}
        showsMyLocationButton={false}
        maxZoomLevel={20}
        minZoomLevel={3}
        showsUserLocation={true} // This will show the blue dot for current location
        mapType="standard"
      >
        <Marker
          coordinate={currentLocation}
          tracksViewChanges={false} // Set to false for better performance
          onDragEnd={handleMarkerDragEnd}
          draggable={true}
          title="Your Location"
          description="Drag to update location"
        >
          <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
        </Marker>
      </MapView>

      <View style={styles.bottomContent}>
      <HomeDashBoard
  userName="Usman Virk"
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
  onRentPress={() => navigation.navigate('rentRide') }
  onBookPress={() => navigation.navigate('bookRide')}
  onAirportPress={() => navigation.navigate('airportTransfer')}
  onProfilePress={openDrawer}
  onLocationPress={(item) => console.log("Location clicked:", item)}
  isRTL={isRTL}
/>
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
    paddingVertical:15,
    backgroundColor: StyleGuide.color.backgroundColor,
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
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
  chooseLocationText:{
    fontSize:16,
    fontFamily:StyleGuide.fontFamily.regular,
    textAlign:'center',
    marginBottom: screenHeight * 0.02, 

  },
 
});

export default Home;
