import React, { cloneElement, useRef, useState } from 'react';
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
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import Svg from '../../../lib/svg';
import { locationBlackIcon, currentLocationicon, cross, inputCross } from '../../../../assets/svgAssets';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import { screenWidth } from '../../../utils/dimenstions';


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
const RentARide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedHours, setSelectedHours] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState('Lexus 600');
  const [autoAccept, setAutoAccept] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleCurrentLocation = () => {
    setIsGettingLocation(true);
    // Add current location logic here
    setTimeout(() => {
      setIsGettingLocation(false);
    }, 2000);
  };

  console.log("pickupLocation", pickupLocation)

  useScreenHeader({
    title: t('header.rent_ride'),
  });
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const googlePlaceAutoCompleteRef = useRef<typeof GooglePlacesAutocomplete>(null);
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
        borderRadius:8,
        paddingHorizontal: 5,
        borderLeftColor: StyleGuide.color.primary,
        borderBottomWidth:0.5,
        borderTopWidth:0.5,
        borderRightWidth:0.5,
        borderBottomColor:StyleGuide.color.border,
        borderRightColor:StyleGuide.color.border,
        borderTopColor:StyleGuide.color.border,
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
                  styles={{ textInput: { fontSize: 16,color:'black' ,height:50}, listView: { position: 'absolute', top: screenWidth*0.13 } }}
                  onPress={(data, details = null) => setPickupLocation(data.description)}
                  query={{
                    key: 'AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ',
                    language: 'en',
                  }}
                  enablePoweredByContainer={true}
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
                        style={{ padding: 8,alignItems:'center',justifyContent:'center' }}
                      >
                        <Svg xml={inputCross} rest={{ height: 16, width: 16 }} />
                      </TouchableOpacity>
                    ) : null
                  }
                  predefinedPlaces={[]}
                  autoFillOnNotFound={false}
                  currentLocation={false}
                  currentLocationLabel="Current location"
                  debounce={300}
                  fetchDetails={false}
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



      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            Note: Minimum 2 hours, Maximum 24 hours
          </Text>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('select_your_ride')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleScroller}
          >
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.name && styles.selectedVehicleCard,
                ]}
                onPress={() => setSelectedVehicle(vehicle.name)}
              >
                <View style={styles.vehicleImageContainer}>
                  <Image source={vehicle?.image} style={{ height: 50, width: 50 }} resizeMode='contain' />
                </View>
                <Text style={[styles.vehicleName, selectedVehicle === vehicle.name && styles.selectedVehicleText, , { textAlign: isRTL ? 'right' : 'left' }]}>{vehicle.name}</Text>
                <Text style={[styles.vehicleModel, { textAlign: isRTL ? 'right' : 'left' }]}>{vehicle.model}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Auto Accept Toggle */}
        {/* <View style={styles.toggleSection}>
          <Text style={styles.toggleText}>Auto accept the nearest driver</Text>
          <Switch
            value={autoAccept}
            onValueChange={setAutoAccept}
            trackColor={{ false: '#E5E5E5', true: '#D4AF37' }}
            thumbColor={autoAccept ? '#FFFFFF' : '#FFFFFF'}
          />
        </View> */}

      </ScrollView>

      {/* Next Button */}
      <AppButton title={t("next")} onPress={() => { }} />
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
});

export default RentARide;
