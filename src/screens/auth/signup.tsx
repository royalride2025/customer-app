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
const navigation=useNavigation()
const { t, i18n } = useTranslation();
  const language = useAppSelector((state: RootState) => state.language.language)
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { flexDirection, marginRightOrLeft } = useTranslationStyles();
 
  const handleCountrySelect = (country:any) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };
  const handleLogin=()=>{
    navigation.navigate('login')
      }
  const handleSignUp = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    Alert.alert('Success', `Creating account with ${selectedCountry.code} ${phoneNumber}`);
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

        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
          // flexDirection={flexDirection}
          isRTL={isRTL}
        />

        <AppButton
        title={t('signup')}
         onPress={()=>{}}
        />

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