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


const logo=require('../../../assets/images/logo.png')

const ForgetPassword = () => {
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

      const handleOtp=()=>{
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
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo */}
        <View style={[styles.header,{marginVertical: screenWidth * 0.04,marginTop:0 }]} >
        <Image
          source={logo}
          style={{width:130,height:100}}
          resizeMode="contain"
        />
        </View>

        <Text style={[styles.title,{marginBottom: 10,}]}>Forgot Password</Text>

        <Text style={styles.instructions}>Enter your phone number to reset your password.</Text>

        <View style={{marginTop:20 }}/>
        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
        />


<AppButton
style={{marginTop:screenWidth*0.15,width:'100%'}}
        title='Reset'
         onPress={handleOtp}
        />

        

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remembered your password? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Log in</Text>
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


export default ForgetPassword;