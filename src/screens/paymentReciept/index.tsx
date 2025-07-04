import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';


import Svg from '../../lib/svg';
import { logoSimple } from '../../../assets/svgAssets';
import { StyleGuide } from '../../../StyleGuide';
import { getResponsiveFontSize } from '../../lib/responsiveStyles';
import PaymentReceiptCard from './components/paymentReceiptCard';
import { t } from 'i18next';



const PaymentReceipt: React.FC = () => {
 
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>{t('payment_receipt')}</Text>

        {/* Payment Card */}
        <View style={styles.paymentCard}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Svg xml={logoSimple} rest={{height:60,width:90}}/>
          </View>

          <Text style={styles.paymentTitle}>
          {t('please_pay')} 1000
      </Text>
      <Text style={styles.paymentTitle}>
      {`${t('toname')} ${t('rideInfo.driverFullName')}`}
      </Text>
        </View>

        {/* Trip Details Section */}
        <Text style={styles.sectionTitle}>{t('trip_details')}</Text>
        <PaymentReceiptCard
                date="January 12, 2025"
                time="11:00 AM"
                vehicleName="Mercedes S-Class"
                vehicleRating={4.9}
                vehicleModel="Mercedes-Benz S-Class"
                vehicleColor="Pearl White"
                licensePlate="LUX 001"
                driverName="Omar Khalil"
                driverRating={4.8}
                currentLocation="Four Seasons Resort Dubai"
                officeLocation="Dubai Opera House"
                distance="6.8km"
                estimatedTime="12 Minutes"
                paymentMethod="Premium Account"
                onEditPress={() => handleEdit('ride-004')}
                onDeletePress={() => handleDelete('ride-004')}
                onShowDetailsPress={() => console.log('Show luxury ride details')}
            />
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
  ...StyleGuide.layout.container
  },
  content: {
    flex: 1,
    marginTop: 50,
  },
  header: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  paymentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
   
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  logoText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentTitle: {
      fontSize: getResponsiveFontSize(16),
      fontFamily: StyleGuide.fontFamily.semiBold,
      color: StyleGuide.color.white,
    // marginBottom: 5,
  },
  paymentSubtitle: {
    fontSize: getResponsiveFontSize(15),
      fontFamily: StyleGuide.fontFamily.semiBold,
      color: StyleGuide.color.white,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(18),
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
    marginBottom: 15,
  },
 
});

export default PaymentReceipt;