import React, { useState, useRef } from 'react';
import {  Text, StyleSheet, Platform, View, StatusBar, Image, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { TextInputProps } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { screenHeight, screenWidth } from '../../utils/dimenstions';
import styles from './auth.styles';
import AppButton from '../../lib/component/AppButton';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { t } from 'i18next';
import Svg from '../../lib/svg';
import { eye, eyeOff, } from '../../../assets/svgAssets';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the route params type
type OtpRouteParams = {
  phone: string;
};

const CELL_COUNT = 4;
const logo = require('../../../assets/images/logo.png')

const Otp = () => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [loading, setLoading] = useState(false);
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for scrolling to fields
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const route = useRoute<RouteProp<{ params: OtpRouteParams }, 'params'>>()
  const phone = route?.params?.phone
  console.log("phone---", phone)
  const navigation = useNavigation()

  // Function to scroll to a specific field
  const scrollToField = (fieldRef: React.RefObject<TextInput | null>) => {
    if (fieldRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollToFocusedInput(fieldRef.current);
    }
  };

  const handleOtpSubmit = async () => {
    // Validate that all fields are filled
    Keyboard.dismiss()
    if (!value.trim()) {
      console.log('Showing error toast for missing OTP');
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Please enter the OTP code' 
      });
      return;
    }

    if (!password.trim()) {
      console.log('Showing error toast for missing password');
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Please enter your password' 
      });
      return;
    }

    if (!confirmPassword.trim()) {
      console.log('Showing error toast for missing confirm password');
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Please confirm your password' 
      });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log('Showing error toast for password mismatch');
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Passwords do not match' 
      });
      return;
    }

    setLoading(true);

    try {
      const body = {
        phone: phone,
        otp: value,
        newPassword: password,
        confirmPassword: confirmPassword
      };
      console.log('otppppbody', body)
      const response = await networkClient.post(API_ENDPOINTS.RESET_PASSWORD, body);
      console.log('Password reset response:', response);
      console.log('Showing success toast');
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password reset successfully!' });
      (navigation as any).navigate('login')
      // Optionally navigate to login or main screen
    } catch (err: any) {
      console.log('err',err)
      const message = err?.response?.data?.message || err.message || 'Password reset failed';

      console.log('Showing error toast for API error:', message);
      Toast.show({ type: 'error', text1: 'Error', text2: message });
      console.log('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Configure screen header with back button functionality
  useScreenHeader({
    title: 'Otp Verification',
    showBackButton: true, // Enable back button
  });

  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  const isFormValid =
    value.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

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
        extraHeight={100} // Extra space above keyboard
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

            <Text style={[styles.title, { marginBottom: 10 }]}>{t('verifyOtp')}</Text>

            <Text style={styles.instructions}>{t('enterOtpInstructions')}</Text>
            
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
            
            {/* Password Input */}
            <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TextInput
                ref={passwordInputRef}
                style={[
                  styles.phoneInput,
                  {
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left',
                    flex: 1,
                  },
                ]}
                placeholder={t("password")}
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => scrollToField(passwordInputRef)}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={{ 
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                }}
              >
                <Svg xml={showPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TextInput
                ref={confirmPasswordInputRef}
                style={[
                  styles.phoneInput,
                  {
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left',
                    flex: 1,
                  },
                ]}
                placeholder={t("confirmPassword")}
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => scrollToField(confirmPasswordInputRef)}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={{ 
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                }}
              >
                <Svg xml={showConfirmPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Button with proper spacing for keyboard */}
          <View style={{ 
            paddingTop: 40,
            paddingBottom: 30,
            minHeight: 100, // Ensure minimum space for button
          }}>
            <AppButton
              style={{ 
                alignSelf: 'stretch',
                width: '100%'
              }}
              title={t('submit')}
              onPress={handleOtpSubmit}
              loading={loading}
              disabled={loading || !isFormValid}
            />
            
          </View>
        </KeyboardAwareScrollView>
        <Toast />
      </SafeAreaView>
  );
};

export default Otp;