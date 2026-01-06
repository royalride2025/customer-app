import React, { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Image,
  Appearance,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import CurrentLocationButton from '../../../lib/component/CurrentLocationButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { useCurrentLocation } from '../../../lib/hooks/useCurrentLocation';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector, useAppDispatch } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import Svg from '../../../lib/svg';
import { locationBlackIcon, currentLocationicon, cross, inputCross } from '../../../../assets/svgAssets';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import { screenWidth } from '../../../utils/dimenstions';
import networkClient from '../../../../networkClient';
import { API_ENDPOINTS } from '../../../../apiEndpoints';
import { CURRENCY } from '../../../constant/currency';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import TopUpModal from '../../../lib/component/TopUpModal';
import { setCurrentCharge } from '../../../redux/paymentSlice';
import { SafeAreaView } from 'react-native-safe-area-context';


const car = require('../../../../assets/images/car.png')
const vehicles = [
  {
    id: 'lexus',
    name: t('lexus_600'),
    model: t('model_black_cf_2826'),
    image: car,
  },
  {
    id: 'defender',
    name: t('defender'),
    model: t('model_black_cf_5648'),
    image: car,
  },
  {
    id: 'cullinan',
    name: t('cullinan'),
    model: t('model_black_cf_58719'),
    image: car,
  },
];
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
const RentARide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const endOfCurrentYear = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }, []);
  const [selectedHours, setSelectedHours] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLocationData, setPickupLocationData] = useState({
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [pickupLocationSelection, setPickupLocationSelection] = useState<{start: number, end: number} | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const isSettingLocationProgrammatically = useRef(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const dispatch = useAppDispatch();
  const profileData = useAppSelector((state: RootState) => state.profile.data);

  // Use the reusable current location hook
  const {
    getCurrentLocation: getCurrentLocationFromHook,
    isLoading: isGettingCurrentLocation,
  } = useCurrentLocation({
    enableGeocoding: true,
    geocodingApiKey: 'AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ',
    onSuccess: (locationData) => {
      // Set flag to prevent onChangeText from interfering
      isSettingLocationProgrammatically.current = true;
      
      // Get the address (use address if available, otherwise use coordinates)
      const address = locationData.address || `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
      
      // Clear previous address first to prevent merging
      setPickupLocation('');
      
      // Set the location data
      setPickupLocationData({
        address: address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      
      // Set the state value
      setPickupLocation(address);
      
      // Update GooglePlacesAutocomplete component
      setTimeout(() => {
        if (googlePlaceAutoCompleteRef.current) {
          // Clear and set in one operation to prevent merging
          googlePlaceAutoCompleteRef.current.setAddressText(address);
        }
        setPickupLocationSelection({ start: 0, end: 0 });
        
        // Reset flag after a delay
        setTimeout(() => {
          isSettingLocationProgrammatically.current = false;
        }, 1000);
      }, 100);
    },
    showToast: true,
  });

  // Wrapper function to use the hook's getCurrentLocation
  const handleGetCurrentLocation = () => {
    getCurrentLocationFromHook();
  };

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

  // Reset selection state after it's been applied
  useEffect(() => {
    if (pickupLocationSelection) {
      const timer = setTimeout(() => {
        setPickupLocationSelection(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pickupLocationSelection]);

  console.log("pickupLocation", pickupLocationData)

  useScreenHeader({
    title: t('header.rent_ride'),
  });
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const navigation = useNavigation();
  console.log("pickupLocation", pickupLocation)
  
  const handleNextButton = async () => {
    // Validate pickup location
    if (!pickupLocation || !pickupLocationData.address) {
      Alert.alert(
        'Missing Location',
        'Please select a pickup location before proceeding.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (selectedTime > endOfCurrentYear) {
      Alert.alert(
        'Invalid Date',
        'Please select a date within the current year.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsBookingLoading(true);
    try {
      const payload = {
        booking_type: "rent",
        booking_status: "pending",
        start_time: moment(selectedTime).format('YYYY-MM-DD hh:mm:ss'),
        duration_for_rent: selectedHours,
        pickup_coordinates: {
          type: "Point",
          coordinates: [ pickupLocationData?.longitude,pickupLocationData?.latitude],
          address: pickupLocationData?.address
        },
        "selected_vehicle_id":selectedVehicle
      };
      console.log(payload, "payload======")
      const response = await networkClient.post(API_ENDPOINTS.CREATE_INSTANT_BOOKING, payload);

      console.log(response?.data, "response======")
      
      Toast.show({ type: 'success', text1: 'Booking successful!', text2: response?.data?.message });
      // Fix navigation - use proper navigation method
      navigation.goBack();

    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || '';
      console.log(message, "====rrr====")
      if (typeof message === 'string' && message.toLowerCase().includes('insufficient credits')) {
        const match = message.match(/([0-9]+\.?[0-9]*)/);
        const min = match ? match[1] : '';
        setTopUpAmount(String(min));
        setShowTopUpModal(true);
      } else {
        Toast.show({ type: 'error', text1: 'Booking failed', text2: message });
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleConfirmTopUp = async (amount: string) => {
    setIsTopUpLoading(true);
    try {
      const user = profileData?.user;
      const profile = profileData?.profile?.customer_profile;
      const customerData = {
        first_name: profile?.name?.split(' ')[0] || 'John',
        email: 'user@royalride.qa',
        phone: {
          country_code: '965',
          number: user?.phone?.replace(/^\+965/, '') || '50000000'
        }
      };
      const chargeData = {
        amount: parseFloat(amount),
        currency: CURRENCY,
        customer: customerData,
        description: 'Wallet Top-up',
        metadata: { user_id: user?._id },
        reference: { transaction: `txn_${Date.now()}`, order: `ord_${Date.now()}` },
        receipt: { email: true, sms: false }
      };
      console.log(chargeData, "chargeData======")
      const res = await networkClient.post(API_ENDPOINTS.CREATE_CHARGE, chargeData);
      if (res.data?.transaction?.url) {
        dispatch(setCurrentCharge({
          id: res.data.id,
          amount: res.data.amount,
          currency: res.data.currency,
          status: res.data.status,
          transactionUrl: res.data.transaction.url,
          createdAt: res.data.transaction.created
        }));
        setShowTopUpModal(false);
        (navigation as any).navigate('PaymentWebView', {
          paymentUrl: res.data.transaction.url,
          amount: parseFloat(amount),
          currency: CURRENCY
        });
      } else {
        Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Failed to initialize payment.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Failed to initialize payment.' });
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  console.log("googlePlaceAutoCompleteRef", googlePlaceAutoCompleteRef)
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
        borderLeftWidth: 6,
        borderRadius: 8,
        paddingHorizontal: 5,
        borderLeftColor: StyleGuide.color.primary,
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomColor: StyleGuide.color.border,
        borderRightColor: StyleGuide.color.border,
        borderTopColor: StyleGuide.color.border,
        top: 2,
      }} >
        <GooglePlacesAutocomplete
          ref={googlePlaceAutoCompleteRef}
          placeholder={t('from')}
          textInputProps={{
            placeholderTextColor: '#8e8e8e',
            value: pickupLocation,
            autoCorrect: false,
            selection: pickupLocationSelection || undefined,
            onChange(text) {
              // Don't clear the value if we're setting it programmatically
              if (isSettingLocationProgrammatically.current && !text) {
                console.log('📍 Preventing clear of programmatically set location');
                return;
              }
              setPickupLocation(text.nativeEvent.target);
              // Clear selection when user types
              setPickupLocationSelection(null);
            },
          }}
          styles={{ textInput: { fontSize: 16, color: 'black', height: 50 }, listView: { position: 'absolute', top: screenWidth * 0.28,elevation:1 },description: { color: 'black', fontSize: 16 } }}
          onPress={(data, details = null) => {
            setPickupLocation(data.description);
            // Set cursor to start (position 0)
            setPickupLocationSelection({ start: 0, end: 0 });
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
            components: 'country:pk|country:qa',
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
          renderRightButton={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CurrentLocationButton
                onPress={handleGetCurrentLocation}
                isLoading={isGettingCurrentLocation}
                showWhenEmpty={true}
                isEmpty={!pickupLocation}
              />
              {pickupLocation && Platform.OS === 'android' && (
                <TouchableOpacity
                  onPress={() => {
                    setPickupLocation('');
                    setPickupLocationData({
                      address: '',
                      latitude: null,
                      longitude: null,
                    });
                  }}
                  style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Svg xml={inputCross} rest={{ height: 16, width: 16 }} />
                </TouchableOpacity>
              )}
            </View>
          )}
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



      <ScrollView contentContainerStyle={{ flexGrow: 1,paddingBottom: 100 }} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Input */}


        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('select_time_and_day')}</Text>
          <View style={styles.pickerBox}>
            <DatePicker
              theme='auto'
              date={selectedTime}
              onDateChange={setSelectedTime}
              mode="datetime"
              minimumDate={new Date()}
              maximumDate={endOfCurrentYear}
              locale="en"
              dividerColor={StyleGuide.color.primary}
              
            />
          </View>
        </View>

        {/* Hours Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('select_hours')}</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.hoursLabelContainer}>
              <Text style={[styles.hoursText]}>
                {selectedHours} {selectedHours === 1 ? t('hour') : t('hours')}
              </Text>
            </View>

            <View style={styles.sliderControlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedHours(Math.max(1, selectedHours - 1))}
              >
                <Text style={[styles.controlButtonText, { color: textColor }]}>-</Text>
              </TouchableOpacity>

              <View style={styles.sliderContent}>
                <Slider
                  style={styles.slider}
                  minimumValue={2}
                  maximumValue={24}
                  step={2}
                  value={selectedHours}
                  onValueChange={setSelectedHours}
                  minimumTrackTintColor={StyleGuide.color.primary}
                  maximumTrackTintColor="#E5E5E5"
                  thumbTintColor={StyleGuide.color.primary}
                />
              </View>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedHours(Math.min(24, selectedHours + 1))}
              >
                <Text style={[styles.controlButtonText, { color: textColor }]}>+</Text>
              </TouchableOpacity>
            </View>

          </View>

          <Text style={styles.hoursNote}>
            Note: Minimum 1 hours, Maximum 24 hours
          </Text>
        </View>

        {/* Vehicle Selection */}
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
        <AppButton loading={isBookingLoading} title={t("submit")} onPress={handleNextButton} />
      </View>
      <TopUpModal
        isVisible={showTopUpModal}
        defaultAmount={topUpAmount}
        currency={CURRENCY}
        isRTL={isRTL}
        isLoading={isTopUpLoading}
        onClose={() => setShowTopUpModal(false)}
        onConfirm={handleConfirmTopUp}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container,

  },
  content: {
    flex: 1,
    marginTop: SCREEN_WIDTH * 0.18
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    overflow: 'hidden',
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
  sliderContainer: {
    // marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    paddingVertical: 15,
    height: 100,
    position: 'relative',
  },
  sliderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 0,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: StyleGuide.color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hoursText: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
  },
  slider: {
    height: 100,
    width: '130%',
    flex: 1,
    marginHorizontal: 10,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: StyleGuide.color.primary,
  },
  sliderTrack: {
    height: 12,
    borderRadius: 6,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  hoursLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  locationContainer: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 8,
    borderLeftColor: StyleGuide.color.primary,
    height: 52
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    // borderWidth: 1,
    // borderColor: StyleGuide.color.lightGrey,
    borderRadius: 8,
    borderLeftWidth: 0,
    width: '100%',
    height: 52
  },
  autocompleteContainer: {
    flex: 1,
  },
  targetIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: StyleGuide.color.primary,
    borderRadius: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  hoursNote: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.grey,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
   
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: StyleGuide.color.white,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
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

export default RentARide;
