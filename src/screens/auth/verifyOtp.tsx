import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  Text, 
  StyleSheet, 
  Platform, 
  View, 
  StatusBar, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Keyboard,
  Alert,
  BackHandler 
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { screenHeight, screenWidth } from '../../utils/dimenstions';
import styles from './auth.styles';
import AppButton from '../../lib/component/AppButton';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { t } from 'i18next';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../redux/reduxHooks';
import { updateUser } from '../../redux/profileSlice';
import { setUser } from '../../redux/authSlice';
import PhoneInput from './components/phoneInput';
import CountryCodeModal from './components/countryCode';
import { countries } from '../../constant/countries';
import Svg from '../../lib/svg';
import { backArrow } from '../../../assets/svgAssets';

// Define the route params type
type VerifyOtpRouteParams = {
  phone?: string;
  isFromSignup?: boolean;
  isGoogleUser?: boolean;
};

const CELL_COUNT = 4;
const logo = require('../../../assets/images/logo.png');

const VerifyOtp = () => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Phone number state for Google users
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Qatar',
    code: '+974',
    flag: '🇶🇦',
    id: 'QA'
  });
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Refs for scrolling to fields
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

  const route = useRoute<RouteProp<{ params: VerifyOtpRouteParams }, 'params'>>();
  const phone = route?.params?.phone;
  const isFromSignup = route?.params?.isFromSignup || false;
  const isGoogleUser = route?.params?.isGoogleUser || false;
  const profile = useAppSelector((state: RootState) => state.profile.data);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  console.log("phone---", phone);
  console.log("isFromSignup---", isFromSignup);
  console.log("isGoogleUser---", isGoogleUser);

  // Initialize phone number for Google users
  useEffect(() => {
    if (isGoogleUser && !phone) {
      // Google user without phone number
      console.log("Google user without phone number");
    }
  }, [isGoogleUser, phone]);

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Mobile number is required';
    return '';
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };

  const openCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  const closeCountryModal = () => {
    setIsCountryModalVisible(false);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start countdown when component mounts
  useEffect(() => {
    setCountdown(60); // 60 seconds countdown
  }, []);

  // Handle hardware back button for Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isFromSignup) {
          (navigation as any).navigate('login');
        } else {
          (navigation as any).goBack();
        }
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [isFromSignup, navigation])
  );

  // Function to scroll to a specific field
  const scrollToField = (fieldRef: React.RefObject<TextInput | null>) => {
    if (fieldRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollToFocusedInput(fieldRef.current);
    }
  };

  const handleOtpSubmit = async () => {
    Keyboard.dismiss();
    
    if (!value.trim() || value.length !== 4) {
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Please enter a valid 4-digit OTP code' 
      });
      return;
    }

    // For Google users without phone number, validate phone input
    let phoneToUse = phone;
    if (isGoogleUser && !phone) {
      const phoneErr = validatePhone(phoneNumber);
      setPhoneError(phoneErr);
      if (phoneErr) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: phoneErr 
        });
        return;
      }
      phoneToUse = `${selectedCountry.code.replace('+', '')}${phoneNumber}`;
    }

    setLoading(true);

    try {
      const body = {
        phone: phoneToUse||`${profile?.user.phone}`,
        otp: value,
      };
      
      console.log('OTP verification body:', body);
      const response = await networkClient.post(API_ENDPOINTS.NEW_VERIFY_OTP, body);
      console.log('OTP verification response:', response);
      
      if (response.data) {
        Toast.show({ 
          type: 'success', 
          text1: 'Success', 
          text2: response?.data?.message || 'Phone number verified successfully!' 
        });
        
        // Update user verification status in Redux if available
        // if (response.data.user) {
        //   dispatch(updateUser({ is_verified: true }));

        //   dispatch(setUser({ ...response.data.user, is_verified: true }));
        // }
        
        setTimeout(() => {
          if (isFromSignup) {
            // Navigate to login after successful verification from signup
            (navigation as any).navigate('login');
          } else {
            // Navigate back to profile or main screen if from profile
            (navigation as any).goBack();
          }
        }, 1500);
      }
    } catch (err: any) {
      console.log('OTP verification error:', err);
      const message = err?.response?.data?.message || err.message || 'OTP verification failed';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      Toast.show({
        type: 'info',
        text1: 'Wait',
        text2: `Please wait ${countdown} seconds before requesting a new OTP`
      });
      return;
    }

    // For Google users without phone number, validate phone input
    let phoneToUse = phone;
    if (isGoogleUser && !phone) {
      const phoneErr = validatePhone(phoneNumber);
      setPhoneError(phoneErr);
      if (phoneErr) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: phoneErr 
        });
        return;
      }
      phoneToUse = `${selectedCountry.code}${phoneNumber}`||`${selectedCountry.code}${profile?.user.phone}`;
    }

    setResendLoading(true);

    try {
      const body = {
        phone: phoneToUse,
      };
      
      console.log('Resend OTP body:', body);
      const response = await networkClient.post(API_ENDPOINTS.GET_OTP, body);
      console.log('Resend OTP response:', response);
      
      Toast.show({ 
        type: 'success', 
        text1: 'Success', 
        text2: 'OTP sent successfully to your phone number' 
      });
      
      // Reset countdown
      setCountdown(60);
      
    } catch (err: any) {
      console.log('Resend OTP error:', err);
      const message = err?.response?.data?.message || err.message || 'Failed to resend OTP';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setResendLoading(false);
    }
  };

  // Handle back button navigation
  const handleBackPress = () => {
    if (isFromSignup) {
      // If from signup, go back to login
      (navigation as any).navigate('login');
    } else {
      // If from profile or other screens, go back
      (navigation as any).navigate('Main', { screen: 'Home' });
    }
  };

  // Configure screen header with custom back button functionality
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Verify Phone Number',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginHorizontal: 16 }}
          onPress={handleBackPress}
        >
          <Svg xml={backArrow} rest={{ height: 24, width: 24 }} />
        </TouchableOpacity>
      ),
      headerTitleStyle: {
        color: '#333',
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
      },
    });
  }, [navigation, handleBackPress]);

  const isFormValid = value.trim().length === 4 && 
    (!isGoogleUser || !phone || phoneNumber.trim().length > 0);

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={100}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 90}
        keyboardOpeningTime={250}
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { marginBottom: screenWidth * 0.04, marginTop: screenHeight * 0.01 }]}>
            <Image
              source={logo}
              style={{ width: 110, height: 90 }}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.title, { marginBottom: 10 }]}>
            {t('verifyPhoneNumber')}
          </Text>

          <Text style={styles.instructions}>
            {isGoogleUser && !phone 
              ? t('enterOtpInstructionsForGoogle') 
              : `${t('enterOtpInstructions')} ${phone || ''}`
            }
          </Text>
          
          {/* Phone Number Input for Google Users */}
          {isGoogleUser && !phone && (
            <View style={verifyOtpStyles.phoneInputSection}>
              <Text style={verifyOtpStyles.phoneInputLabel}>{t('enterYourPhoneNumber')}</Text>
              <PhoneInput
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                selectedCountry={selectedCountry}
                onCountryPress={openCountryModal}
                isRTL={isRTL}
              />
            </View>
          )}
          
          {/* OTP Input */}
          <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TextInput
              ref={otpInputRef}
              style={[
                styles.phoneInput,
                {
                  writingDirection: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={t('enter4DigitOtp')}
              placeholderTextColor="#999"
              value={value}
              onChangeText={setValue}
              keyboardType="number-pad"
              maxLength={4}
              onFocus={() => scrollToField(otpInputRef)}
            />
          </View>

          {/* Resend OTP Section */}
          <View style={verifyOtpStyles.resendSection}>
            <Text style={verifyOtpStyles.resendText}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={countdown > 0 || resendLoading}
              style={verifyOtpStyles.resendButton}
            >
              <Text style={[
                verifyOtpStyles.resendButtonText,
                (countdown > 0 || resendLoading) && verifyOtpStyles.resendButtonDisabled
              ]}>
                {resendLoading 
                  ? 'Sending...' 
                  : countdown > 0 
                    ? `Resend in ${countdown}s` 
                    : 'Resend OTP'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Button with proper spacing for keyboard */}
        <View style={{ 
          paddingTop: 40,
          paddingBottom: 30,
          minHeight: 100,
        }}>
          <AppButton
            style={{ 
              alignSelf: 'stretch',
              width: '100%'
            }}
            title={t('verify')}
            onPress={handleOtpSubmit}
            loading={loading}
            disabled={loading || !isFormValid}
          />
        </View>
      </KeyboardAwareScrollView>
      
      {/* Country Code Modal */}
      <CountryCodeModal
        visible={isCountryModalVisible}
        onClose={closeCountryModal}
        onSelectCountry={handleCountrySelect}
        selectedCountry={selectedCountry}
      />
      
      <Toast />
    </SafeAreaView>
  );
};

const verifyOtpStyles = StyleSheet.create({
  resendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  resendButton: {
    marginLeft: 5,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  resendButtonDisabled: {
    color: '#999',
  },
  phoneInputSection: {
    marginBottom: 20,
  },
  phoneInputLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
});

export default VerifyOtp;
