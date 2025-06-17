// PhoneInput.js
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg from '../../../lib/svg';
import { arrowDown } from '../../../../assets/svgAssets';
import { StyleGuide } from '../../../../StyleGuide';
// import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhoneInput = ({ 
  selectedCountry, 
  phoneNumber, 
  onPhoneNumberChange, 
  onCountryPress 
}) => {
  return (
    <View style={styles.inputContainer}>
     
      <TouchableOpacity style={styles.countrySelector} onPress={onCountryPress}>
      <Svg xml={arrowDown} rest={{height:14,width: 14,marginTop: 7,marginRight: 10}}/>
      <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
        <Text style={styles.countryCode}>{selectedCountry.code}</Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.phoneInput}
        placeholder="Enter your Mobile number"
        placeholderTextColor="#999"
        value={phoneNumber}
        onChangeText={onPhoneNumberChange}
        keyboardType="phone-pad"
        maxLength={15}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: StyleGuide.color.white,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
   
    borderWidth:1,
    borderColor:StyleGuide.color.border,
    minHeight: screenHeight * 0.07, // 7% of screen height
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    backgroundColor: StyleGuide.color.white,
    // borderRightWidth: 1,
    // borderRightColor: '#e0e0e0',
    marginRight: 12,
    width: screenWidth * 0.25, // 25% of screen width
 
    
  },
  countryFlag: {
    fontSize: screenWidth * 0.075, // Max 20px, scales with screen
    marginRight: 8,
  },
  countryCode: {
    fontSize:screenWidth * 0.032, // Max 16px, scales with screen
    color: '#000',
    marginRight: 4,
    fontFamily:StyleGuide.fontFamily.bold
  },
  phoneInput: {
    flex: 1,
    fontSize: screenWidth * 0.03, // Max 16px, scales with screen
    color: '#858586',
    paddingVertical: 16,
    fontFamily:StyleGuide.fontFamily.medium
  },
});

export default PhoneInput;