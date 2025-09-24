import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { StyleGuide } from '../../../StyleGuide';
import Svg from '../../lib/svg';
import { download, logoSimple, rightArrowBlack, rightIcon } from '../../../assets/svgAssets';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { useAppSelector, useAppDispatch } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { setCurrentCharge } from '../../redux/paymentSlice';
import { setProfile } from '../../redux/profileSlice';
import { t } from 'i18next';
import networkClient from '../../../networkClient';
import networkClientModule from '../../../networkClient';
import axios from 'axios';
import { Linking } from 'react-native';
import { API_ENDPOINTS } from '../../../apiEndpoints';
// import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
}

const Wallet: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(25000);
  const [loading, setLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  
  const dispatch = useAppDispatch();
  
  // Get user profile data at component level
  const profileData = useAppSelector((state: RootState) => state.profile.data);
  const user = profileData?.user;
  const profile = profileData?.profile;
  const credits=profileData?.user?.credits
console.log('credits-------', credits)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log(transactions,"transactions/////")
  const handleGoBack = () => {
    // Handle back navigation
    console.log('Go back');
  };

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue)) {
      return 'Please enter a valid amount';
    }
    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }
    if (numValue < 1) {
      return 'Minimum amount is 1 KWD';
    }
    if (numValue > 10000) {
      return 'Maximum amount is 10,000 KWD';
    }
    return '';
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError('');
  };

  const handleAddCreditsPress = () => {
    setShowAmountModal(true);
  };

  const handleConfirmAmount = () => {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setShowAmountModal(false);
    handleAddCredits();
  };

  const handleAddCredits = async () => {
    setLoading(true);
    try {
      // Prepare customer data using the already fetched profile data
      const customerData = {
        first_name: profile?.name?.split(' ')[0] || 'John',
        email: 'user@royalride.qa', // Default email since User interface doesn't have email
        phone: {
          country_code: '965', // Kuwait country code
          number: user?.phone?.replace(/^\+965/, '') || '50000000'
        }
      };

      
      // Prepare charge data with user input amount
      const chargeData = {
        amount: parseFloat(amount), // Use user input amount
        currency: 'KWD',
        customer: customerData,
        description: 'Wallet Top-up',
        metadata: {
          user_id: user?._id
        },
        reference: {
          transaction: `txn_${Date.now()}`,
          order: `ord_${Date.now()}`
        },
        receipt: {
          email: true,
          sms: false
        }
      };

      // Call create charge API
      console.log('Sending charge data:', chargeData);
      const response = await networkClient.post(API_ENDPOINTS.CREATE_CHARGE, chargeData);
      console.log('API Response:', response.data);
      
      if (response.data && response.data.transaction && response.data.transaction.url) {
        console.log('Payment URL received:', response.data.transaction.url);
        
        // Save charge information to Redux
        dispatch(setCurrentCharge({
          id: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          transactionUrl: response.data.transaction.url,
          createdAt: response.data.transaction.created
        }));
        
        // Navigate to payment WebView
        (navigation as any).navigate('PaymentWebView', {
          paymentUrl: response.data.transaction.url,
          amount: parseFloat(amount),
          currency: 'KWD'
        });
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from payment service');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        'Failed to initialize payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      // Build absolute URL using axios baseURL
      const baseURL = (networkClientModule as any)?.defaults?.baseURL || 'https://app.royalride.qa';
      const url = `${baseURL}/api/credits/receipt/${id}`; // server should return PDF/image
      const token = (useAppSelector as any)((s: any) => s.auth.token);
      (navigation as any).navigate('PaymentWebView', {
        paymentUrl: url,
        title: 'Receipt',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      console.log('Failed to open receipt', e);
      Alert.alert('Error', 'Unable to open receipt right now.');
    }
  };
  
  // Refresh profile (credits) whenever Wallet comes into focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchProfile = async () => {
        try {
          const response = await networkClient.get(API_ENDPOINTS.GET_PROFILE);
          if (!isActive) return;
          if (response?.data?.data) {
            dispatch(setProfile({
              user: response.data.data.user,
              profile: response.data.data.profile,
            }));
          }
        } catch (err) {
          console.log('Wallet focus: failed to refresh profile', err);
        }
      };
      const fetchTransactions = async () => {
        try {
          const res = await networkClient.get(API_ENDPOINTS.CREDITS_HISTORY(1, 20));
          if (!isActive) return;
          const items = res?.data?.data || res?.data?.history || res?.data?.items || [];
          const mapped: Transaction[] = items.map((it: any, idx: number) => ({
            id: String(it?.id || it?._id || idx),
            date: new Date(it?.createdAt || it?.date || Date.now()).toLocaleDateString(),
            time: new Date(it?.createdAt || it?.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: `${Number(it?.amount || 0).toFixed(2)} ${t('currency')}`,
          }));
          setTransactions(mapped);
          setPage(1);
          setHasMore((items?.length || 0) >= 20);
        } catch (e) {
          console.log('Failed to load credits history', e);
        }
      };
      fetchProfile();
      fetchTransactions();
      return () => { isActive = false; };
    }, [dispatch])
  );

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await networkClient.get(API_ENDPOINTS.CREDITS_HISTORY(nextPage, 20));
      const items = res?.data?.data || res?.data?.history || res?.data?.items || [];
      const mapped: Transaction[] = items.map((it: any, idx: number) => ({
        id: String(it?.id || it?._id || `${nextPage}-${idx}`),
        date: new Date(it?.createdAt || it?.date || Date.now()).toLocaleDateString(),
        time: new Date(it?.createdAt || it?.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: `${Number(it?.amount || 0).toFixed(2)} ${t('currency')}`,
      }));
      setTransactions(prev => [...prev, ...mapped]);
      setPage(nextPage);
      setHasMore((items?.length || 0) >= 20);
    } catch (e) {
      console.log('Failed to load more credits history', e);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await networkClient.get(API_ENDPOINTS.CREDITS_HISTORY(1, 20));
      const items = res?.data?.data || res?.data?.history || res?.data?.items || [];
      const mapped: Transaction[] = items.map((it: any, idx: number) => ({
        id: String(it?.id || it?._id || idx),
        date: new Date(it?.createdAt || it?.date || Date.now()).toLocaleDateString(),
        time: new Date(it?.createdAt || it?.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: `${Number(it?.amount || 0).toFixed(2)} ${t('currency')}`,
      }));
      setTransactions(mapped);
      setPage(1);
      setHasMore((items?.length || 0) >= 20);
    } catch (e) {
      console.log('Failed to refresh credits history', e);
    } finally {
      setIsRefreshing(false);
    }
  };
useScreenHeader({
    title:'Wallet'
})
const navigation=useNavigation()
const { flexDirection, marginRightOrLeft ,textAlignment} = useTranslationStyles();
const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
     

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const paddingToBottom = 200;
          const reachedBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;
          if (reachedBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={200}
      >
        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <Text style={[styles.balanceLabel,{textAlign:isRTL?'right':'left'}]}>{t('wallet.currentBalance')}</Text>
          <Text style={[styles.balanceAmount,{textAlign:isRTL?'right':'left',writingDirection: isRTL ? 'rtl' : 'ltr',}]}>{isRTL ?`QR ${credits?.toLocaleString()}`: `${credits?.toLocaleString()} QR` }</Text>
          
          <View style={[styles.cardBottom,flexDirection]}>
            <Text style={styles.cardNumber}>**** **** **** **</Text>
            <View style={styles.logoContainer}>
              <Svg xml={logoSimple} rest={{height:40,width:40}}/>
            </View>
          </View>
        </View>

        {/* Add Credits Button */}
        <TouchableOpacity 
          style={[styles.addCreditsButton, loading && styles.addCreditsButtonDisabled]} 
          onPress={handleAddCreditsPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={StyleGuide.color.black} size="small" />
          ) : (
            <Text style={styles.addCreditsText}>{t('wallet.addCredits')}</Text>
          )}
        </TouchableOpacity>


        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
            <TouchableOpacity onPress={()=>(navigation as any).navigate('transaction')} style={[styles.subContainer,{flexDirection:isRTL?'row-reverse':'row'}]}>
            <Text style={styles.sectionTitle}>{t('wallet.transactions')}</Text>
            <Svg xml={rightArrowBlack} rest={{height:18,width:18,transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }}/>
            </TouchableOpacity>
         

          <View style={styles.divider} />
          <TouchableOpacity style={[styles.subContainer,{flexDirection:isRTL?'row-reverse':'row'}]}>
          
          <Text style={styles.invoicesTitle}>{t('wallet.invoices')}</Text>
          <Svg xml={rightArrowBlack} rest={{height:18,width:18,transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }}/>
           
          </TouchableOpacity>
          {transactions.length === 0 ? (
            <Text style={[styles.transactionDate, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('wallet.noTransactions')}
            </Text>
          ) : (
            <FlatList
              data={transactions}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  // onPress={() => (navigation as any).navigate('paymentReceipt')}
                  style={[styles.transactionItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <View>
                    <Text style={[styles.transactionDate, textAlignment]}>
                      {item.date} | {item.time}
                    </Text>
                    <Text style={[
                      styles.transactionAmount, 
                      textAlignment,
                      item.amount.includes('-') && styles.negativeAmount
                    ]}>{item.amount}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadInvoice(item.id)}
                  >
                    <Svg xml={download} rest={{ height: 20, width: 20 }} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
          {isFetchingMore && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={StyleGuide.color.primary} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Amount Input Modal */}
      <Modal
        visible={showAmountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAmountModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t('wallet.addCredits')}
              </Text>
              
              <Text style={[styles.modalSubtitle, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t('wallet.enterAmount')}
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.amountInput,
                    {textAlign: isRTL ? 'right' : 'left'},
                    amountError && styles.amountInputError
                  ]}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={StyleGuide.color.grey}
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmAmount}
                />
                <Text style={[styles.currencyLabel, {textAlign: isRTL ? 'right' : 'left'}]}>
                  KWD
                </Text>
              </View>
              
              {amountError ? (
                <Text style={[styles.errorText, {textAlign: isRTL ? 'right' : 'left'}]}>
                  {amountError}
                </Text>
              ) : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAmountModal(false);
                    setAmount('');
                    setAmountError('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmAmount}
                >
                  <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
   ...StyleGuide.layout.container
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  walletCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  balanceLabel: {
    fontFamily:StyleGuide.fontFamily.medium,
    color:StyleGuide.color.grey,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.white,
    fontSize: 24,
    marginBottom: 40,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
  },
  logoContainer: {
   
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCreditsButton: {
    backgroundColor: '#e6d5b8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  addCreditsButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  addCreditsText: {
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    fontSize: 16,
  },
  transactionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  invoicesTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor:StyleGuide.color.white,
    marginBottom:10,
    paddingHorizontal:10,
    borderRadius:20,
    // backgroundColor:'red',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.grey,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.primary,
  },
  negativeAmount: {
    color: 'red',
  },
  downloadButton: {
    padding: 8,
  },
  subContainer:{justifyContent:'space-between',alignItems:'center',marginBottom:5},
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    marginBottom: 8,
  },
  modalSubtitle: {
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
  amountInputError: {
    borderColor: '#ff4444',
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    color: '#ff4444',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: StyleGuide.color.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#fff',
  },
});

export default Wallet;