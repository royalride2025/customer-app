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
  ActivityIndicator,
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
import Toast from 'react-native-toast-message';
import { profile, lock, eye, eyeOff } from '../../../assets/svgAssets';
import Svg from '../../lib/svg';
import useGoogleLogin from './components/googleLoginComponent';

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
  const [showPassword, setShowPassword] = useState(false);


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
  const { googleLogin, googleLoading, userInfo, checkSignedIn, signOut } = useGoogleLogin();

  const handleSignUp = async () => {
    if (!userName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your name' });
      return;
    }
    if (!phoneNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your mobile number' });
      return;
    }
   
    if (!password.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your password' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = {
        phone: `${selectedCountry.code.replace('+', '')}${phoneNumber}`,
        password,
        profile: { name: userName }
      };
      const response = await networkClient.post(API_ENDPOINTS.REGISTER, body);
      console.log('Signup response:', response);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
      setTimeout(() => {
        (navigation as any).navigate('login');
      }, 1200);
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
 

const handleSocialLogin = (platform: string) => {
  if (platform === 'google') {
    googleLogin();
  } else {
    Alert.alert(platform, `Continue with ${platform}`);
  }
};

  const openCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  const closeCountryModal = () => {
    setIsCountryModalVisible(false);
  };

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
          <View style={styles.header}>
          <Image
            source={logo}
            style={{width:130,height:100}}
            resizeMode="contain"
          />
          </View>

          <Text style={styles.title}>{t("createAccount")}</Text>

          <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
        <Svg xml={profile} rest={{ height: 20, width: 20, style: { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, alignSelf: 'center' } }} />
        <TextInput
          style={[
            styles.phoneInput,
            {
              writingDirection: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('userName')}
          placeholderTextColor="#999"
          value={userName}
          onChangeText={setUserName}
          secureTextEntry={false}
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
           <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
        <Svg xml={lock} rest={{ height: 20, width: 20, style: { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, alignSelf: 'center' } }} />
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
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ alignSelf: 'center', marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
          <Svg xml={showPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
        </TouchableOpacity>
      </View>
          

         <AppButton
  title={t('signup')}
  onPress={handleSignUp}
  disabled={loading}
  loading={loading}
/>
          {error ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</Text> : null}

          <View style={[styles.loginContainer,flexDirection]}>
            <Text style={styles.loginText}>{t("haveAccount")} </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>{t("login")}</Text>
            </TouchableOpacity>
          </View>

          {googleLoading ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color={StyleGuide.color.primary} /></View>:<SocialLogin onSocialLogin={handleSocialLogin} />}

        

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
      <Toast />
    </>
  );
};


export default Signup;