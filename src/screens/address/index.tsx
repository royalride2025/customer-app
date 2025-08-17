import React, { cloneElement, useEffect, useRef, useState } from 'react';
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
  Alert,
  TextInput,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Slider from '@react-native-community/slider';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

import { t } from 'i18next';

import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { RootState } from '../../redux/store';
import { useAppSelector } from '../../redux/reduxHooks';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import { StyleGuide } from '../../../StyleGuide';
import Svg from '../../lib/svg';
import { inputCross, locationBlackIcon } from '../../../assets/svgAssets';
import AppButton from '../../lib/component/AppButton';
import { SCREEN_WIDTH } from '../../lib/responsiveStyles';
import { screenHeight, screenWidth } from '../../utils/dimenstions';


const ManageAddress = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { address: initialAddress, action } = route.params || {}; // Retrieve address and action from params
  const [address, setAddress] = useState(initialAddress?.address || ''); // Initialize address field
  const [label, setLabel] = useState(initialAddress?.label || ''); // Initialize label field
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    address: '',
    latitude: initialAddress?.latitude || null,
    longitude: initialAddress?.longitude || null,
  });
console.log('initialAddress,',initialAddress)
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const isRTL = useAppSelector((state) => state.language.isRTL); 
  useScreenHeader({ title:'Address Manage', });

console.log('route',route)
  useEffect(() => {
    // Set initial values for address fields if editing
    if (action === 'edit' && initialAddress) {
      setAddress(initialAddress.address);
      setLabel(initialAddress.label);
      setAddressData({
        address: initialAddress.address,
        latitude: initialAddress.latitude,
        longitude: initialAddress.longitude,
      });
    }
  }, [action, initialAddress]);

  const handleSubmitAddress = async () => {
    // Validate required fields
    if (!address || !label) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in both the address and label.',
      });
      return;
    }

    setLoading(true);
    try {
      const body = {
        label,
        coordinates: {
          lat: addressData.latitude,
          lng: addressData.longitude,
        },
        address: addressData.address,
      };

      let response;
      if (action === 'edit') {
        // Edit address API call
        response = await networkClient.put(`${API_ENDPOINTS.UPDATE_ADDRESS(initialAddress?.id)}`, body);
      } else {
        // Add new address API call
        response = await networkClient.post(API_ENDPOINTS.ADD_ADDRESS, body);
      }

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
        });
        navigation.goBack(); // Go back after success
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.error || 'Something went wrong.',
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Failed to submit address';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };
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
        top: SCREEN_WIDTH*0.01,
      }} >
        <GooglePlacesAutocomplete
          ref={googlePlaceAutoCompleteRef}
          placeholder={'Address'}
          textInputProps={{

            placeholderTextColor: '#8e8e8e',
            value: address,
            autoCorrect: false,
            onChange(e) {
              setAddress(e.nativeEvent.target)
            },
          }}
          styles={{ textInput: { fontSize: 16, color: 'black', height: 50 }, listView: { position: 'absolute', top: screenWidth * 0.15 } }}
          onPress={(data, details = null) => {
            setAddress(data.description)
            if (details) {
              const { lat, lng } = details.geometry.location;
              const address = data.description;

              // Save to state
              setAddressData({
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
            address ? (
              <TouchableOpacity
                onPress={() => {
                  setAddress('');
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
      <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20, style: { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, alignSelf: 'center' } }} />
        <TextInput
          style={[
            styles.phoneInput,
            {
              writingDirection: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={'Lable'}
          placeholderTextColor="#999"
          value={label}
          onChangeText={setLabel}
        />

      </View>




      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <AppButton
          loading={loading}
          title={action === 'edit' ? 'Save Changes' : 'Add Address'}
          onPress={handleSubmitAddress}
        />
      </View>
      <Toast />
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

  buttonContainer: {
    marginBottom: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '100%',
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    backgroundColor: StyleGuide.color.white,
    marginTop: screenWidth * 0.28,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minHeight: screenHeight * 0.07,
  },
  phoneInput: {
    flex: 1,
    fontSize: screenWidth * 0.03,
    color: '#858586',
    paddingVertical: 16,
    fontFamily: StyleGuide.fontFamily.medium,
  },

});

export default ManageAddress;