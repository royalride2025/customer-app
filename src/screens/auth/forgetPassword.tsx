// RoyalRideSignup.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import PhoneInput from './components/phoneInput';
import CountryCodeModal from './components/countryCode';
import AppButton from '../../lib/component/AppButton';
import styles from './auth.styles';
import { useNavigation } from '@react-navigation/native';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { screenHeight, screenWidth } from '../../utils/dimenstions';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { t } from 'i18next';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import Toast from 'react-native-toast-message';


const logo = require('../../../assets/images/logo.png')

const ForgetPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Qatar',
    code: '+974',
    flag: '🇶🇦',
    id: 'QA'
  });
  const navigation = useNavigation()
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };
  const handleLogin = () => {
    navigation.navigate('login')
  }
  const handleGetOtp = async () => {
    navigation.navigate('otp',{phone:`${selectedCountry.code.replace('+', '')}${phoneNumber}`})
  
    if (!phoneNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your mobile number' });
      return;
    }
   
   
    setLoading(true);
    setError('');
    try {
      const body = {
        phone: `${selectedCountry.code.replace('+', '')}${phoneNumber}`,
    
      };
      console.log('otppppbody',body)
      const response = await networkClient.post(API_ENDPOINTS.GET_OTP, body);
      console.log('Signup response:', response);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
      setTimeout(() => {
        navigation.navigate('otp',{phone:`${selectedCountry.code.replace('+', '')}${phoneNumber}`})
      }, 500);
      // Optionally navigate to login or main screen
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Signup failed';
      setError(message);
      Toast.show({ type: 'error', text1: 'Error', text2: message });
      console.log('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };
 

  const handleOtp = () => {
    navigation.navigate('otp')
  }

  //   const handleLogin = () => {
  //     Alert.alert('Login', 'Redirecting to login...');
  //   };


  const openCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  const closeCountryModal = () => {
    setIsCountryModalVisible(false);
  };

  useScreenHeader({
    title: 'Forget Password',

  });

  const { flipImage,flexDirection } = useTranslationStyles()
  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo */}
        <View style={[styles.header, { marginVertical: screenWidth * 0.04,  marginTop: screenHeight * 0.09, }]} >
          <Image
            source={logo}
            style={[{ width: 130, height: 100 }]}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { marginBottom: 10, }]}>{t("forgotPassword")}</Text>

        <Text style={styles.instructions}>{t("enterPhoneToResetPassword")}</Text>

        <View style={{ marginTop: 20 }} />
        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
          isRTL={isRTL}
        />


        <AppButton
          style={{ marginTop: screenWidth * 0.12, width: '100%' }}
          title={t('reset')}
          onPress={handleGetOtp}
          loading={loading}
          disabled={loading}
        />



        <View style={[styles.loginContainer,flexDirection]}>
          <Text style={styles.loginText}>{t("rememberedPassword")}  </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>{t("login")}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <CountryCodeModal
        visible={isCountryModalVisible}
        onClose={closeCountryModal}
        onSelectCountry={handleCountrySelect}
        selectedCountry={selectedCountry}
      />
    </SafeAreaView>
      <Toast />
      </>

  );
};


export default ForgetPassword;