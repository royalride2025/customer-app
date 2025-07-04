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
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhoneInput = ({ 
  selectedCountry, 
  phoneNumber, 
  onPhoneNumberChange, 
  onCountryPress,
  isRTL
}) => {
  // Get translation styles hook
  const { flexDirection, marginRightOrLeft } = useTranslationStyles();
  
  // Dynamic styles based on RTL
  const containerDirection = isRTL ? 'row-reverse' : 'row';
  const arrowMarginStyles = isRTL 
    ? { marginRight: 0, marginLeft: 7 } 
    : { marginLeft: 0, marginRight: 7 };
  
  const countrySelectorStyles = isRTL 
    ? { marginLeft: 12, marginRight: 0 }
    : { marginRight: 12, marginLeft: 0 };

  const flagMarginStyles = isRTL
    ? { marginLeft: 8, marginRight: 0 }
    : { marginRight: 8, marginLeft: 0 };

  const codeMarginStyles = isRTL
    ? { marginLeft: 4, marginRight: 0 }
    : { marginRight: 4, marginLeft: 0 };

  return (
    <View style={[styles.inputContainer, { flexDirection: containerDirection }]}>
      
      <TouchableOpacity 
        style={[
          styles.countrySelector, 
          countrySelectorStyles,
          { flexDirection: isRTL ? 'row-reverse' : 'row' }
        ]} 
        onPress={onCountryPress}
      >
        <Svg 
          xml={arrowDown} 
          rest={{
            height: 14,
            width: 14,
            marginTop: 7,
            ...arrowMarginStyles
          }}
        />
        <Text style={[styles.countryFlag, flagMarginStyles]}>
          {selectedCountry.flag}
        </Text>
        <Text style={[styles.countryCode, codeMarginStyles]}>
          {selectedCountry.code}
        </Text>
      </TouchableOpacity>
      
      <TextInput
        style={[
          styles.phoneInput,
          { 
            writingDirection: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
            textAlignVertical: 'center' // For Android
          }
        ]}
        placeholder={t('enterMobileNumber')}
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
    backgroundColor: StyleGuide.color.white,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minHeight: screenHeight * 0.07, // 7% of screen height
  },
  countrySelector: {
    alignItems: 'center',
    backgroundColor: StyleGuide.color.white,
    width: screenWidth * 0.25, // 25% of screen width
  },
  countryFlag: {
    fontSize: screenWidth * 0.075, // Max 20px, scales with screen
  },
  countryCode: {
    fontSize: screenWidth * 0.032, // Max 16px, scales with screen
    color: '#000',
    fontFamily: StyleGuide.fontFamily.bold
  },
  phoneInput: {
    flex: 1,
    fontSize: screenWidth * 0.03, // Max 16px, scales with screen
    color: '#858586',
    paddingVertical: 16,
    fontFamily: StyleGuide.fontFamily.medium
  },
});

export default PhoneInput;