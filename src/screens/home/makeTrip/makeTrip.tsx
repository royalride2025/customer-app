import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import { currentLocationicon, inputCross, locationBlackIcon, locationIcon, locationIconOuter } from '../../../../assets/svgAssets';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { useNavigation } from '@react-navigation/native';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import { screenHeight, screenWidth } from '../../../utils/dimenstions';
import cross from '../../../../assets/svgAssets/cross.svg';

const MakeTripc = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { flexDirection, textAlignment } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  const GOOGLE_PLACES_API_KEY = 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY';
  const navigation = useNavigation()
  const savedAddresses = [
    {
      id: 1,
      name: t('office'),
      address: 'Zone 55 House 10 Street 873 South Muaither Doha',
      distance: '2.7 km',
    },
    {
      id: 2,
      name: t('home'),
      address: 'Zone 55 House 35 Street 873 South Muaither Doha',
      distance: '2.7 km',
    },
    {
      id: 3,
      name: t('wardrobe'),
      address: 'Zone 55 House 89 Street 801 South Muaither Doha',
      distance: '2.7 km',
    },
    {
      id: 4,
      name: t('shop'),
      address: 'Zone 55 House 08 Street 740 South Muaither Doha',
      distance: '2.7 km',
    },
  ];

  const handleAddressSelect = (address) => {
    setFromLocation(address.address);
  };

  const handleCurrentLocation = () => {
    setIsGettingLocation(true);
    setTimeout(() => {
      setFromLocation('Current Location - Zone 45 Street 923 Doha, Qatar');
      setIsGettingLocation(false);
    }, 1500);
  };
  useScreenHeader({
    title: t('header.plan_your_ride'),

  });
  const handleNextButton = () => {
    navigation.navigate('map', { from: 'plan' });  // Navigate to the 'Map' screen and pass parameters
  };
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const toLocationRef = useRef<GooglePlacesAutocompleteRef>(null);
  console.log(fromLocation, "fromLocation")
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
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
          top: 2,
          zIndex: 9999,
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
              onChange(e) {
                setFromLocation(e.nativeEvent.target)
              },
            }}
            styles={{ textInput: { fontSize: 16, color: 'black', height: 50 }, listView: { position: 'absolute', top: screenWidth * 0.28 } }}
            onPress={(data, details = null) => setFromLocation(data.description)}
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
              fromLocation ? (
                <TouchableOpacity
                  onPress={() => {
                    setFromLocation('');
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
              onChangeText: setToLocation,
            }}
            styles={{
              textInput: {
                height: 50,
                fontSize: 16,
                color: StyleGuide.color.black,
                textAlign: isRTL ? 'right' : 'left'
              }, listView: { position: 'absolute', top: 50 }
            }}
            onPress={(data, details = null) => setToLocation(data.description)}
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
              toLocation ? (
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
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


        <View style={styles.savedAddressesContainer}>
          <View style={[styles.savedAddressesHeader, flexDirection]}>
            <Text style={styles.savedAddressesTitle}>{t('saved_addresses')}</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>{t('add')}</Text>
            </TouchableOpacity>
          </View>

          {savedAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={styles.addressItem}
              onPress={() => handleAddressSelect(address)}
            >
              <View style={[styles.addressContent, flexDirection]}>
                <Svg xml={locationIcon} rest={{ height: 20, width: 20, marginTop: 7, }} />
                <View style={[styles.addressDetails, isRTL ? { marginRight: 13 } : { marginLeft: 13, }]}>
                  <Text style={[styles.addressName, textAlignment]}>{address.name}</Text>
                  <Text style={[styles.addressText, textAlignment]}>{address.address}</Text>
                </View>
                <Text style={[styles.addressDistance, textAlignment]}>{address.distance}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <AppButton onPress={handleNextButton} title={t('next')} />
      </View>
    </SafeAreaView>
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
  content: { flex: 1, marginTop: screenHeight * 0.16 },
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
});
