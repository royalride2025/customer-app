import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { useTranslation } from 'react-i18next';
import PaymentService from '../../services/paymentService';

interface CardInputFormProps {
  onCardDetailsChange: (details: CardDetails) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const CardInputForm: React.FC<CardInputFormProps> = ({
  onCardDetailsChange,
  onSubmit,
  isLoading = false,
}) => {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<Partial<CardDetails>>({});

  const { textAlignment } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const { t } = useTranslation();

  const handleInputChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = PaymentService.formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = PaymentService.formatExpiryDate(value);
    }
    
    const newCardDetails = {
      ...cardDetails,
      [field]: formattedValue,
    };
    
    setCardDetails(newCardDetails);
    onCardDetailsChange(newCardDetails);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CardDetails> = {};
    
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = t('payment.cardholderNameRequired');
    }
    
    if (!cardDetails.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = t('payment.cardNumberRequired') || 'Card number is required';
    } else if (!PaymentService.validateCard(cardDetails.cardNumber, cardDetails.expiryDate, cardDetails.cvv)) {
      newErrors.cardNumber = t('payment.invalidCardDetails');
    }
    
    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = t('payment.expiryDateRequired') || 'Expiry date is required';
    }
    
    if (!cardDetails.cvv) {
      newErrors.cvv = t('payment.cvvRequired') || 'CVV is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const getCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return '';
  };

  const cardType = getCardType(cardDetails.cardNumber);

  return (
    <View style={styles.container}>
      <Text style={[styles.formTitle, textAlignment]}>
        {t('payment.cardDetails')}
      </Text>
      
      {/* Cardholder Name */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, textAlignment]}>
          {t('payment.cardholderName')}
        </Text>
        <TextInput
          style={[
            styles.input,
            textAlignment,
            errors.cardholderName && styles.inputError,
          ]}
          placeholder={t('payment.cardholderName')}
          value={cardDetails.cardholderName}
          onChangeText={(value) => handleInputChange('cardholderName', value)}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {errors.cardholderName && (
          <Text style={[styles.errorText, textAlignment]}>
            {errors.cardholderName}
          </Text>
        )}
      </View>
      
      {/* Card Number */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, textAlignment]}>
          {t('payment.cardNumber')}
        </Text>
        <View style={styles.cardNumberContainer}>
          <TextInput
            style={[
              styles.input,
              styles.cardNumberInput,
              textAlignment,
              errors.cardNumber && styles.inputError,
            ]}
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChangeText={(value) => handleInputChange('cardNumber', value)}
            keyboardType="numeric"
            maxLength={19}
          />
          {cardType && (
            <View style={styles.cardTypeIcon}>
              <Text style={styles.cardTypeText}>
                {cardType.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {errors.cardNumber && (
          <Text style={[styles.errorText, textAlignment]}>
            {errors.cardNumber}
          </Text>
        )}
      </View>
      
      {/* Expiry Date and CVV */}
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.inputContainer, styles.halfInput]}>
          <Text style={[styles.inputLabel, textAlignment]}>
            {t('payment.expiryDate')}
          </Text>
          <TextInput
            style={[
              styles.input,
              textAlignment,
              errors.expiryDate && styles.inputError,
            ]}
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChangeText={(value) => handleInputChange('expiryDate', value)}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors.expiryDate && (
            <Text style={[styles.errorText, textAlignment]}>
              {errors.expiryDate}
            </Text>
          )}
        </View>
        
        <View style={[styles.inputContainer, styles.halfInput]}>
          <Text style={[styles.inputLabel, textAlignment]}>
            {t('payment.cvv')}
          </Text>
          <TextInput
            style={[
              styles.input,
              textAlignment,
              errors.cvv && styles.inputError,
            ]}
            placeholder="123"
            value={cardDetails.cvv}
            onChangeText={(value) => handleInputChange('cvv', value)}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
          {errors.cvv && (
            <Text style={[styles.errorText, textAlignment]}>
              {errors.cvv}
            </Text>
          )}
        </View>
      </View>
      
      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? t('payment.processing') || 'Processing...' : t('payment.continue') || 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.regular,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  cardNumberContainer: {
    position: 'relative',
  },
  cardNumberInput: {
    paddingRight: 60,
  },
  cardTypeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardTypeText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: '#ff4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: StyleGuide.color.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#fff',
  },
});

export default CardInputForm;


