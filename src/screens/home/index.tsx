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
const logo=require('../../../assets/images/logo.png')

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
const navigation=useNavigation()
const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

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

  const requestLocationPermission = async () => {
    try {
      let permission;
      
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to show your current location');
        // Set default location if permission denied
        setDefaultLocation();
      }
    } catch (error) {
      console.log('Permission request error:', error);
      setDefaultLocation();
    }
  };

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
        Alert.alert('Error', 'Unable to fetch location. Using default location.');
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

  if (!region || !currentLocation) {
    return (
      <View style={styles.loading}>
        <Text>Loading your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  onTripPress={() =>navigation.navigate('makeTrip') }
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
