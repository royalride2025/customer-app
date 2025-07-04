import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Svg from '../../../lib/svg';
import { applePay, atmCard } from '../../../../assets/svgAssets';
import { StyleGuide } from '../../../../StyleGuide';
import { screenWidth } from '../../../utils/dimenstions';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { useTranslation } from 'react-i18next';

const PaymentMethods = () => {
  const [selectedMethod, setSelectedMethod] = useState('apple_pay');
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { t } = useTranslation();

  const paymentMethods = [
    {
      id: 'apple_pay',
      title: t('payment.apple_pay') || 'Apple Pay',
      titleKey: 'payment.apple_pay',
      icon: applePay,
      subtitle: null,
      rightElement: t('payment.charge_wallet') || 'Charge Wallet',
      rightElementKey: 'payment.charge_wallet',
    },
    {
      id: 'card',
      title: t('payment.card_payment') || 'Card Payment',
      titleKey: 'payment.card_payment',
      icon: atmCard,
      subtitle: t('payment.card_subtitle') || 'Pay later at your destination using your debit/credit card.',
      subtitleKey: 'payment.card_subtitle',
      rightElement: 'NAPS',
    },
  ];

  // RTL-aware styles
  const rtlStyles = {
    paymentOption: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    leftSection: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    iconTitleContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    radioButton: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    icon: {
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
    },
    title: {
      textAlign: isRTL ? 'right' : 'left',
    },
    subtitle: {
      textAlign: isRTL ? 'right' : 'left',
    },
    rightElement: {
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
    },
    chargeWalletText: {
      textAlign: isRTL ? 'right' : 'left',
    },
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentOption, 
          rtlStyles.paymentOption,
          isSelected && styles.selectedOption
        ]}
        onPress={() => setSelectedMethod(method.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.leftSection, rtlStyles.leftSection]}>
          <View style={[
            styles.radioButton, 
            rtlStyles.radioButton,
            isSelected && styles.radioButtonSelected
          ]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>

          <View style={styles.textContainer}>
            <View style={[styles.iconTitleContainer, rtlStyles.iconTitleContainer]}>
              <Svg 
                xml={method?.icon} 
                rest={{
                  height: 24,
                  width: 24,
                  marginRight: isRTL ? 0 : 10,
                  marginLeft: isRTL ? 10 : 0,
                }}
              />
              <Text style={[styles.title, rtlStyles.title]}>
                {method.title}
              </Text>
            </View>
       
            {method.subtitle && (
              <Text style={[styles.subtitle, rtlStyles.subtitle]}>
                {method.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {method.rightElement && (
          <View style={[styles.rightElement, rtlStyles.rightElement]}>
            {method.id === 'card' ? (
              <View style={styles.napsContainer}>
                <Text style={styles.napsText}>NAPS</Text>
              </View>
            ) : (
              <Text style={[styles.chargeWalletText, rtlStyles.chargeWalletText]}>
                {method.rightElement}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {paymentMethods.map(renderPaymentMethod)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: StyleGuide.color.backgroundColor,
  },
  content: {
    marginVertical: 10,
  },
  paymentOption: {
    backgroundColor: StyleGuide.color.backgroundColor,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    width: '100%',
    marginVertical: 10,
  },
  selectedOption: {
    borderColor: StyleGuide.color.primary,
    backgroundColor: StyleGuide.color.backgroundColor,
  },
  leftSection: {
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButtonSelected: {
    borderColor: StyleGuide.color.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: StyleGuide.color.primary,
  },
  iconTitleContainer: {
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.grey,
    lineHeight: 18,
  },
  rightElement: {
    // marginLeft handled by RTL styles
  },
  chargeWalletText: {
    fontSize: 14,
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  napsContainer: {
    backgroundColor: StyleGuide.color.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  napsText: {
    fontSize: 12,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
});

export default PaymentMethods;