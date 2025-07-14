import React, { useRef, useState } from 'react';
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
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import Svg from '../../../lib/svg';
import { premiumIcon, standardIcon, vipIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';

const services = [
    {
        id:'standard',
      icon: standardIcon,
      text: 'Standard',
      extraStyle: { marginRight: 5 },
    },
    {
        id:'premium',
      icon: premiumIcon,
      text: 'Premium',
      extraStyle: {},
    },
    {
        id:'vip',
      icon: vipIcon,
      text: 'VIP',
      extraStyle: {},
    },
  ];
const BookRide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
 
  const navigation = useNavigation();
 
  useScreenHeader({
    title: 'Book a Ride',
  });
  
  const handleNextButton = () => {
    navigation.navigate('map' as never, { from: 'bookRide' } as never);
  };
  
  const handleCurrentLocation = () => {
    setIsGettingLocation(true);
    // Add current location logic here
    setTimeout(() => {
      setIsGettingLocation(false);
    }, 2000);
  };
  const colorScheme = Appearance.getColorScheme();
  const textColor = colorScheme === 'dark' ? '#FFF' : '#000'; 
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const googlePlaceAutoCompleteRef = useRef<typeof GooglePlacesAutocomplete>(null);
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
          placeholder='Pick Up  Location'
          textInputProps={{
            placeholderTextColor: '#000',
            // value: pickupLocation,
            autoCorrect: false,

            onChangeText(e) {
              setPickupLocation(e);
            },
          }}
          styles={{ textInput: { fontSize: 16 }, listView: { position: 'absolute', top: 50 } }}
          onPress={(data, details = null) => { console.log(data, details); }}
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
                  height: 20,
                  width: 20,
                  style: { marginVertical: 10 },
                }}
                xml={locationBlackIcon}
              />
            </View>
          )}
          // renderRightButton={() => (

          //   <View
          //     style={{
          //       justifyContent: 'center',
          //       flexDirection: 'row',
          //       alignItems: 'center',
          //       right: 0,
          //       position: 'absolute',
          //       top: 15

          //     }}>
          //    {(pickupLocation || googlePlaceAutoCompleteRef.current?.getAddressText()) ? (
          //   <TouchableOpacity
          //     onPress={() => {
          //       setPickupLocation('');
          //       googlePlaceAutoCompleteRef.current?.clear();
          //     }}>
          //     <Svg xml={cross} rest={{ height: 16, width: 16 }} />
          //   </TouchableOpacity>
          // ) : null}

          //   </View>)}
          predefinedPlaces={[]}
          autoFillOnNotFound={false}
          currentLocation={false}
          currentLocationLabel="Current location"
          debounce={0}
          // disableScroll={false}
          // enableHighAccuracyLocation={true}
          fetchDetails={false}
          // filterReverseGeocodingByTypes={[]}
          // GooglePlacesDetailsQuery={{}}
          // GooglePlacesSearchQuery={{
          //  rankby: 'distance',
          //  type: 'restaurant',
          // }}
          // GoogleReverseGeocodingQuery={{}}
          // isRowScrollable={true}
          keyboardShouldPersistTaps="always"
          // listHoverColor="#ececec"
          // listUnderlayColor="#c8c7cc"
          // listViewDisplayed="auto"
          keepResultsAfterBlur={false}
          minLength={3}
          nearbyPlacesAPI="GooglePlacesSearch"
          numberOfLines={1}
          onFail={(e) => { console.warn('Google Place Failed : ', e) }}
          onNotFound={() => { }}
          onTimeout={() => console.warn('google places autocomplete: request timeout')}
          predefinedPlacesAlwaysVisible={false}
          // suppressDefaultStyles={false}
          // textInputHide={false}
          timeout={20000}
          // isNewPlacesAPI={false}
          fields="*"
        />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Input */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('pickup_location')}</Text>
          <View style={styles.locationContainer}>
            <View style={[styles.locationInputWrapper, { borderTopLeftRadius: 5, marginBottom: 15, borderBottomLeftRadius: 1 }]}>
              <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20 }} />
              <View style={styles.autocompleteContainer}>
                <GooglePlacesAutocomplete
                  predefinedPlaces={[]}
                  placeholder={t('set_pickup_location')}
                  onPress={(data) => setPickupLocation(data.description)}
                  query={{
                    key: 'AIzaSyAKwc_liBJuKwkEuftyfFN-rJWpsWOQJjw',
                    language: isRTL ? 'ar' : 'en',
                    components: 'country:qa',
                  }}
                  fetchDetails={true}
                  debounce={300}
                  onFail={(error) => {
                    console.error('❌ Places API Error:', error);
                    console.error('Error type:', typeof error);
                    console.error('Error details:', JSON.stringify(error, null, 2));
                  }}
                  onNotFound={() => {
                    console.warn('⚠️ No places found for the search query');
                  }}
                  enablePoweredByContainer={false}
                  textInputProps={{
                    placeholderTextColor: '#8e8e8e',
                    onChange: (e) => setPickupLocation(e?.nativeEvent?.text),
                    value: pickupLocation,
                  }}
                  styles={{
                    textInputContainer: {
                      paddingHorizontal: 10,
                    },
                    textInput: {
                      height: 46,
                      fontSize: 16,
                      color: StyleGuide.color.black,
                      textAlign: isRTL ? 'right' : 'left'
                    },
                    listView: {
                      backgroundColor: 'red',
                    },
                  }}
                />
              </View>
            </View>
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_reservation_time')}</Text>
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


        {/* <Text style={styles.servicesTitle}>Select Your Ride</Text>
        <View style={styles.servicesContainer}>
  {services.map((service, index) => {
    const isSelected = selectedService === service.id;
    return (

    <TouchableOpacity
      key={index}
      onPress={() => setSelectedService(service.id)}
      style={[
        styles.serviceButtonSecondary,
        { marginHorizontal: 0 },
        service.extraStyle,
        isSelected && styles.selectedButton, 
      ]}
    >
      <Svg xml={service.icon} rest={{ height: 62, width: 52 }} />
      <Text style={styles.serviceText}>{service.text}</Text>
    </TouchableOpacity>
  )})}
</View> */}
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
      <AppButton onPress={handleNextButton} title={t('next')}/>
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
});

export default BookRide;
