import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import {
  bookRideicon,
  greenLeave,
  homeIcon,
  locationIcon,
  rentRideIcon,
  searchIcon,
  tripIcon,
  workIcon,
} from '../../../../assets/svgAssets';

// Define the location item interface
export interface LocationItem {
  title: string;
  description: string;
  address: string;
  icon: string;
}

// Define props for HomeDashBoard
interface HomeDashboardProps {
  userName?: string;
  greeting?: string;
  onLocationPress?: (item: LocationItem) => void;
  onTripPress?: () => void;
  onRentPress?: () => void;
  onBookPress?: () => void;
  onProfilePress?: () => void;
}

// Dummy location data
export const locationData: LocationItem[] = [
  {
    title: 'Work',
    description: 'Near office',
    address: '23 Heliopolis St.',
    icon: workIcon,
  },
  {
    title: 'Home',
    description: 'Family house',
    address: '92 Garden Ave.',
    icon: homeIcon,
  },
  {
    title: 'Work',
    description: 'Client site',
    address: '58 Tech Park Rd.',
    icon: locationIcon,
  },
];

const HomeDashBoard: React.FC<HomeDashboardProps> = ({
  userName = 'User',
  greeting = 'Good morning',
  onLocationPress,
  onTripPress,
  onRentPress,
  onBookPress,
  onProfilePress
}) => {
  return (
    <View>
      {/* User Greeting */}
      <View style={styles.greetingContainer}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={onProfilePress} style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.userName}>{userName}.</Text>
          </View>
        </View>
        <View style={styles.coinsContainer}>
          <View>
            <Text style={styles.coinsAmount}>6.1</Text>
            <Text style={styles.coinsLabel}>kg</Text>
          </View>
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>CO.{'\n'}Saved</Text>
          </View>
          <Svg xml={greenLeave} rest={{ height: 45, width: 24 }} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Svg xml={searchIcon} rest={{ height: 45, width: 24, marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          placeholderTextColor={StyleGuide.color.grey}
        />
      </View>

      {/* Services */}
      <Text style={styles.servicesTitle}>Our Services</Text>
      <View style={styles.servicesContainer}>
        <TouchableOpacity
          style={[styles.serviceButtonSecondary, { marginHorizontal: 0, marginRight: 5 }]}
          onPress={onTripPress}
        >
          <Svg xml={tripIcon} rest={{ height: 40, width: 35 }} />
          <Text style={styles.serviceText}>Make a Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButtonSecondary} onPress={onRentPress}>
          <Svg xml={rentRideIcon} rest={{ height: 40, width: 35 }} />
          <Text style={styles.serviceText}>Rent a Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButtonSecondary} onPress={onBookPress}>
          <Svg xml={bookRideicon} rest={{ height: 40, width: 28 }} />
          <Text style={styles.serviceText}>Book a Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Locations */}
      <Text style={styles.savedTitle}>Saved and recent locations</Text>
      <View style={styles.locationsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {locationData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationItem}
              onPress={() => onLocationPress?.(item)}
            >
              <Svg xml={item.icon} rest={{ height: 25, width: 25 }} />
              <View>
                <Text style={styles.locationIcon}>{item.title}</Text>
                <Text style={styles.locationName}>{item.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeDashBoard;

const styles = StyleSheet.create({
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  greetingText: {
    fontSize: 14,
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: 18,
  },
  userName: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.fontFamily.black,
    lineHeight: 18,
  },
  coinsContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  coinsAmount: {
    fontSize: 21,
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.bold,
    lineHeight: 26,
  },
  coinsLabel: {
    fontSize: 16,
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.medium,
    lineHeight: 18,
  },
  savedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    borderLeftWidth: 3,
    marginLeft: 8,
    borderLeftColor: StyleGuide.color.grey,
  },
  savedText: {
    fontSize: 18,
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.white,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: StyleGuide.fontFamily.medium,
  },
  servicesTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceButtonSecondary: {
    backgroundColor: StyleGuide.color.white,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 0.4,
  },
  serviceText: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.bold,
    textAlign: 'center',
    color: StyleGuide.color.blackishGrey,
    marginTop: 5,
  },
  savedTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.blackishGrey,
    marginBottom: 12,
    textAlign: 'center',
  },
  locationsContainer: {
    flexDirection: 'row',
  },
  locationItem: {
    alignItems: 'flex-start',
    backgroundColor: StyleGuide.color.white,
    padding: 15,
    justifyContent: 'space-between',
    borderRadius: 12,
    marginRight: 18,
    elevation: 0.4,
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    marginTop: 3,
    color: StyleGuide.color.blackishGrey,
  },
  locationName: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.grey,
  },
});
