import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Platform, View, StatusBar, Image } from 'react-native';
import type { TextInputProps } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { screenWidth } from '../../utils/dimenstions';
import styles from './auth.styles';
import AppButton from '../../lib/component/AppButton';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { t } from 'i18next';



const CELL_COUNT = 4;
const logo=require('../../../assets/images/logo.png')
const Otp = () => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleOtpSubmit=()=>{
    console.log('okko')
  }
  useScreenHeader({
    title: 'Otp Verification',
    
  });
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={[styles.header,{marginVertical: screenWidth * 0.04,marginTop:0 }]}>
        <Image
          source={logo}
          style={{width:130,height:100}}
          resizeMode="contain"
        />
        </View>

        <Text style={[styles.title,{marginBottom: 10,}]}>{t('verifyOtp')}</Text>

        <Text style={styles.instructions}>{t('enterOtpInstructions')}</Text>
      <View style={{ width: screenWidth * 0.72, alignSelf: 'center',marginTop :screenWidth * 0.03}}>
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
              <Text key={index} style={[styles.cell, isFocused && styles.focusCell ]} onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />
      </View>
      <AppButton
style={{marginTop:screenWidth*0.15}}
        title={t('submit')}
         onPress={handleOtpSubmit}
        />
    </SafeAreaView>
  );
};

export default Otp;
