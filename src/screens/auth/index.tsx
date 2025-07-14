import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  Pressable,
} from 'react-native';
import PhoneInput from './components/phoneInput';
import SocialLogin from './components/socialComponent';
import CountryCodeModal from './components/countryCode';
import AppButton from '../../lib/component/AppButton';
import styles from './auth.styles';
import Svg from '../../lib/svg';
import { arrowDown, check } from '../../../assets/svgAssets';
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
import { setToken } from '../../redux/authSlice';

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
  const navigation: any = useNavigation();
  type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'login'>;

  const { t, i18n } = useTranslation();
  const language = useAppSelector((state: RootState) => state.language.language);
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { flexDirection, marginRightOrLeft } = useTranslationStyles();
  const dispatch = useAppDispatch();

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };

  const handleLogin = async () => {
    try {
      // Determine identifier (email or phone)
      const identifier = phoneNumber.includes('@') ? phoneNumber : phoneNumber.replace(/\D/g, '');
      const body = {
        identifier,
        password,
        platform: 'admin_panel', // or 'driver_app' | 'customer_app' as needed
      };
      const response = await networkClient.post(API_ENDPOINTS.LOGIN, body);
      // Assuming response.data.token contains the token
      if (response.data && response.data.token) {
        dispatch(setToken(response.data.token));
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', 'Invalid response from server.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      Alert.alert('Login Failed', message);
    }
  };

  const handleSignup = () => {
    navigation.navigate('signUp');
  };

  const handleForgetPassword = () => {
    navigation.navigate('forgetPassword');
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert(platform, `Continue with ${platform}`);
  };

  const openCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  const closeCountryModal = () => {
    setIsCountryModalVisible(false);
  };

  const handleLanguageSelect = (language: string) => {
    i18n
      .changeLanguage(language)
      .then(() => {
        dispatch(setLanguage(language)); // Update Redux state
      })
      .catch((err) => console.log(err));

    setLanguageModalVisible(false);
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // This runs every time the screen comes into focus
  //     const currentRTL = I18nManager.isRTL;
  //     console.log('Screen focused - Language:', language, 'isRTL:', isRTL, 'I18nManager.isRTL:', currentRTL);
      
  //     // Ensure layout consistency when screen is focused
  //     if (currentRTL !== isRTL) {
  //       console.log('Layout inconsistency detected, forcing update');
  //       I18nManager.forceRTL(isRTL);
  //     }
  //   }, [language, isRTL])
  // );


  // Listen to changes in the language and RTL settings
  useEffect(() => {
    console.log('Language or RTL changed:', language, isRTL);
  }, [language, isRTL]);

  return (
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
            top: 30,
            right: 15,
            flexDirection: 'row',
          }}
        >
          <Text style={{ fontSize: 18, color: '#333' }}>{t('language')}</Text>
          <Svg xml={arrowDown} rest={{ height: 15, width: 15, style: { marginLeft: 5 } }} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={logo}
            style={{ width: 130, height: 100 }}
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

        <View style={[styles.forgotPasswordContainer, flexDirection]}>
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={[styles.remembermeContainermain, flexDirection]}>
            <View style={[styles.remembermeContainer,marginRightOrLeft]}>
              {rememberMe && <Svg xml={check} rest={{ height: 18, width: 18 }} />}
            </View>

            <Text style={[styles.remembermeText, marginRightOrLeft]}>
              {t('remember_me')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgetPassword}>
            <Text style={styles.forgotPasswordText}>{t('forgot_password')}</Text>
          </TouchableOpacity>
        </View>

        <AppButton title={t('login')} onPress={()=>navigation.navigate('Main')} />

        <View style={[styles.loginContainer, flexDirection]}>
          <Text style={styles.loginText}>{t('dont_have_account')}</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.loginLink}>{t('signup')}</Text>
          </TouchableOpacity>
        </View>

        <SocialLogin onSocialLogin={handleSocialLogin} />
      </ScrollView>

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onLanguageSelect={handleLanguageSelect} // Pass the handler to the modal
        currentLanguage={language}
      />

      <CountryCodeModal
        visible={isCountryModalVisible}
        onClose={closeCountryModal}
        onSelectCountry={handleCountrySelect}
        selectedCountry={selectedCountry}
      />
    </SafeAreaView>
  );
};

export default Login;
