import React, { useMemo } from 'react';
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
  airportTransferIcon,
  bookRideicon,
  deletIcon,
  editIcon,
  greenLeave,
  homeIcon,
  locationIcon,
  rentRideIcon,
  searchIcon,
  tripIcon,
  workIcon,
} from '../../../../assets/svgAssets';
import { getResponsiveFontSize, getResponsiveSize, isSmallScreen, SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { t } from 'i18next';
import i18n from '../../../../i18n';
import { getTimeGreeting } from '../../../lib/timeGreeting';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';

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
  address:any;
  onLocationPress?: (item: LocationItem) => void;
  onTripPress?: () => void;
  onRentPress?: () => void;
  onBookPress?: () => void;
  onAirportPress?: () => void;
  onProfilePress?: () => void;
  onDeletePress?: (item: LocationItem) => void;
  isRTL:any
}



const HomeDashBoard: React.FC<HomeDashboardProps> = ({
  userName = 'User',
  greeting = 'Good morning',
  onLocationPress,
  address,
  onTripPress,
  onRentPress,
  onBookPress,
  onProfilePress,
  onDeletePress,
  onAirportPress,
  isRTL
}) => {
  const { flexDirection, marginRightOrLeft ,textAlignment} = useTranslationStyles();
  const timeGreeting=getTimeGreeting()
  const navigation=useNavigation()
console.log('lllll',address)
const profileData = useAppSelector((state: RootState) => state.profile.data);

  return (
    <View>
      {/* User Greeting */}
      <View style={[styles.greetingContainer,flexDirection]}>
        <View style={[styles.userInfo,flexDirection]}>
          <TouchableOpacity onPress={onProfilePress} style={[styles.avatar,marginRightOrLeft]}>
            {(() => {
              // Check if there's a valid image in profile data
              const profile = profileData?.profile as any;
              const hasValidImage = profile?.customer_profile?.profile_img && 
                                   profile.customer_profile.profile_img !== '' && 
                                   profile.customer_profile.profile_img !== 'null' && 
                                   profile.customer_profile.profile_img !== 'undefined';
              
              if (hasValidImage) {
                return (
                  <Image
                    source={{uri: profile.customer_profile.profile_img}}
                    style={[styles.userImage]}
                    resizeMode="center"
                  />
                );
              } else {
                const userName = profile?.customer_profile?.name || '';
                const initials = userName ? userName.split(' ').slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() : 'U';
                
                return (
                  <View style={[styles.userImage, styles.userImagePlaceholder]}>
                    <Text style={styles.userImageInitials}>{initials}</Text>
                  </View>
                );
              }
            })()}
          </TouchableOpacity>
          <View>
            <Text style={[styles.greetingText,textAlignment]}>{timeGreeting}</Text>
            <Text style={[styles.userName,textAlignment]}>{profileData?.profile?.customer_profile?.name}</Text>
          </View>
        </View>
        <View style={[styles.coinsContainer]}>
         
            {/* <View>
              <Text style={styles.coinsAmount}>6.1</Text>
              <Text style={styles.coinsLabel}>kg</Text>
            </View> */}
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>CO.{'\n'}Saved</Text>
          </View>
          <Svg xml={greenLeave} rest={{ height: 45, width: 22 }} />
        </View>
      </View>

      {/* Search Bar */}
      {/* <View style={[styles.searchContainer,flexDirection]}>
        <Svg xml={searchIcon} rest={{ height: 45, width: 24 ,marginLeft: isRTL?10:0,marginRight: isRTL?0:10,}} />
        <TextInput
          style={[styles.searchInput, {
            writingDirection: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
          },]}
          placeholder={t('userName')}
          placeholderTextColor={StyleGuide.color.grey}
        />
      </View> */}

      {/* Services */}
      <Text style={[styles.servicesTitle,textAlignment]}>{t('services.title')}</Text>
      <View style={styles.servicesGridContainer}>
        <View style={styles.servicesRow}>
          <TouchableOpacity
            style={styles.serviceButtonSecondary}
            onPress={onTripPress}
          >
            <Svg xml={tripIcon} rest={{ height: 50, width: 38 }} />
            <Text style={styles.serviceText}>{t('services.trip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButtonSecondary} onPress={onRentPress}>
            <Svg xml={rentRideIcon} rest={{ height: 50, width: 38 }} />
            <Text style={styles.serviceText}>{t('services.rent')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.servicesRow}>
          <TouchableOpacity style={styles.serviceButtonSecondary} onPress={onBookPress}>
            <Svg xml={bookRideicon} rest={{ height: 50, width: 32 }} />
            <Text style={styles.serviceText}>{t('services.book')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButtonSecondary} onPress={onAirportPress}>
            <Svg xml={airportTransferIcon} rest={{ height: 42, width: 32 }} />
            <Text style={styles.serviceText}>{t('services.airport')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Saved Locations */}
      <Text style={styles.savedTitle}>{t('savedLocations')}</Text>
      <View style={styles.locationsContainer}>
  <ScrollView
    style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={flexDirection}
  >
      {address && address.length > 0 ? address.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.locationItem, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
              onPress={() => navigation.navigate('address', { address: item, action: 'edit' })}
            >
              {/* Parent View to allow space between icons and text */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Location Icon */}
                <Svg xml={locationIcon} rest={{ height: 25, width: 25 }} />
                
                {/* Actions Container */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => onDeletePress?.(item.id)} // Now properly calls the prop function
                  >
                    <Svg xml={deletIcon} rest={{ height: 20, width: 20 }} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Text Section */}
              <View>
                <Text numberOfLines={1} style={[styles.label, textAlignment]}>
                  {item.label}
                </Text>
                <Text numberOfLines={2} style={[styles.locationName, textAlignment]}>
                  {item.address}
                </Text>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.noDataContainer}>
              <TouchableOpacity onPress={()=>navigation.navigate('address')}>
              <Text style={styles.addButton}>{t('add')}</Text>
            </TouchableOpacity>
              <Text style={styles.noDataText}>No saved locations</Text>
              
            </View>
          )}
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
    marginBottom: getResponsiveSize(10),
  },
  addButton: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: getResponsiveSize(42),
    height: getResponsiveSize(42),
    borderRadius: getResponsiveSize(21),
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userImage: {
    width: getResponsiveSize(42),
    height: getResponsiveSize(42),
    borderRadius: getResponsiveSize(21),
  },
  userImagePlaceholder: {
    backgroundColor: StyleGuide.color.secondary,
    borderWidth: 2,
    borderColor: StyleGuide.color.primary,
    justifyContent:'center',
  },
  userImageInitials: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.primary,
    textAlign: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  greetingText: {
    fontSize:getResponsiveFontSize(12),
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: getResponsiveFontSize(16)
  },
  userName: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    lineHeight:getResponsiveFontSize(16),
  },
  coinsContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  coinsAmount: {
    fontSize: getResponsiveFontSize(18),
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: getResponsiveSize(20)
  },
  coinsLabel: {
    fontSize: getResponsiveFontSize(14),
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.medium,
    lineHeight: getResponsiveSize(18),
  },
  savedBadge: {
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    // marginTop: 4,
    // borderLeftWidth: 3,
    // marginLeft: 8,
    paddingHorizontal: getResponsiveSize(6),
    paddingVertical: getResponsiveSize(2),
    marginTop: getResponsiveSize(2),
    // borderLeftWidth: getResponsiveSize(3),
    marginLeft: getResponsiveSize(6),
    borderLeftColor: StyleGuide.color.grey,
  },
  savedText: {
    fontSize: getResponsiveSize(15),
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
    marginVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: StyleGuide.fontFamily.medium,
  },
  servicesTitle: {
    fontSize:getResponsiveFontSize(14),
    fontFamily: StyleGuide.fontFamily.bold,
    color:StyleGuide.color.black,
    marginBottom: 12,
  },
  servicesGridContainer: {
    marginBottom: getResponsiveSize(28),
    marginTop: getResponsiveSize(14),
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSize(10),
  },
  serviceButtonSecondary: {
    backgroundColor: StyleGuide.color.white,
    paddingVertical: getResponsiveSize(14),
    paddingHorizontal: getResponsiveSize(8),
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal:  getResponsiveSize(4),
    marginBottom: isSmallScreen ? getResponsiveSize(8) : 0,
    elevation: 0.4,
  },
  serviceText: {
    fontSize: getResponsiveFontSize(13),
    fontFamily: StyleGuide.fontFamily.bold,
    textAlign: 'center',
    color: StyleGuide.color.blackishGrey,
    marginTop: 5,
  },
  savedTitle: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.blackishGrey,
    marginBottom: getResponsiveSize(12),
    textAlign: 'center',
  },
  locationsContainer: {
    flexDirection: 'row',
  },
  locationItem: {
    alignItems: 'flex-start',
    backgroundColor: StyleGuide.color.white,
    paddingVertical: getResponsiveSize(13),
    paddingHorizontal:getResponsiveSize(8),
    justifyContent: 'space-between',
    borderRadius: 12,
    marginRight: getResponsiveSize(16),
    elevation: 0.4,
    marginBottom: getResponsiveSize(8),
  },
  // locationItem: {
  //   alignItems: 'flex-start',
  //   backgroundColor: StyleGuide.color.white,
  //   padding: getResponsiveSize(15),
  //   justifyContent: 'space-between',
  //   borderRadius: getResponsiveSize(12),
  //   marginRight: getResponsiveSize(18),
  //   elevation: 0.4,
  //   marginBottom: getResponsiveSize(10),
  //   minWidth: getResponsiveSize(120),
  // },
  label: {
    fontSize: getResponsiveFontSize(13),
    fontFamily: StyleGuide.fontFamily.semiBold,
    marginTop: getResponsiveSize(3),
    color: StyleGuide.color.blackishGrey,
    width:SCREEN_WIDTH*0.24

  },
  locationName: {
    fontSize: getResponsiveFontSize(10),
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.lightGrey,
    width:SCREEN_WIDTH*0.24
  },
  actionsContainer: {
   alignItems:'flex-end',
 width:SCREEN_WIDTH*0.22,
    right:3
     // Adjust the margin as needed
  },
 noDataContainer:{
  alignItems:'center',
  justifyContent:'center',
  alignSelf:'center',
  width:SCREEN_WIDTH*0.915,
  borderWidth:1,borderColor:StyleGuide.color.lightGrey,
  borderRadius:12,
  paddingVertical:getResponsiveSize(10),
  marginRight:getResponsiveSize(16),
  marginBottom:getResponsiveSize(8),

 },
 noDataText:{
  fontSize:getResponsiveFontSize(14),
  textAlign:'center',
  color:StyleGuide.color.grey,
  fontFamily:StyleGuide.fontFamily.medium,
 }

});
