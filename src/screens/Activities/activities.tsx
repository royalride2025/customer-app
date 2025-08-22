import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
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
import networkClient from '../../../networkClient';
import { API_ENDPOINTS } from '../../../apiEndpoints';
import { useNavigation } from '@react-navigation/native';

interface Trip {
  id: string;
  start_time: string;
  price: string;
  selected_vehicle_id?: {
    car_make: string;
    car_model: string;
    vehicle_color: string;
    license_plate: string;
    vehicle_pictures?: string[];
  };
  driver_id?: {
    name: string;
  };
  review?: {
    rating: number;
  };
  pickup_location?: {
    address: string;
  };
  drop_location?: {
    address: string;
  };
  distance?: string;
  duration?: string;
  paymentMethod?: string;
  booking_type: string;
  status: string;
  duration_for_rent?: string;
}

const Activities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests'|'upcoming' | 'history'>('requests');
  const [bookings, setBookings] = useState([]);  // Stores the fetched booking data
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [historyBookings, setHistoryBookings] = useState<Trip[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [requestBookings, setRequestBookings] = useState<Trip[]>([]);  // Stores the fetched request data
  const [isRequestLoading, setIsRequestLoading] = useState(false); 
  const user = useAppSelector((state: RootState) => state.auth.user);
const navigation = useNavigation();
  const isCurrentLoading = 
  activeTab === 'upcoming' ? isBookingLoading : 
  activeTab === 'requests' ? isRequestLoading : 
  isHistoryLoading;

  useScreenHeader({
    title: 'Activities',
    showBackButton: true,
  });
  console.log('booking',bookings)
  useEffect(() => {
    // Fetch the appropriate bookings or requests based on the active tab
    if (activeTab === 'upcoming') {
      fetchScheduleBookings();  // For upcoming bookings
    } else if (activeTab === 'requests') {
      fetchRequests();  // For requests
    } else {
      fetchHistory();  // For history
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setIsRequestLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_CUSTOMER_REQUESTS(user?.id)}`);

      console.log('request=====',response)
      if (response && response.data) {
        setRequestBookings(response?.data?.data);  // Assuming "data" contains the request data
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsRequestLoading(false);
    }
  };

  const fetchScheduleBookings = async () => {
    if (!user?.id) return;
    setIsBookingLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_CUSTOMER_BOOKINGS(user?.id)}`);
      console.log('scedule=====',response)
      if (response && response.data) {
        setBookings(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching schedule bookings:', error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await networkClient.get(`${API_ENDPOINTS.GET_HISTORY}`);
      console.log('his',response?.data?.data)
      if (response && response.data) {
        setHistoryBookings(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching schedule bookings:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useScreenHeader({
    title: 'My Activities',
  });

  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  // Render function for booking items
  const renderBookingItem = ({ item }: { item: Trip }) => (
    <ActivityCard
      date={item?.start_time}
      price={item?.price}
      vehicleName={item?.selected_vehicle_id?.car_make ||item?.driver_active_vehicle?.car_make}
      vehicleRating={4.9}
      vehicleModel={item?.selected_vehicle_id?.car_model||item?.driver_active_vehicle?.car_model}
      vehicleColor={item?.selected_vehicle_id?.vehicle_color ||item?.driver_active_vehicle?.vehicle_color}
      licensePlate={item?.selected_vehicle_id?.license_plate ||item?.driver_active_vehicle?.license_plate}
      driverName={item?.driver_profile?.name}
      driverRating={item?.review?.rating}
      pickupLocation={item?.pickup_location?.address}
      dropLocation={item?.dropoff_location?.address}
      distance={item?.distance}
      estimatedTime={item?.duration}
      paymentMethod={item?.paymentMethod}
      onShowDetailsPress={() => console.log('Show details')}
      bookingType={item?.booking_type}
      status={item?.status}
    duration={item?.duration_for_rent}
    carImage={item?.driver_profile?.vehicle?.vehicle_pictures[0]}
    driverImage={item?.driver_profile?.driver_img}
    onCarPress={() => {
      // Only navigate if selected_vehicle_id exists
      if (item?.selected_vehicle_id) {
        (navigation as any).navigate('carProfile', { carData: item.selected_vehicle_id });
      }
    }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={[styles.tabContainer, flexDirection]}>
      <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Request
          </Text>
        </TouchableOpacity>
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

      <View style={styles.content}>
        {isCurrentLoading ? (
          <ActivityIndicator size={24} color={StyleGuide.color.primary} />
        ) : (
          <>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              Bookings
            </Text>
            <FlatList
             data={activeTab === 'requests' ? requestBookings : activeTab === 'upcoming' ? bookings : historyBookings}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item?.id?.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
    backgroundColor: 'transparent',
    height:34
  },
  activeTab: {
    borderColor: StyleGuide.color.primary,
    backgroundColor: StyleGuide.color.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.primary,
  },
  activeTabText: {
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.white,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
  marginVertical:15
  },
});

export default Activities;
