import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BottomModal from './BottomModal';
import { StyleGuide } from '../../../StyleGuide';
import { t } from 'i18next';

type TopUpModalProps = {
  isVisible: boolean;
  defaultAmount?: string | number;
  currency?: string;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isRTL?: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
};

const TopUpModal: React.FC<TopUpModalProps> = ({
  isVisible,
  defaultAmount,
  currency = 'KWD',
  title = 'Add Credits',
  subtitle = 'Enter amount to top up',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  isRTL = false,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>(defaultAmount ? String(defaultAmount) : '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      setAmount(defaultAmount ? String(defaultAmount) : '');
      setError('');
    }
  }, [isVisible, defaultAmount]);

  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return 'Please enter a valid amount';
    if (num <= 0) return 'Amount must be greater than 0';
    return '';
  };

  const handleConfirm = () => {
    const err = validateAmount(amount);
    if (err) {
      setError(err);
      return;
    }
    onConfirm(amount);
  };

  return (
    <BottomModal isVisible={isVisible} onClose={onClose} style={{}} contentStyle={{}}>
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('topUpModal.title')}</Text>
      <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('topUpModal.subtitle')}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.amountInput, { textAlign: isRTL ? 'right' : 'left' }]}
          value={amount}
          onChangeText={(v) => { setAmount(v); setError(''); }}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={StyleGuide.color.grey}
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />
        <Text style={[styles.currency, { textAlign: isRTL ? 'right' : 'left' }]}>{t('topUpModal.currency')}</Text>
      </View>

      {!!error && (
        <Text style={[styles.error, { textAlign: isRTL ? 'right' : 'left' }]}>{error}</Text>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose} disabled={isLoading}>
          <Text style={styles.cancelText}>{t('topUpModal.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirm]} onPress={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.confirmText}>{t('topUpModal.confirm')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.grey,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.black,
    paddingVertical: 16,
  },
  currency: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: '#ff4444',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancel: {
    backgroundColor: '#f5f5f5',
  },
  confirm: {
    backgroundColor: StyleGuide.color.primary,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#fff',
  },
});

export default TopUpModal;


