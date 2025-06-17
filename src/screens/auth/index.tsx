import React, { useState } from 'react';
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
} from 'react-native';
import PhoneInput from './components/phoneInput';
import SocialLogin from './components/socialComponent';
import CountryCodeModal from './components/countryCode';
import AppButton from '../../lib/component/AppButton';
import styles from './auth.styles';
import Svg from '../../lib/svg';
import { check } from '../../../assets/svgAssets';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Signup from './signup';
import { RootStackParamList } from '../../navigation/stackNavigation';

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

  const navigation = useNavigation();
  type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'login'>;

  type SignUpScreenProps = {
    route: SignUpScreenRouteProp;
  };
  
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  };

  const handleLogin = () => {
    navigation.navigate('Main');
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
            style={{ width: 130, height: 100 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to ROYAL RIDE</Text>

        {/* Phone Input Component */}
        <PhoneInput
          selectedCountry={selectedCountry}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          onCountryPress={openCountryModal}
        />
        <View style={styles.inputPasswordContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            maxLength={15}
          />
        </View>
        

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.remembermeContainermain}>
            <View style={styles.remembermeContainer}>
              {rememberMe && <Svg xml={check} rest={{ height: 18, width: 18 }} />}
            </View>
            
            <Text style={styles.remembermeText}>Remember Me</Text>
           
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgetPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <AppButton title="Login" onPress={handleLogin} />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.loginLink}>Sign up?</Text>
          </TouchableOpacity>
        </View>

        <SocialLogin onSocialLogin={handleSocialLogin} />
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

export default Login;
