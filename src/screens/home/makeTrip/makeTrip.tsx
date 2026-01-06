import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
 
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { useCurrentLocation } from '../../../lib/hooks/useCurrentLocation';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import { inputCross, locationBlackIcon, locationIcon, locationIconOuter } from '../../../../assets/svgAssets';
import AppButton from '../../../lib/component/AppButton';
import CurrentLocationButton from '../../../lib/component/CurrentLocationButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector, useAppDispatch } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import { screenHeight, screenWidth } from '../../../utils/dimenstions';
// removed invalid svg import
import networkClient from '../../../../networkClient';
import { API_ENDPOINTS } from '../../../../apiEndpoints';
import Toast from 'react-native-toast-message';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import { CURRENCY } from '../../../constant/currency';
import { TextInput } from 'react-native';
import { setCurrentCharge } from '../../../redux/paymentSlice';
import TopUpModal from '../../../lib/component/TopUpModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const MakeTripc = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [focusedInput, setFocusedInput] = useState('from');
  const [addresses, setAddresses] = useState<any[]>([]); // Stores fetched addresses
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
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
      setFromLocation('');
      
      // Set the location data
      setFromLocationData({
        address: address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      
      // Set the state value
      setFromLocation(address);
      
      // Update GooglePlacesAutocomplete component
      setTimeout(() => {
        if (googlePlaceAutoCompleteRef.current) {
          // Clear and set in one operation to prevent merging
          googlePlaceAutoCompleteRef.current.setAddressText(address);
        }
        setFromLocationSelection({ start: 0, end: 0 });
        
        // Reset flag after a delay
        setTimeout(() => {
          isSettingLocationProgrammatically.current = false;
        }, 1000);
      }, 100);
    },
    showToast: true,
  });
  const [fromLocationSelection, setFromLocationSelection] = useState<{start: number, end: number} | null>(null);
  const [fromLocationData, setFromLocationData] = useState({
    address: '',
    latitude: null,
    longitude: null,
  });
  const [toLocationData, setToLocationData] = useState({
    address: '',
    latitude: null,
    longitude: null,
  });



  console.log(fromLocationData, "fromLocationData")
  console.log(toLocationData, "toLocationData")
  // const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState('');
  const { flexDirection, textAlignment } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const profileData = useAppSelector((state: RootState) => state.profile.data);
  const dispatch = useAppDispatch();

  // const GOOGLE_PLACES_API_KEY = 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY';
  const navigation = useNavigation()
  // const savedAddresses = [
  //   {
  //     id: 1,
  //     name: t('office'),
  //     address: 'Zone 55 House 10 Street 873 South Muaither Doha',
  //     distance: '2.7 km',
  //   },
  //   {
  //     id: 2,
  //     name: t('home'),
  //     address: 'Zone 55 House 35 Street 873 South Muaither Doha',
  //     distance: '2.7 km',
  //   },
  //   {
  //     id: 3,
  //     name: t('wardrobe'),
  //     address: 'Zone 55 House 89 Street 801 South Muaither Doha',
  //     distance: '2.7 km',
  //   },
  //   {
  //     id: 4,
  //     name: t('shop'),
  //     address: 'Zone 55 House 08 Street 740 South Muaither Doha',
  //     distance: '2.7 km',
  //   },
  // ];
  useEffect(() => {
    fetchAddress();  // Call the function to fetch addresses when the component mounts
  }, []);

  // Removed auto-fetch - location will only be fetched when user clicks the icon

  // Reset selection state after it's been applied
  useEffect(() => {
    if (fromLocationSelection) {
      const timer = setTimeout(() => {
        setFromLocationSelection(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fromLocationSelection]);

  // Refresh addresses whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAddress();
      return () => {};
    }, [])
  );
console.log('addressState',addresses)
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
  
  const handleAddressSelect = (e: any) => {
    if (focusedInput === 'from') {
        setFromLocation(e.address);
        // Set cursor to start (position 0)
        setFromLocationSelection({ start: 0, end: 0 });
        // Set coordinates for from location
        setFromLocationData({
            address: e.address,
            latitude: e.latitude,
            longitude: e.longitude,
        });
    } else {
        setToLocation(e.address);
        // Set coordinates for to location
        setToLocationData({
            address: e.address,
            latitude: e.latitude,
            longitude: e.longitude,
        });
    }
};

  // Wrapper function to use the hook's getCurrentLocation
  const handleGetCurrentLocation = () => {
    getCurrentLocationFromHook();
};


  useScreenHeader({
    title: t('header.plan_your_ride'),

  });
  console.log(fromLocationData, "fromLocationData")
  console.log(toLocationData, "toLocationData")
  const handleNextButton = async () => {
    setLoading(true);
    try {
      const payload = {
        booking_type: 'instant',
        pickup_location: {
          type: 'Point',
          coordinates: [ fromLocationData.longitude,fromLocationData.latitude],
          address: fromLocationData.address,
        },
        dropoff_location: {
          type: 'Point',
          coordinates: [ toLocationData.longitude,toLocationData.latitude],
          address: toLocationData.address,
        },
      };
      console.log(payload, "payload======")
      const response = await networkClient.post(API_ENDPOINTS.CREATE_INSTANT_BOOKING, payload);

      console.log(response?.data, "response======")
      Toast.show({ type: 'success', text1: 'Booking successful!', text2: response?.data?.message });
      navigation.navigate('map', { from: 'plan', booking: response?.data?.data });

    } catch (error: any) {
      const message = error?.response?.data.message || error.message || '';
      console.log(error?.response?.data, "error======")
      // Detect insufficient credits pattern and extract minimum
      if (typeof message === 'string' && message.toLowerCase().includes('insufficient credits')) {
        const match = message.match(/([0-9]+\.?[0-9]*)/);
        const min = match ? match[1] : '';
        setTopUpAmount(min);
        setShowTopUpModal(true);
      } else {
        Toast.show({ type: 'error', text1: 'Booking failed', text2: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return 'Please enter a valid amount';
    if (num <= 0) return 'Amount must be greater than 0';
    return '';
  };

  const handleConfirmTopUp = async () => {
    const err = validateAmount(topUpAmount);
    if (err) { setTopUpError(err); return; }
    setIsTopUpLoading(true);
    try {
      setLoading(true);
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
        amount: parseFloat(topUpAmount),
        currency: CURRENCY,
        customer: customerData,
        description: 'Wallet Top-up',
        metadata: { user_id: user?._id },
        reference: { transaction: `txn_${Date.now()}`, order: `ord_${Date.now()}` },
        receipt: { email: true, sms: false }
      };

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
          amount: parseFloat(topUpAmount),
          currency: CURRENCY
        });
      } else {
        Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Failed to initialize payment.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Failed to initialize payment.' });
    } finally {
      setLoading(false);
      setIsTopUpLoading(false);
    }
  };
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const toLocationRef = useRef<GooglePlacesAutocompleteRef>(null);
  const isSettingLocationProgrammatically = useRef(false);
  console.log(fromLocation, "fromLocation")

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
    <Toast />
      <View
        style={{
          backgroundColor: 'transparent',
          borderLeftWidth: 6,
          borderLeftColor: StyleGuide.color.primary,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          // paddingVertical: 8,
          position: 'absolute',
          alignSelf: 'center',
          top: -1,
          zIndex: 0,
          width: '100%',
        }}
      >
        <View style={{
          backgroundColor: 'white',

          marginBottom: 8,

          paddingHorizontal: 5,
          borderBottomWidth: 0.5,
          borderTopWidth: 0.5,
          borderRightWidth: 0.5,
          borderBottomColor: StyleGuide.color.border,
          borderRightColor: StyleGuide.color.border,
          borderTopColor: StyleGuide.color.border,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 1,
          marginLeft: 0,
          paddingLeft: 4,
       
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // optional shadow
        }}>
          <GooglePlacesAutocomplete
            ref={googlePlaceAutoCompleteRef}
            placeholder={t('from')}
            textInputProps={{
              placeholderTextColor: '#8e8e8e',
              value: fromLocation,
              autoCorrect: false,
              selection: fromLocationSelection || undefined,
              onFocus: () => {
                console.log('📍 Pickup input focused');
                setFocusedInput('from');
            },
            onChange(text) {
                // Don't clear the value if we're setting it programmatically
                if (isSettingLocationProgrammatically.current && !text) {
                  console.log('📍 Preventing clear of programmatically set location');
                  return;
                }
                setFromLocation(text.nativeEvent.target);
                // Clear selection when user types
                setFromLocationSelection(null);
              },
            }}
            styles={{ textInput: { fontSize: 16, color: 'black', height: 50,textAlign: isRTL ? 'right' : 'left' }, listView: { position: 'absolute', top: screenWidth * 0.3,color: 'black' }, description: { color: 'black', fontSize: 16 },  // suggestion text -> green
            predefinedPlacesDescription: { color: 'black' }  }}
            onPress={(data, details = null) => {
              setFromLocation(data.description);
              // Set cursor to start (position 0)
              setFromLocationSelection({ start: 0, end: 0 });
              if (details) {
                const { lat, lng } = details.geometry.location;
                const address = data.description;
            
                // Save to state
                setFromLocationData({
                  address,
                  latitude: lat,
                  longitude: lng,
                });
            
                console.log('Selected:', { address, lat, lng });
              }
            }}


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
                  isEmpty={!fromLocation}
                />
                {fromLocation && Platform.OS === 'android' && (
                <TouchableOpacity
                  onPress={() => {
                    setFromLocation('');
                      setFromLocationData({
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
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 5,
          borderBottomWidth: 0.5,
          borderTopWidth: 0.5,
          borderRightWidth: 0.5,
          borderBottomColor: StyleGuide.color.border,
          borderRightColor: StyleGuide.color.border,
          borderTopColor: StyleGuide.color.border,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          borderTopLeftRadius: 1,
          borderBottomLeftRadius: 3,
          marginBottom: 0,
          // marginLeft: -4,
          paddingLeft: 4,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // optional shadow
        }}>
          <GooglePlacesAutocomplete
            ref={toLocationRef}
            placeholder={t('to')}
            textInputProps={{
              placeholderTextColor: '#8e8e8e',
              value: toLocation,
              autoCorrect: false,
              onChange(e) {
                setToLocation(e.nativeEvent.target)
              },
              onFocus: () => {
                console.log('📍 Pickup input focused');
                setFocusedInput('to');
            },
            }}
            styles={{
              textInput: {
                height: 50,
                fontSize: 16,
                color: StyleGuide.color.black,
                textAlign: isRTL ? 'right' : 'left'
              }, listView: { position: 'absolute', top: 50 }, description: { color: 'black', fontSize: 16, }, 
            predefinedPlacesDescription: { color: 'black' }, 
            
            }}
            onPress={(data, details = null) => {setToLocation(data.description)
              if (details) {
                const { lat, lng } = details.geometry.location;
                const address = data.description;
                setToLocationData({
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
            renderRightButton={() =>
              toLocation &&Platform.OS === 'android' ? (
                <TouchableOpacity
                  onPress={() => {
                    setToLocation('');
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
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>


        <View style={styles.savedAddressesContainer}>
          <View style={[styles.savedAddressesHeader, flexDirection]}>
            <Text style={styles.savedAddressesTitle}>{t('saved_addresses')}</Text>
            <TouchableOpacity onPress={()=>navigation.navigate('address')}>
              <Text style={styles.addButton}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
          {
  addressLoading ? (
    <ActivityIndicator size={24} color={StyleGuide.color.primary} />
  ) : (
    <>
      {addresses && addresses.length > 0 ? (
        addresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            style={styles.addressItem}
            onPress={() => handleAddressSelect(address)}
          >
            <View style={[styles.addressContent, flexDirection]}>
              <Svg xml={locationIcon} rest={{ height: 20, width: 20, marginTop: 7 }} />
              <View style={[styles.addressDetails, isRTL ? { marginRight: 13 } : { marginLeft: 13 }]}>
                <Text style={[styles.addressName, textAlignment]}>{address.label}</Text>
                <Text style={[styles.addressText, textAlignment]}>{address.address}</Text>
              </View>
              {/* Uncomment below to display the distance */}
              {/* <Text style={[styles.addressDistance, textAlignment]}>{address.distance}</Text> */}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noAddressesWrap}>
          <Text style={styles.noAddressesText}>{t('no_saved_locations')}</Text>
        </View>
      )}
    </>
  )
}

          
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <AppButton onPress={handleNextButton} title={t('next')} loading={loading} disabled={loading} />
      </View>
      <Toast />
      <TopUpModal
        isVisible={showTopUpModal}
        defaultAmount={topUpAmount}
        currency={CURRENCY}
        isRTL={isRTL}
        isLoading={isTopUpLoading}
        onClose={() => setShowTopUpModal(false)}
        onConfirm={(amt) => { setTopUpAmount(amt); handleConfirmTopUp(); }}
      />
    </SafeAreaView>
    </>
  );
};

export default MakeTripc;

const styles = StyleSheet.create({
  container: { ...StyleGuide.layout.container },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: { flex: 1, marginTop: SCREEN_WIDTH * 0.36,zIndex:-2},
  locationContainer: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    // paddingVertical: 10,
    marginBottom: 30,
    borderLeftWidth: 8,
    borderLeftColor: StyleGuide.color.primary
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: StyleGuide.color.lightGrey,
    borderRadius: 8,
    borderLeftWidth: 0,
    width: '100%'

  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C8A882',
    marginRight: 10,
  },
  destinationDot: {
    backgroundColor: '#444',
  },
  autocompleteContainer: {
    flex: 1,
  },
  targetIcon: {
    marginLeft: 10,
  },
  savedAddressesContainer: { flex: 1 },
  savedAddressesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  savedAddressesTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
  },
  addButton: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.primary,
  },
  addressItem: {


    marginBottom: 5,
    // padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContent: {
    flexDirection: 'row',
    // alignItems: 'center',
    flex: 1,
  },
  addressDetails: {
    flex: 1,

  },
  addressName: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black
  },
  addressText: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.lightGrey
  },
  addressDistance: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black
  },
  buttonContainer: {
    marginBottom: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '100%'
  },
  nextButton: {
    backgroundColor: '#C8A882',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noAddressesText: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,  
    textAlign: 'center',
    marginTop: 20,
  },
  noAddressesWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: screenHeight*0.2,
  },
});
