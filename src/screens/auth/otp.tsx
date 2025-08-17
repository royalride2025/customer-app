import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Platform, View, StatusBar, Image, TextInput, TouchableOpacity } from 'react-native';
import type { TextInputProps } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { screenHeight, screenWidth } from '../../utils/dimenstions';
import styles from './auth.styles';
import AppButton from '../../lib/component/AppButton';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { t } from 'i18next';
import Svg from '../../lib/svg';
import { eye, eyeOff, lock } from '../../../assets/svgAssets';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import Toast from 'react-native-toast-message';



const CELL_COUNT = 4;
const logo = require('../../../assets/images/logo.png')
const Otp = () => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [loading, setLoading] = useState(false);
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  

  const route=useRoute()

  const phone=route?.params?.phone
  console.log("phone---",phone)
  const navigation=useNavigation()

  const handleOtpSubmit = async () => {
  
   
   
   
    setLoading(true);
    
    try {
      const body = {
        phone: phone,
        otp: value,
        newPassword: password,
        confirmPassword: confirmPassword
    
      };
      console.log('otppppbody',body)
      const response = await networkClient.post(API_ENDPOINTS.RESET_PASSWORD, body);
      console.log('Signup response:', response);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
      (navigation as any).navigate('login')
      // Optionally navigate to login or main screen
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Signup failed';
   
      Toast.show({ type: 'error', text1: 'Error', text2: message });
      console.log('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };
 

  // const handleOtpSubmit = () => {
  //   console.log('okko')
  // }
  useScreenHeader({
    title: 'Otp Verification',

  });
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={[styles.header, { marginVertical: screenWidth * 0.04, marginTop: screenHeight * 0.09, }]}>
        <Image
          source={logo}
          style={{ width: 130, height: 100 }}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.title, { marginBottom: 10, }]}>{t('verifyOtp')}</Text>

      <Text style={styles.instructions}>{t('enterOtpInstructions')}</Text>
      <View style={{ width: screenWidth * 0.72, alignSelf: 'center', marginTop: screenWidth * 0.03 }}>
        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          placeholderTextColor="#000"
          placeholder={'5'}
          renderCell={({ index, symbol, isFocused }) => (
            <View style={styles.cell}>
              <Text key={index} style={[styles.cell, isFocused && styles.focusCell]} onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />
        
      </View>
      <View style={{marginTop:screenHeight*0.03}}>

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
            placeholder={t("confirmPassword")}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ alignSelf: 'center', marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
            <Svg xml={showPassword ? eyeOff : eye} rest={{ height: 20, width: 20 }} />
          </TouchableOpacity>
        </View>
      </View>
      <AppButton
        style={{ marginTop: screenWidth * 0.15 }}
        title={t('submit')}
        onPress={handleOtpSubmit}
loading={loading}
disabled={loading}
      />
    </SafeAreaView>
  );
};

export default Otp;
