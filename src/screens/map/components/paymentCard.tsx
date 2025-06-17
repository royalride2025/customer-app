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

const PaymentMethods = () => {
  const [selectedMethod, setSelectedMethod] = useState('apple_pay');

  const paymentMethods = [
    
    {
      id: 'apple_pay',
      title: 'Apple Pay',
      icon: applePay,
      subtitle: null,
      rightElement: 'Charge Wallet',
    },
    {
      id: 'card',
      title: 'Card Payment',
      icon: atmCard,
      subtitle: 'Pay later at your destination using your debit/credit card.',
      rightElement: 'NAPS',
    },
  ];

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.paymentOption, isSelected && styles.selectedOption]}
        onPress={() => setSelectedMethod(method.id)}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>

          <View style={styles.textContainer}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <Svg xml={method?.icon} rest={{height:24,width:24,marginRight: 10,}}/>
            <Text style={styles.title}>{method.title}</Text>
            </View>
       
            {method.subtitle && (
              <Text style={styles.subtitle}>{method.subtitle}</Text>
            )}
          </View>
        </View>
        
        {method.rightElement && (
          <View style={styles.rightElement}>
            {method.id === 'card' ? (
              <View style={styles.napsContainer}>
                <Text style={styles.napsText}>NAPS</Text>
              </View>
            ) : (
              <Text style={styles.chargeWalletText}>{method.rightElement}</Text>
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
    // flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
    // width:'100%'
  },
  content: {
    // padding: 16,
    // gap: 12,
    marginVertical:10
  },
  paymentOption: {
    backgroundColor: StyleGuide.color.backgroundColor,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    width: '100%',
    marginVertical:10

    
  },
  selectedOption: {
    borderColor: StyleGuide.color.primary,
    backgroundColor: StyleGuide.color.backgroundColor,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:8
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
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.bold,
    color:StyleGuide.color.black,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily:StyleGuide.fontFamily.regular,
    color:StyleGuide.color.grey,
    lineHeight: 18,
  },
  rightElement: {
    marginLeft: 12,
  },
  chargeWalletText: {
    fontSize: 14,
    color: StyleGuide.color.primary,
    fontFamily:StyleGuide.fontFamily.semiBold,
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
    fontFamily:StyleGuide.fontFamily.semiBold,
  },
});

export default PaymentMethods;