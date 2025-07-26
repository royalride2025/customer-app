import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Svg from '../../lib/svg';
import { atmCard, carSvg, locationPin, rightIcon } from '../../../assets/svgAssets';
import Geolocation from '@react-native-community/geolocation';
import TripCard from '../home/makeTrip/component/tripCard';
import { StyleGuide } from '../../../StyleGuide';
import { screenWidth } from '../../utils/dimenstions';
import AppButton from '../../lib/component/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute hook from react-navigation
import BottomModal from '../../lib/component/BottomModal';
import RideCard from './components/rideCard';
import PaymentMethods from './components/paymentCard';
import RideInfoCard from './components/rideInfoCard';
import TimeStatusCard from './components/timeStatusCard';
import { t } from 'i18next';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';

const car = require('../../../assets/images/halfCar.png')


const routeCoordinates = [
  {
    latitude: 31.4926,
    longitude: 74.3925,
  },
  { latitude: 31.6018, longitude: 74.3206 }, // Start point

];

const destination = { latitude: 31.6018, longitude: 74.3206 };

const Map = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedRide, setSelectedRide] = useState(1);
  const [isModalVisible, setModalVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

const navigation=useNavigation()
const { flexDirection } = useTranslationStyles();
const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
const {booking}:any=useRoute().params
console.log(booking, "booking=====")


const handleChat=()=>{
  navigation.navigate('customerChat')
}
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  }
  const handleRideSelect = (rideId: number) => {
    // Update the selected ride
    setSelectedRide(rideId);
    console.log('Selected ride:', rideId);
  };
  const route = useRoute(); // Get the current route
  const { from } = route.params;
  console.log('from', from)

  useEffect(() => {
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

  const handleMarkerDragEnd = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setCurrentLocation(coordinate);
  };

  if (!region || !currentLocation) {
    return (
      <View style={styles.loading}>
        <Text>Loading your location...</Text>
      </View>
    );
  }

  const handleAccept = () => {
    console.log('Ride accepted!');
    // Add your accept logic here
  };

  const handleReject = () => {
    console.log('Ride rejected!');
    // Add your reject logic here
  };
  const handlePaymentStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2); // Move to the next step (payment method)
    }
  };
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

      {from === 'plan' && (
        <>
          <FlatList
            data={cardData}
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
                onAccept={handleAccept}
                onReject={handleReject}
              />
            )}
            style={styles.overlayContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* The "Cancel the Ride" button */}
          {/* <AppButton
            style={{
              marginHorizontal: 20,
              position: 'absolute',
              width: '90%',
              bottom: 20,
              zIndex: 1
              // alignSelf: 'center',
            }}
            variant="secondary"
            title="Cancel the Ride"
            onPress={() => { }}
          /> */}
        </>
      )}
      <AppButton
        style={{
          marginHorizontal: 20,
          position: 'absolute',
          width: '90%',
          bottom: 20,
          zIndex: 1
          // alignSelf: 'center',
        }}
        variant="secondary"
        title={t('cancel_ride')}
        onPress={() => { }}
      />
      {from === 'bookRide' && (
        <BottomModal showHandle={true} isVisible={isModalVisible} onClose={toggleModal}>
          <View style={{ justifyContent: 'center', paddingTop: 5, paddingBottom: 15, borderBottomWidth: 0.5, marginBottom: 15, borderBottomColor: StyleGuide.color.lightGrey, flexDirection: 'row' }}>
            {currentStep === 2 && (
              <Pressable onPress={() => setCurrentStep(1)} style={{
                position: 'absolute',
                left: 0,
                top: 7,
              }}>
                <Svg
                  xml={rightIcon}
                  rest={{
                    height: 24,
                    width: 24,
                    marginRight: 10,
                    // Adds some space between the icon and text
                    transform: [{ rotate: '180deg' }] // Rotates the icon by 180 degrees
                  }}
                />
              </Pressable>


            )}
            <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: StyleGuide.fontFamily.bold }} >{currentStep === 1 ?t("choose_ride"): t("payment_method")}</Text>
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
              <Pressable onPress={handlePaymentStep} style={[styles.paymentButton,flexDirection]}>
                <View style={[{alignItems: 'center' },flexDirection]}>

                  <Svg xml={atmCard} rest={{ height: 24, width: 30 }} />
                  <Text style={[styles.paymentText,isRTL?{paddingRight:10}:{paddingLeft:10}]}>{t('card_payment')}</Text>
                </View>
                <Svg xml={rightIcon} rest={{ height: 18, width: 18,transform: [{ rotate: '180deg' }] }} />
              </Pressable>
            </>
          )}
          {currentStep === 2 && (
            <PaymentMethods />
          )}
          <AppButton title={t("next")} />
        </BottomModal>
      )}
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        zoomEnabled={true}
        showsMyLocationButton={false}
        maxZoomLevel={9}
        minZoomLevel={3}
        showsUserLocation={true} // This will show the blue dot for current location
        mapType="standard"

      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#000000"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />

        <Marker coordinate={currentLocation}>
          <Svg xml={locationPin} rest={{ height: 36, width: 42 }} />
        </Marker>

        {/* End Marker */}
        <Marker coordinate={destination}>
          <Svg xml={carSvg} rest={{ height: 42, width: 42 }} />
        </Marker>
      </MapView>
      {from === 'bookRide' && (
      <RideInfoCard
        driverName="RR Cullinan"
        driverRating={5.5}
        carColor="White"
        licensePlate="CF 21536"
        onCallPress={() => console.log('Call pressed')}
        onMessagePress={handleChat}
        onShowDetailsPress={() => console.log('Show details pressed')}
        style={{ position: 'absolute', bottom: 90, width: screenWidth * 0.92, }}
      />
      )}
      <TimeStatusCard
        icon="🛺"
        title={t("your_ride_is_away")}
        waitingTime="5:00"
        waitingLabel={t('waiting_time')}
        containerStyle={{ position:'absolute',top:30 }}
        iconContainerStyle={{ backgroundColor: '#ffcc80' }}
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
  },
  overlayContainer: {
    position: 'absolute',
    top: 20, // Adjust as per your need (to move the cards down)
    left: 10,
    right: 10,
    zIndex: 1, // To ensure the cards stay on top of the map
    flexDirection: 'column', // Stack cards vertically
  },
  paymentButton:{ backgroundColor: '#C8A7774D', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderRadius: 12,
     alignItems: 'center', 
     justifyContent: 'space-between',
      marginBottom: 15 },
      paymentText:{ fontFamily: StyleGuide.fontFamily.semiBold,
         fontSize: 18,
          color: StyleGuide.color.primary },
});
