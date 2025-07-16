// RoyalRideSignup.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import PhoneInput from './components/phoneInput';
import SocialLogin from './components/socialComponent';
import CountryCodeModal from './components/countryCode';
import { StyleGuide } from '../../../StyleGuide';
import AppButton from '../../lib/component/AppButton';
import styles from './auth.styles';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import axios from 'axios';

const logo=require('../../../assets/images/logo.png')

const Signup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Qatar',
    code: '+974',
    flag: '🇶🇦',
    id: 'QA'
  });
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>('');


const navigation=useNavigation()
const { t, i18n } = useTranslation();
  const language = useAppSelector((state: RootState) => state.language.language)
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { flexDirection, marginRightOrLeft } = useTranslationStyles();
 
  const handleCountrySelect = (country:any) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };
  const handleLogin = () => {
    (navigation as any).navigate('login');
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = 'http://ec2-51-20-81-158.eu-north-1.compute.amazonaws.com/api/auth/register-customer';

  const handleSignUp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = 'https://ec2-51-20-81-158.eu-north-1.compute.amazonaws.com/api/auth/register-customer';
      const body = {
        phone: `${selectedCountry.code.replace('+', '')}${phoneNumber}`,
        password,
        profile: { name: userName }
      };
      console.log('Signup URL:', url);
      console.log('Signup body:', body);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      const data = await response.json();
      Alert.alert('Success', 'Account created successfully!');
      // Optionally navigate to login or main screen
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      Alert.alert('Error', err.message || 'Signup failed');
      console.log('Fetch signup error:', err);
    } finally {
      setLoading(false);
    }
  };
 

//   const handleLogin = () => {
//     Alert.alert('Login', 'Redirecting to login...');
//   };

  const handleSocialLogin = (platform:any) => {
    Alert.alert(platform, `Continue with ${platform}`);
  };

  const openCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  const closeCountryModal = () => {
    setIsCountryModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo */}
        <View style={styles.header}>
        <Image
          source={logo}
          style={{width:130,height:100}}
          resizeMode="contain"
        />
        </View>

        <Text style={styles.title}>{t("createAccount")}</Text>

        <View style={styles.inputPasswordContainer}>
          <TextInput
            style={[
              styles.phoneInput,
              {
                writingDirection: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={'user'}
            placeholderTextColor="#999"
            value={userName}
            onChangeText={setUserName}
            secureTextEntry={true}
          />
        </View>

        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
          // flexDirection={flexDirection}
          isRTL={isRTL}
        />
         <View style={styles.inputPasswordContainer}>
          <TextInput
            style={[
              styles.phoneInput,
              {
                writingDirection: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={t("password")}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>
        

        <AppButton
          title={loading ? t('loading') : t('signup')}
          onPress={handleSignUp}
          disabled={loading}
        />
        {error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</Text> : null}

        <View style={[styles.loginContainer,flexDirection]}>
          <Text style={styles.loginText}>{t("haveAccount")} </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>{t("login")}</Text>
          </TouchableOpacity>
        </View>

        <SocialLogin onSocialLogin={handleSocialLogin} />

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>{t("byRegisteringAgree")} <Text style={styles.termsLink}>{t("our")}</Text> </Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>{t("ourTermsPrivacyPolicy")}</Text>
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
  );
};


export default Signup;