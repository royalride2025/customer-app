import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
 
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import PhoneInput from './components/phoneInput';
import SocialLogin from './components/socialComponent';
import CountryCodeModal from './components/countryCode';
import AppButton from '../../lib/component/AppButton';
import styles from './auth.styles';
import Svg from '../../lib/svg';
import { arrowDown, check, lock, eye, eyeOff } from '../../../assets/svgAssets';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import Signup from './signup';
import { I18nManager } from 'react-native';
import { RootStackParamList } from '../../navigation/stackNavigation';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../redux/reduxHooks';
import { setLanguage } from '../../redux/languageSlice';
import { RootState } from '../../redux/store';
import LanguageModal from './components/languageModale';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import { setToken, setUser } from '../../redux/authSlice';
import Toast from 'react-native-toast-message';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import useGoogleLogin from './components/googleLoginComponent';
import { StyleGuide } from '../../../StyleGuide';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type for Country
interface Country {
  name: string;
  code: string;
  flag: string;
  id: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const logo = require('../../../assets/images/logo.png');

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: 'Qatar',
    code: '+974',
    flag: '🇶🇦',
    id: 'QA',
  });
  const [isCountryModalVisible, setIsCountryModalVisible] = useState<boolean>(false);
  const [languageModalVisible, setLanguageModalVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();
  type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'login'>;

  const { t, i18n } = useTranslation();
  const language = useAppSelector((state: RootState) => state.language.language);
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { flexDirection, marginRightOrLeft } = useTranslationStyles();
  const dispatch = useAppDispatch();

  // Use the Google Login hook
  const { googleLogin, googleLoading, userInfo, checkSignedIn, signOut } = useGoogleLogin();

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Determine identifier (email or phone)
      const identifier = phoneNumber.includes('@')
        ? phoneNumber
        : `${selectedCountry.code.replace('+', '')}${phoneNumber.replace(/\D/g, '')}`;
      const body = {
        identifier,
        password,
        platform: 'customer_app', // or 'driver_app' | 'admin_panel' as needed
      };
      console.log('body',body)
      const response = await networkClient.post(API_ENDPOINTS.LOGIN, body);
      if (response.data && response.data.token) {
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        Toast.show({ type: 'success', text1: 'Success', text2: response?.data?.message });
        navigation.navigate('Main', { screen: 'Home' });
      } else {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid response from server.' });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('signUp');
  };

  const handleForgetPassword = () => {
    navigation.navigate('forgetPassword');
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

  const handleLanguageSelect = (language: 'en' | 'ar') => {
    i18n
      .changeLanguage(language)
      .then(() => {
        dispatch(setLanguage(language)); // Update Redux state
      })
      .catch((err) => console.log(err));

    setLanguageModalVisible(false);
  };

  // Listen to changes in the language and RTL settings
  useEffect(() => {
    console.log('Language or RTL changed:', language, isRTL);
  }, [language, isRTL]);

  

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)} // Open language modal
            style={{
              backgroundColor: '#f0f0f0',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
              marginBottom: 20,
              position: 'absolute',
              top: 10,
              right: 0,
              flexDirection: 'row',
            }}
          >
            <Text style={{ fontSize: 18, color: '#333' }}>{t('language')}</Text>
            <Svg xml={arrowDown} rest={{ height: 12, width: 12, style: { marginLeft: 5 } }} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image
              source={logo}
              style={{ width: 110, height: 90 }}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t("welcome_message")}</Text>

          <PhoneInput
            selectedCountry={selectedCountry}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            onCountryPress={openCountryModal}
            isRTL={isRTL}
          />
          <View style={[styles.inputPasswordContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {/* <Svg xml={lock} rest={{ height: 20, width: 20, style: { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, alignSelf: 'center' } }} /> */}
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

          <View style={[styles.forgotPasswordContainer, flexDirection]}>
            {/* <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={[styles.remembermeContainermain, flexDirection]}>
              <View style={[styles.remembermeContainer,marginRightOrLeft]}>
                {rememberMe && <Svg xml={check} rest={{ height: 18, width: 18 }} />}
              </View>

              <Text style={[styles.remembermeText, marginRightOrLeft]}>
                {t('remember_me')}
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={handleForgetPassword}>
              <Text style={styles.forgotPasswordText}>{t('forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            title={t('login')}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
          />
          
          {/* Optional: Keep the official Google Sign-in Button */}
          {/* <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={googleLogin}
            disabled={googleLoading}
          /> */}

          <View style={[styles.loginContainer, flexDirection]}>
            <Text style={styles.loginText}>{t('dont_have_account')}</Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.loginLink}>{t('signup')}</Text>
            </TouchableOpacity>
          </View>
          {googleLoading ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color={StyleGuide.color.primary} /></View>:<SocialLogin onSocialLogin={handleSocialLogin} />}

          
        </ScrollView>

        <LanguageModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={language}
        />

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

export default Login;