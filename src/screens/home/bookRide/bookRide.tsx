import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Image,
  Appearance,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import Svg from '../../../lib/svg';
import { premiumIcon, standardIcon, vipIcon, locationBlackIcon, inputCross } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import { screenWidth } from '../../../utils/dimenstions';
import Toast from 'react-native-toast-message';
import networkClient from '../../../../networkClient';
import { API_ENDPOINTS } from '../../../../apiEndpoints';

const car = require('../../../../assets/images/car.png')

// Define vehicle interface based on actual API response
interface VehicleDetails {
  _id: string;
  car_make: string;
  car_model: string;
  vehicle_color: string;
  vehicle_pictures: string[];
  year?: string;
  license_plate?: string;
  capacity?: number;
}

interface VehicleOwner {
  _id: string;
  phone: string;
  provider?: string | null;
  provider_id?: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  access_platforms: string[];
  createdAt: string;
  updatedAt: string;
}

interface Vehicle {
  _id: string;
  vehicle_details: VehicleDetails;
  owner: VehicleOwner;
  status?: string;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

const BookRide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLocationData, setPickupLocationData] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [timeValidationError, setTimeValidationError] = useState('');
  const navigation = useNavigation();
 
  useScreenHeader({
    title: 'Book a Ride',
  });


  console.log(vehicles, "/////vehicles")
  console.log(selectedVehicle, "/////selectedVehicle")
  // Fetch vehicles from API
  const fetchVehicles = async () => {
    setIsVehiclesLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_VEHICLES_WITH_OWNERS}?limit=100`);
      console.log('Vehicles response:', response.data,response.data?.vehicles[0]?.vehicle_details?._id);
      
      if (response.data && response.data.vehicles) {
        setVehicles(response.data.vehicles);
        // Set first vehicle as default selected if available
        if (response?.data?.vehicles.length > 0) {
          setSelectedVehicle(response.data?.vehicles[0]?.vehicle_details?._id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Failed to load vehicles', 
        text2: error?.response?.data?.message || 'Please try again later' 
      });
    } finally {
      setIsVehiclesLoading(false);
    }
  };

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const validateTime = (time: Date) => {
    const now = new Date();
    const selectedDateTime = new Date(time);
    const isToday = selectedDateTime.toDateString() === now.toDateString();
    
    if (selectedDateTime < now) {
      setTimeValidationError('Please select a future date and time for your ride booking.');
      return false;
    }
    
    if (isToday) {
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      if (selectedDateTime < thirtyMinutesFromNow) {
        setTimeValidationError('Your booking must be scheduled at least 30 minutes in advance. Please select a later time.');
        return false;
      }
    }
    
    setTimeValidationError('');
    return true;
  };
  
  const handleSubmitButton = async () => {
    // Clear previous validation errors
    setTimeValidationError('');

    // Validate pickup location
    if (!pickupLocation || !pickupLocationData.address) {
      Alert.alert(
        'Missing Location',
        'Please select a pickup location before proceeding.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Validate vehicle selection
    if (!selectedVehicle) {
      Alert.alert(
        'Missing Vehicle',
        'Please select a vehicle before proceeding.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Validate date and time - check if selected time is in the past
    const now = new Date();
    const selectedDateTime = new Date(selectedTime);
    
    // Check if selected date is today
    const isToday = selectedDateTime.toDateString() === now.toDateString();
    
    if (selectedDateTime < now) {
      setTimeValidationError('Please select a future date and time for your ride booking.');
      return;
    }
    
    // Additional check: if it's today, ensure at least 30 minutes in advance
    if (isToday) {
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      if (selectedDateTime < thirtyMinutesFromNow) {
        setTimeValidationError('Your booking must be scheduled at least 30 minutes in advance. Please select a later time.');
        return;
      }
    }

    setIsBookingLoading(true);
    try {
      const payload = {
        booking_type: "book",
        date: selectedTime.toISOString().split('T')[0],
        time: selectedTime.toISOString().split('T')[1], // start time
        pickup_coordinates: {
            type: "Point",
            coordinates: [pickupLocationData?.latitude, pickupLocationData?.longitude],
            address: pickupLocationData?.address
    
        },
     
        selected_vehicle_id: selectedVehicle
    }
      console.log(payload, "payload======")
      const response = await networkClient.post(API_ENDPOINTS.CREATE_INSTANT_BOOKING, payload);

      console.log(response?.data, "response======")
      
      Toast.show({ type: 'success', text1: 'Booking successful!', text2: response?.data?.message });
      // Fix navigation - use proper navigation method
      navigation.goBack();

    } catch (error: any) {
      console.log(error?.response?.data, "error======")
      Alert.alert(error?.response?.data?.error)
      Toast.show({ type: 'error', text1: 'Booking failed', text2: error?.response?.data?.message || error.message });
    } finally {
      setIsBookingLoading(false);
    }
  };
  
  const colorScheme = Appearance.getColorScheme();
  const textColor = colorScheme === 'dark' ? '#FFF' : '#000'; 
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  console.log(selectedTime, "selectedTime")
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 9999,
        alignItems: 'center',
        backgroundColor: 'white',
        position: 'absolute',
        alignSelf: 'center',
        borderLeftWidth: 4,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 6,
        paddingHorizontal: 5,
        borderLeftColor: StyleGuide.color.primary,
        top: 2,
      }} >
       <GooglePlacesAutocomplete
          ref={googlePlaceAutoCompleteRef}
          placeholder={t('from')}
          textInputProps={{

            placeholderTextColor: '#8e8e8e',
            value: pickupLocation,
            autoCorrect: false,
            onChange(e) {
              setPickupLocation(e.nativeEvent.target)
            },
          }}
          styles={{ textInput: { fontSize: 16, color: 'black', height: 50 }, listView: { position: 'absolute', top: screenWidth * 0.28 } }}
          onPress={(data, details = null) => {
            setPickupLocation(data.description)
            if (details) {
              const { lat, lng } = details.geometry.location;
              const address = data.description;

              // Save to state
              setPickupLocationData({
                address,
                latitude: lat,
                longitude: lng,
              });

              console.log('Selected:', { address, lat, lng });
            }
          }
          }
          query={{
            key: 'AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ',
            language: 'en',
          }}
          enablePoweredByContainer={false}
          renderLeftButton={() => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Svg
                rest={{
                  height: 18,
                  width: 18,
                  style: { marginVertical: 10 },
                }}
                xml={locationBlackIcon}
              />
            </View>
          )}
          renderRightButton={() =>
            pickupLocation ? (
              <TouchableOpacity
                onPress={() => {
                  setPickupLocation('');
                }}
                style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}
              >
                <Svg xml={inputCross} rest={{ height: 16, width: 16 }} />
              </TouchableOpacity>
            ) : null
          }
          predefinedPlaces={[]}
          autoFillOnNotFound={false}
          currentLocation={false}
          currentLocationLabel="Current location"
          debounce={0}
          fetchDetails={true}
          keyboardShouldPersistTaps="always"
          keepResultsAfterBlur={false}
          minLength={2}
          nearbyPlacesAPI="GooglePlacesSearch"
          numberOfLines={1}
          onFail={(e) => { console.warn('Google Place Failed : ', e) }}
          onNotFound={() => { }}
          onTimeout={() => console.warn('google places autocomplete: request timeout')}
          predefinedPlacesAlwaysVisible={false}
          timeout={20000}
          fields="*"
        />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1,paddingBottom: SCREEN_WIDTH*0.35 }} style={styles.content} showsVerticalScrollIndicator={false}>
    

        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_reservation_time')}</Text>
          <View style={styles.pickerBox}>
            <DatePicker
              theme='auto'
              date={selectedTime}
              onDateChange={(time) => {
                setSelectedTime(time);
                validateTime(time);
              }}
              mode="datetime"
              locale="en"
              minimumDate={new Date()}
              dividerColor={StyleGuide.color.primary}
            />
          </View>
          {timeValidationError ? (
            <Text style={styles.errorText}>{timeValidationError}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('select_your_ride')}</Text>
          {isVehiclesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading vehicles...</Text>
            </View>
          ) : vehicles.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.vehicleScroller}
            >
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle._id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle?.vehicle_details?._id && styles.selectedVehicleCard,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle?.vehicle_details?._id)}
                >
                  <View style={styles.vehicleImageContainer}>
                    <Image 
                      source={vehicle.vehicle_details ? { uri: vehicle?.vehicle_details?.vehicle_pictures[0] } : car} 
                      style={{ height: 100, width: 100 }} 
                      resizeMode='contain' 
                    />
                  </View>
                  <Text style={[styles.vehicleName, selectedVehicle === vehicle?.vehicle_details?._id && styles.selectedVehicleText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {vehicle?.vehicle_details?.car_make}
                  </Text>
                  <Text style={[styles.vehicleModel, { textAlign: isRTL ? 'right' : 'left' }]}>
                  ({vehicle?.vehicle_details?.vehicle_color})  {vehicle?.vehicle_details?.car_model}
                  </Text>
                  {/* {vehicle.owner && (
                    <Text style={[styles.ownerText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      Owner: {vehicle.owner.name}
                    </Text>
                  )} */}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noVehiclesContainer}>
              <Text style={styles.noVehiclesText}>No vehicles available</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <AppButton loading={isBookingLoading} onPress={handleSubmitButton} title={t('submit')}/>
      </View>
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container,
   
  },
  content: {
    flex: 1,
    marginTop:SCREEN_WIDTH*0.18
  },
  section: {
    marginBottom: 10,
    marginTop:20
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor:StyleGuide.color.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop:10
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  servicesTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 12,
    marginTop:15
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceButtonSecondary: {
    backgroundColor: StyleGuide.color.white,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
   width:'31%',
    elevation: 0.4,
  },
  serviceText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    textAlign: 'center',
    color: StyleGuide.color.blackishGrey,
    marginTop: 10,
  },
  savedTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.blackishGrey,
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedButton: {
    backgroundColor: StyleGuide.color.secondary, 
    borderRadius: 8,
  },
  
  selectedText: {
    color: StyleGuide.color.white,
  },
  locationContainer: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: StyleGuide.color.primary,
    height: 52,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    // borderWidth: 1,
    // borderColor: StyleGuide.color.lightGrey,
    // borderRadius: 8,
    borderLeftWidth: 0,
    width: '100%',
    height: 52,
  },
  autocompleteContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '100%',
  },
  timeDisplayContainer: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.blackishGrey,
    flex: 1,
  },
  dateTimeValue: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.black,
    flex: 2,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color: '#FF3B30',
    marginTop: 8,
    marginLeft: 4,
  },
  vehicleScroller: {
    marginTop: 10,
  },
  vehicleCard: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    padding: 20,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  selectedVehicleCard: {
    backgroundColor: StyleGuide.color.primary,

  },
  selectedVehicleText: {
    color: StyleGuide.color.black
  },
  vehicleImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleImage: {
    fontSize: 30,
  },
  vehicleName: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.primary,
    marginBottom: 5,
  },
  vehicleModel: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.black,
  },
  ownerText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.blackishGrey,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.blackishGrey,
  },
  noVehiclesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noVehiclesText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.blackishGrey,
  },
});

export default BookRide;
