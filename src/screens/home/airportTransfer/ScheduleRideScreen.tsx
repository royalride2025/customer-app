import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, TextInput, Linking, ScrollView, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import Svg from '../../../lib/svg';
import { locationIcon, currentLocationicon, inputCross, swap, airportTransferIcon } from '../../../../assets/svgAssets';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { t } from 'i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/reduxHooks';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import Toast from 'react-native-toast-message';
import networkClient from '../../../../networkClient';
import { API_ENDPOINTS } from '../../../../apiEndpoints';
import moment from 'moment';
import TopUpModal from '../../../lib/component/TopUpModal';
import { setCurrentCharge } from '../../../redux/paymentSlice';
import { CURRENCY } from '../../../constant/currency';

const car = require('../../../../assets/images/car.png')

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


const delayOptions = [
  { value: 0, label: "No Delay" },
  { value: 10, label: '10 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 40, label: '40 minutes' },
  { value: 50, label: '50 minutes' },
  { value: 60, label: '1 hour' },
  { value: 70, label: '1 hour 10 minutes' },
  { value: 80, label: '1 hour 20 minutes' },
  { value: 90, label: '1 hour 30 minutes' },
  { value: 100, label: '1 hour 40 minutes' },
  { value: 110, label: '1 hour 50 minutes' },
  { value: 120, label: '2 hours' },
];

const ScheduleRideScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { toLocation,fromLocationData,toLocationData,fromLocation } = route.params || {};
  const isAirportDestination = typeof toLocation === 'string' && toLocation.toLowerCase().includes('airport');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [flightNumber, setFlightNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'flight' | 'time'>('flight');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const dispatch = useAppDispatch();
  const profileData = useAppSelector((state: any) => state.profile.data);
const [selectedTime, setSelectedTime] = useState(new Date());
const endOfCurrentYear = useMemo(() => {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
}, []);

  
console.log("fromLocationData",fromLocationData)
console.log("toLocationData",toLocationData)
console.log("toLocation",toLocation)
console.log("fromLocation",fromLocation)
  const [delayAfterFlight, setDelayAfterFlight] = useState(0);
  const [showDelayDropdown, setShowDelayDropdown] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [numberOfPersons, setNumberOfPersons] = useState('1');
  const [luggageWeight, setLuggageWeight] = useState('');
  const [luggageWeightError, setLuggageWeightError] = useState('');


  const isRTL = useAppSelector((state) => state.language.isRTL);
  const { flexDirection, textAlignment } = useTranslationStyles();
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const getISODateTime = (date: Date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };
  
  const formatDate = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric',year:"numeric" });

  const fetchVehicles = async () => {
    setIsVehiclesLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_VEHICLES_WITH_OWNERS}?limit=100`);
      console.log('Vehicles response:', response.data);
      
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

  console.log("with",activeTab==="time"?formatDateToYMD(selectedTime):formatDateToYMD(date))
  const handleSubmitButton = async () => {
    // Clear previous validation errors
    setLuggageWeightError('');
   
    const now = new Date();
    const isUsingTimeTab = activeTab === "time";
    const selectedDateTime = isUsingTimeTab ? selectedTime : date;
    const endOfYear = endOfCurrentYear;

    if (selectedDateTime < now) {
      Alert.alert('Invalid Date', 'Please select a future date and time.', [{ text: 'OK', style: 'default' }]);
      return;
    }

    if (selectedDateTime > endOfYear) {
      Alert.alert('Invalid Date', 'Please select a date within the current year.', [{ text: 'OK', style: 'default' }]);
      return;
    }

    // Validate luggage weight
    if (!luggageWeight || luggageWeight.trim() === '' || parseFloat(luggageWeight) < 0) {
      setLuggageWeightError('Please enter luggage weight');
      return;
    }

    setIsBookingLoading(true);
    try {
      const payload = {
     booking_type: "airport",
    date: activeTab==="time"?formatDateToYMD(selectedTime):formatDateToYMD(date),
    time: isAirportDestination ? moment(date).format('YYYY-MM-DD HH:mm:ss') : (activeTab === "time" ? moment(selectedTime).format('YYYY-MM-DD HH:mm:ss') : ""), // start time optional
    pickup_coordinates: {
        type: "Point",
        coordinates: [fromLocationData?.longitude,fromLocationData?.latitude],
        address: fromLocationData?.address

    }, 
    dropoff_coordinates: {        
        type: "Point",
        coordinates: [ toLocationData?.longitude,toLocationData?.latitude],
        address: toLocationData?.address

    },
    flight_number: flightNumber || "",       //optional
    delay: delayAfterFlight ? String(delayAfterFlight) : "",                       //optional
    selected_vehicle_id: selectedVehicle || "",
    number_of_person: numberOfPersons ? parseInt(numberOfPersons) : 1,
    luggage_weight: luggageWeight ? parseFloat(luggageWeight) : 0
    }
      console.log(payload, "payload======")
      const response = await networkClient.post(API_ENDPOINTS.CREATE_INSTANT_BOOKING, payload);

      console.log(response?.data, "response======")
      
      Toast.show({ type: 'success', text1: 'Booking successful!', text2: response?.data?.message });
      // Fix navigation - use proper navigation method
      navigation.goBack();

    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || '';
      console.log(message, "error======")
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
  const profile = profileData?.profile?.customer_profile?.name;
  console.log("profile=ok",profile)
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

  // Example drop-off time calculation
  const rideDuration = 19; // minutes
  const dropoffDate = new Date(date.getTime() + rideDuration * 60000);
 
  useScreenHeader({
    title: t('schedule_ride'),
  });
console.log("isAirportDestination",isAirportDestination)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Date & Time */}
      {
        !isAirportDestination && (
          <View style={styles.tabRow}>
          <View style={{ flexDirection: 'row', flex: 1,justifyContent:"space-between" }}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'flight' && styles.activeTab,
                
              ]}
              onPress={() => setActiveTab('flight')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'flight' && styles.activeTabText,
               
              ]}>
                {t('by_flight_arrival')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'time' && styles.activeTab,
                
              ]}
              onPress={() => {setActiveTab('time'),setDelayAfterFlight(0)}}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'time' && styles.activeTabText
              ]}>
                {t('by_time')}
              </Text>
            </TouchableOpacity>
          </View>
        </View> 
        )
      }
      {
      activeTab === 'time' && (
        
          <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Schedule Time</Text>

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
        {/* <TouchableOpacity onPress={() => { setPickerMode('time'); setShowDatePicker(true); }}>
          <Text style={[styles.inputValue, textAlignment]}>{formatTime(date)}</Text>
        </TouchableOpacity> */}
      </View>
        )
      }
      {
        activeTab != 'time' && (
          <>
          <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Date</Text>
        <TouchableOpacity onPress={() => { setPickerMode('date'); setShowDatePicker(true); }}>
          <Text style={[styles.inputValue, textAlignment]}>{formatDate(date)}</Text>
        </TouchableOpacity>
      </View>
          </>
        )
      }
      
      {isAirportDestination &&(
      <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Time</Text>
        <TouchableOpacity onPress={() => { setPickerMode('time'); setShowDatePicker(true); }}>
          <Text style={[styles.inputValue, textAlignment]}>{formatTime(date)}</Text>
        </TouchableOpacity>
      </View>
      )
}
      {/* Date/Time Picker Modal */}
     
      { showDatePicker &&  (
    <View style={styles.pickerModalOverlay}>
      <View style={styles.pickerModalContent}>
        <DatePicker
          modal
          open={showDatePicker}
          date={date}
          mode={pickerMode}
          onConfirm={(selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setShowDatePicker(false)}
          theme="auto"
          locale="en"
          dividerColor={StyleGuide.color.primary}
        />
      </View>
    </View>
)}
      {/* Flight number (only if airport is destination) */}
     {
      activeTab === 'flight' && (
        <>
          <View style={[styles.cardInputRow, flexDirection]}>
            <Svg xml={airportTransferIcon} rest={{ height: 20, width: 20, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
            <TextInput
              style={[styles.flightInput, textAlignment]}
              placeholder={isAirportDestination?t('flight_number_optional'):t('flight_number_required')}
              placeholderTextColor={StyleGuide.color.grey}
              value={flightNumber}
              onChangeText={setFlightNumber}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          <Text style={[styles.infoText, textAlignment]}>{t('flight_info_helps_terminal')}</Text>
        </>
      )
     }
        
      
          {!isAirportDestination &&activeTab === 'flight' && (
        <>
            <Text style={[styles.inputLabel, textAlignment]}>{'Delay after flight'}</Text>
          <View style={styles.cardInput}>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowDelayDropdown(true)}
            >
              <Text style={[styles.dropdownText, textAlignment]}>
                {delayOptions.find(option => option.value === delayAfterFlight)?.label || t('no_delay')}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Number of Persons */}
      <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Number of Persons</Text>
        <TextInput
          style={[styles.numberInput, textAlignment]}
          placeholder="Enter number of persons"
          placeholderTextColor={StyleGuide.color.grey}
          value={numberOfPersons}
          onChangeText={setNumberOfPersons}
          keyboardType="numeric"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </View>

      {/* Luggage Weight */}
      <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Luggage Weight (kg)</Text>
        <TextInput
          style={[styles.numberInput, textAlignment, luggageWeightError && styles.inputError]}
          placeholder="Enter luggage weight in kg"
          placeholderTextColor={StyleGuide.color.grey}
          value={luggageWeight}
          onChangeText={(text) => {
            setLuggageWeight(text);
            if (luggageWeightError) {
              setLuggageWeightError('');
            }
          }}
          keyboardType="decimal-pad"
          textAlign={isRTL ? 'right' : 'left'}
        />
        {luggageWeightError ? (
          <Text style={[styles.errorText, textAlignment]}>{luggageWeightError}</Text>
        ) : null}
      </View>

      {/* Vehicle Selection */}
      <View style={styles.section}>
        <Text style={[styles.inputLabel, textAlignment]}>{t('select_your_ride')}</Text>
        {isVehiclesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={StyleGuide.color.primary} />
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
                    style={{ height: 80, width: 80 }} 
                    resizeMode='contain' 
                  />
                </View>
                <Text style={[styles.vehicleName, selectedVehicle === vehicle?.vehicle_details?._id && styles.selectedVehicleText, textAlignment]}>
                  {vehicle?.vehicle_details?.car_make}
                </Text>
                <Text style={[styles.vehicleModel, textAlignment]}>
                  ({vehicle?.vehicle_details?.vehicle_color})  {vehicle?.vehicle_details?.car_model}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noVehiclesContainer}>
            <Text style={styles.noVehiclesText}>No vehicles available</Text>
          </View>
        )}
      </View>

      {/* Drop-off estimate */}
      {isAirportDestination &&(
        <>
      <View style={styles.estimateRow}>
        <Svg xml={locationIcon} rest={{ height: 18, width: 18, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
        <View>
          <Text style={[styles.dropoffTime, textAlignment]}>{t('dropoff_at_approx', { time: formatTime(dropoffDate) })}</Text>
          <Text style={[styles.estimateText, textAlignment]}>{t('estimated_ride_duration', { duration: rideDuration })}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      </>
      )}
      {/* Airport drop-off perks */}
      <View style={styles.perksRow}>
        <Svg xml={airportTransferIcon} rest={{ height: 18, width: 18, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
        <View>
          <Text style={[styles.perksTitle, textAlignment]}>{'Airport Dropoff Perks'}</Text>
          <Text style={[styles.perksLink, textAlignment]} onPress={() => Linking.openURL('https://app.royalride.qa')}>{'Learn More RoyalRide'}</Text>
        </View>
      </View>
      <Modal
        visible={showDelayDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDelayDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDelayDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <ScrollView style={styles.dropdownScrollView}>
              {delayOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    delayAfterFlight === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    setDelayAfterFlight(option.value);
                    setShowDelayDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    delayAfterFlight === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      </ScrollView>
      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <AppButton disabled={!isAirportDestination && activeTab === 'flight' && !flightNumber} 
        title="Set pickup time" onPress={handleSubmitButton}
         loading={isBookingLoading} style={{ 
          width: '100%',
          opacity: (
            (!isAirportDestination && activeTab === 'flight' && !flightNumber) 
           
          ) ? 0.5 : 1
        }} />
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
   ...StyleGuide.layout.container
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: StyleGuide.color.black,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: StyleGuide.color.black,
  },
  cardInput: {
    backgroundColor: '#F6F6F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  inputLabel: {
    color: StyleGuide.color.black,
    fontSize: 14,
    fontFamily:StyleGuide.fontFamily.semiBold,
    marginBottom: 2,
  },
  inputValue: {
    color: StyleGuide.color.black,
    fontSize: 16,
    fontWeight: '500',
  },
  flightInput: {
    flex: 1,
    fontSize: 16,
    color: StyleGuide.color.black,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 8,
  },
  infoText: {
    color: StyleGuide.color.grey,
    fontSize: 13,
    marginBottom: 18,
    marginLeft: 4,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropoffTime: {
    fontWeight: 'bold',
    color: StyleGuide.color.black,
    fontSize: 16,
  },
  estimateText: {
    color: StyleGuide.color.grey,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perksTitle: {
    fontWeight: 'bold',
    color: StyleGuide.color.black,
    fontSize: 16,
  },
  perksLink: {
    color: StyleGuide.color.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: StyleGuide.color.white,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: StyleGuide.color.grey,
    width: SCREEN_WIDTH*0.4,
    justifyContent:'center',
    alignItems:'center'
  },
  activeTab: {
    backgroundColor: StyleGuide.color.primary,
    borderColor: StyleGuide.color.primary,
  },
  tabText: {
    fontSize: 14,
   fontFamily:StyleGuide.fontFamily.semiBold ,
   color:StyleGuide.color.blackishGrey
  },
  activeTabText: {
    color: StyleGuide.color.white,
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    color: '#999',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F6F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: StyleGuide.color.black,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: StyleGuide.color.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: StyleGuide.color.primary,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: StyleGuide.color.black,
  },
  selectedOptionText: {
    color: StyleGuide.color.white,
    fontWeight: 'bold',
  },
  numberInput: {
    fontSize: 16,
    color: StyleGuide.color.black,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginTop: 4,
  },
  section: {
    marginVertical: 12,
    marginBottom: 16,
  },
  vehicleScroller: {
    marginTop: 10,
  },
  vehicleCard: {
    backgroundColor: StyleGuide.color.white,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: StyleGuide.color.border,
  },
  selectedVehicleCard: {
    backgroundColor: StyleGuide.color.primary,
    borderColor: StyleGuide.color.primary,
  },
  selectedVehicleText: {
    color: StyleGuide.color.white
  },
  vehicleImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleName: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.primary,
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.black,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
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
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.blackishGrey,
  },
});

export default ScheduleRideScreen; 