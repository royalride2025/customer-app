import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { StyleGuide } from '../../../StyleGuide';
import TransactionCard from './components/transactionCard';

interface Transaction {
  id: string;
  date: string;
  time: string;
  paymentMethod: 'Cash' | 'Card';
  serviceType: 'PREMIUM' | 'VVIP';
  paidAmount: string;
  tripCost: string;
  waitingFees: string;
  address: string;
  currentLocation: string;
  office: string;
  distance: string;
  duration: string;
  carImage: any;
  driverImage: any;
}

const Transactions: React.FC = () => {
    const transactions: Transaction[] = [
        {
          id: '1',
          date: 'JAN 15, 2025',
          time: '10:30 AM',
          paymentMethod: 'Card',
          serviceType: 'VVIP',
          paidAmount: '250 QR',
          tripCost: '230 QR',
          waitingFees: '20 QR',
          address: '123 New Address, City, Country',
          currentLocation: 'Zone 25 House 15 Street 900 South Doha',
          office: 'Zone 10 House 8 Street  500 North Dohakk',
          distance: '5.2km',
          duration: '45 Minutes',
          carImage: require('../../../assets/images/carp1.png'),
          driverImage: require('../../../assets/images/man.png'),
        },
        {
          id: '2',
          date: 'JAN 18, 2025',
          time: '02:15 PM',
          paymentMethod: 'Card',
          serviceType: 'PREMIUM',
          paidAmount: '300 QR',
          tripCost: '290 QR',
          waitingFees: '10 QR',
          address: '789 Old Address, City, Country',
          currentLocation: 'Zone 65 House 30 Street 700 East Doha',
          office: 'Zone 40 House 22 Street 600 West Doha',
          distance: '7.3km',
          duration: '1 Hour 10 Minutes',
          carImage: require('../../../assets/images/carp1.png'),
          driverImage: require('../../../assets/images/man.png'),
        },
      ];
      

  useScreenHeader({
    title: 'Transactions',
  });

  // Render each transaction item using TransactionCard
  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionCard
      date={item.date}
      time={item.time}
      serviceType={item?.serviceType}
      vehicleName="Mercedes S-Class"
      vehicleRating={4.9}
      vehicleModel="Mercedes-Benz S-Class"
      vehicleColor="Pearl White"
      licensePlate="LUX 001"
      driverName="Omar Khalil"
      driverRating={4.8}
      currentLocation={item.currentLocation}
      officeLocation={item.office}
      distance={item.distance}
      estimatedTime={item.duration}
      paymentMethod="Premium Account"
      onShowDetailsPress={() => console.log('Show luxury ride details')}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container,
  },
  scrollView: {
    flex: 1,
  },
});

export default Transactions;
