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


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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

        <Text style={styles.title}>Create account</Text>

        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
        />

        <AppButton
        title='Sign up'
         onPress={()=>{}}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Log in?</Text>
          </TouchableOpacity>
        </View>

        <SocialLogin onSocialLogin={handleSocialLogin} />

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By registering you agree to <Text style={styles.termsLink}>our</Text> </Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>our terms and privacy policy</Text>
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