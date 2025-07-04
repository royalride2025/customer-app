import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import RideInfoCard from '../map/components/rideInfoCard';
import ActivityCard from './components/activityCard';
import { StyleGuide } from '../../../StyleGuide';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import useTranslationStyles from '../../../locales/useTranslationStyles';

interface Trip {
  id: string;
  date: string;
  time: string;
  vehicleType: string;
  vehicleColor: string;
  plateNumber: string;
  driverName: string;
  driverRating: number;
  paymentMethod: 'Cash' | 'Card';
  currentLocation?: string;
  destination?: string;
  distance?: string;
  duration?: string;
}

const Activities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  
  useScreenHeader({
    title: 'My Activities',
    
  });
  const { flexDirection } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
    
      <View style={[styles.tabContainer,flexDirection]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
          {t('upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
          {t('history')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('upcomingTrips')}</Text>
        <ActivityCard
                date="January 13, 2025"
                time="7:45 PM"
                vehicleName="Honda Civic"
                vehicleRating={4.1}
                vehicleModel="Honda Civic"
                vehicleColor="White"
                licensePlate="UBR 456"
                driverName="Fatima Al-Zahra"
                driverRating={4.6}
                currentLocation="City Centre Deira, Dubai"
                officeLocation="Dubai Marina Walk"
                distance="12.3km"
                estimatedTime="22 Minutes"
                paymentMethod="Cash"
                onEditPress={() => handleEdit('ride-003')}
                onDeletePress={() => handleDelete('ride-003')}
                style={{ marginVertical: 8 }}
            />

            {/* Example 5: Luxury ride */}
            <ActivityCard
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
      </ScrollView>
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
    // paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: '#F5F5F5',
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#F4F4F5',
    borderRadius: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#D4B896',
  },
  tabText: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.medium,
    color:StyleGuide.color.primary,
  },
  activeTabText: {
    fontFamily:StyleGuide.fontFamily.medium,
    color:StyleGuide.color.white,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.bold,
    color:StyleGuide.color.black,
    marginBottom: 15,
  },
  tripCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  tripActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  actionText: {
    fontSize: 16,
  },
  tripContent: {
    gap: 15,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImage: {
    width: 80,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  stars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    fontSize: 12,
    color: '#FFD700',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  driverRating: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationSection: {
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  locationDot: {
    fontSize: 16,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
  distanceInfo: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  duration: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#000',
  },
  detailsButton: {
    backgroundColor: '#D4B896',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
});

export default Activities;