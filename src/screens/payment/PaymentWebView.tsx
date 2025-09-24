import React, { useEffect } from 'react';
import {
  StatusBar,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/stackNavigation';
import { StyleGuide } from '../../../StyleGuide';
import Svg from '../../lib/svg';
import { rightArrowBlack } from '../../../assets/svgAssets';
import { useAppSelector, useAppDispatch } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import { clearCurrentCharge } from '../../redux/paymentSlice';

type PaymentWebViewRouteProp = RouteProp<RootStackParamList, 'PaymentWebView'>;

interface PaymentWebViewProps {}

const PaymentWebView: React.FC<PaymentWebViewProps> = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentWebViewRouteProp>();
  const { paymentUrl, amount, currency } = route.params;
  const dispatch = useAppDispatch();
  
  // Get current charge from Redux
  const currentCharge = useAppSelector((state: RootState) => state.payment.currentCharge);

  useScreenHeader({
    title: 'Payment',
    showBackButton: true,
  });

  // Clear charge when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCharge());
    };
  }, [dispatch]);

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert('Error', 'Failed to load payment page. Please try again.');
  };

  console.log('Payment URL:', paymentUrl);
  console.log('Amount:', amount, 'Currency:', currency);
  console.log('Current Charge ID:', currentCharge?.id);
  
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('Navigation changed to:', url);
    
    // Check for success/failure URLs
    if (url.includes('payment-success') || url.includes('success')) {
      Alert.alert(
        'Payment Successful',
        `Your payment of ${amount} ${currency} has been processed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else if (url.includes('payment-failed') || url.includes('failed') || url.includes('cancel')) {
      Alert.alert(
        'Payment Failed',
        'Your payment could not be processed. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleClosePayment = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'Continue Payment',
          style: 'cancel',
        },
        {
          text: 'Back to App',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleClosePayment}
        >
          <Svg xml={rightArrowBlack} rest={{height: 20, width: 20, transform: [{ rotate: '180deg' }]}} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* WebView with built-in loading */}
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webView}
        onError={handleWebViewError}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default PaymentWebView;
