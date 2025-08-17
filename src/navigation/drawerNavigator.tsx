import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  I18nManager 
} from 'react-native';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList 
} from '@react-navigation/drawer';
import BottomTabs from './bottomTabsNavigator';
import Activities from '../screens/Activities/activities';
import Wallet from '../screens/Wallet';
import { StyleGuide } from '../../StyleGuide';
import { screenWidth } from '../utils/dimenstions';
import Svg from '../lib/svg';
import { activeCustomerChat, activeFaq, activeSetting, activeTerms, call, Cash, CashInactive, customerChat, faq, homeActive, homeInactive, logout, setting, terms } from '../../assets/svgAssets';
import ChatSupport from '../screens/chatSupport';
import { t } from 'i18next';
import { useAppSelector, useAppDispatch } from '../redux/reduxHooks';
import { RootState } from '../redux/store';
import { clearToken } from '../redux/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfile from '../screens/profile/userProfile';
import TermAndConditions from '../screens/termAndConditions';
import FAQ from '../screens/faq';

const Drawer = createDrawerNavigator();

const logo = require('../../assets/images/logo.png');
const profile = require('../../assets/images/manBg.png');

// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  const dispatch = useAppDispatch();
  const profileData = useAppSelector((state: RootState) => state.profile.data);
console.log('pppppp',profileData)
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            // Close the drawer properly
            if (props.navigation && props.navigation.closeDrawer) {
              props.navigation.closeDrawer();
            }
            // Clear the token to trigger logout
            dispatch(clearToken());
            // Navigate to login screen after logout
            if (props.navigation && props.navigation.navigate) {
              props.navigation.navigate('login');
            }
          }
        }
      ]
    );
  };

  // Emergency Call Handler
  const handleEmergencyCall = () => {
    const emergencyNumber = "112";  // Example emergency number, change if needed
    Linking.openURL(`tel:${emergencyNumber}`)
      .catch(err => console.error("Failed to open dialer", err));
  };

  // Create RTL-aware styles
  const rtlStyles = createRTLStyles(isRTL);
  
  return (
    <SafeAreaView style={[styles.drawerContainer, rtlStyles.container]}>
      {/* Header Section with Logo */}
      <View style={styles.headerSection}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* User Profile Section */}
      <View style={[styles.profileSection, rtlStyles.profileSection]}>
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
                style={[styles.userImage, rtlStyles.userImage]}
                resizeMode="center"
              />
            );
          } else {
            const userName = profile?.customer_profile?.name || '';
            const initials = userName ? userName.split(' ').slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase() : 'U';
            
            return (
              <View style={[styles.userImage, rtlStyles.userImage, rtlStyles.userImagePlaceholder]}>
                <Text style={rtlStyles.userImageInitials}>{initials}</Text>
              </View>
            );
          }
        })()}
        <View style={styles.userInfo}>
          <Text numberOfLines={1} style={[styles.userName,{lineHeight:18}]}>
            {profileData?.profile?.customer_profile?.name}
          </Text>
          <Text numberOfLines={1}  style={[styles.userEmail, rtlStyles.text,{lineHeight:18}]}>
            {profileData?.user?.phone}
          </Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Emergency Call Section (Under Chat) */}
      <View style={styles.emergencyCallSection}>
        <TouchableOpacity 
          style={[styles.emergencyCallButton]} 
          onPress={handleEmergencyCall}
        >
          <Svg xml={call} rest={{
            height: 20, 
            width: 20,
            style: rtlStyles.emergencyCallIcon
          }}/>
          <Text style={[styles.emergencyCallText, rtlStyles.emergencyCallText]}>
            Emergency Call
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={[styles.logoutButton, rtlStyles.logoutButton]} 
          onPress={handleLogout}
        >
          <Svg xml={logout} rest={{
            height: 20, 
            width: 20, 
            style: rtlStyles.logoutIcon,
            transform: [{ rotate: isRTL ? '180deg' : '0deg' }]
          }}/>
          <Text style={[styles.logoutText, rtlStyles.logoutText]}>
            {t('drawer.logout')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Function to create RTL-aware styles
const createRTLStyles = (isRTL) => StyleSheet.create({
  container: {
    direction: isRTL ? 'rtl' : 'ltr',
  },
  profileSection: {
    flexDirection: 'row',
  },
  userImage: {
    marginRight: isRTL ? 0 : 10,
    marginLeft: isRTL ? 10 : 0,
  },
  userImagePlaceholder: {
    backgroundColor: StyleGuide.color.secondary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: StyleGuide.color.primary,
  },
  userImageInitials: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.primary,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  },
  logoutIcon: {
    marginRight: isRTL ? 30 : 15,
    marginLeft: isRTL ? 0 : 0,
  },
  logoutText: {
    textAlign: isRTL ? 'right' : 'left',
    marginLeft: isRTL ? 0 : 15,
    marginRight: isRTL ? 15 : 0,
  },
  emergencyCallButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#ff4757',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 20,
  },
  emergencyCallText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#ffffff',
    marginLeft: isRTL ? 0 : 10,
    marginRight: isRTL ? 10 : 0,
  },
  emergencyCallIcon: {
    marginLeft: isRTL ? 0 : 10,
    marginRight: isRTL ? 10 : 0,
  },
  text: {
    textAlign: isRTL ? 'right' : 'left',
  }
});

const DrawerNavigator = () => {
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  React.useEffect(() => {
    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);
  }, [isRTL]);

  const getDrawerStyle = () => {
    const baseStyle = {
      width: screenWidth * 0.68,
      flex: 1,
      backgroundColor: StyleGuide.color.backgroundColor,
    };

    if (isRTL) {
      return {
        ...baseStyle,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
      };
    } else {
      return {
        ...baseStyle,
        borderBottomRightRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
      };
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: getDrawerStyle(),
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: 'front',
        drawerItemStyle: {
          borderRadius: 10,
          marginHorizontal: 10,
          marginVertical: 2,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontFamily: StyleGuide.fontFamily.medium,
          textAlign: isRTL ? 'right' : 'left',
          marginLeft: isRTL ? 0 : -16,
          marginRight: isRTL ? -16 : 0,
        },
        drawerActiveTintColor: StyleGuide.color.primary,
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={BottomTabs}
        options={{
          title: t('drawer.home'),
          drawerLabel: t('drawer.home'),
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{ 
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? homeActive : homeInactive} rest={{
                height: 20, 
                width: 20
              }}/>
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Wallet" 
        component={Wallet}
        options={{
          title: t('drawer.wallet'),
          drawerLabel: t('drawer.wallet'),
          drawerIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? Cash : CashInactive} rest={{
                height: 20, 
                width: 20
              }}/>
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Chat" 
        component={ChatSupport}
        options={{
          title: t('drawer.chat'),
          drawerLabel: t('drawer.chat'),
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? activeCustomerChat : customerChat} rest={{
                height: 23, 
                width: 23
              }}/>
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Account" 
        component={UserProfile}
        options={{
          title: 'Account',
          drawerLabel: 'Account',
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? activeSetting : setting} rest={{
                height: 23, 
                width: 23
              }}/>
            </View>
          ),
        }}
      />
       <Drawer.Screen 
        name="FAQ" 
        component={FAQ}
        options={{
          title: 'FAQ',
          drawerLabel:'FAQ',
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? activeFaq : faq} rest={{
                height: 20, 
                width: 20
              }}/>
            </View>
          ),
        }}
      />
       <Drawer.Screen 
        name="termAndCondition" 
        component={TermAndConditions}
        options={{
          title: 'Term & Conditions',
          drawerLabel:'Term & Conditions',
          headerShown: false,
          drawerIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              marginRight: isRTL ? 0 : 8,
              marginLeft: isRTL ? 8 : 0,
            }}>
              <Svg xml={focused ? activeTerms : terms} rest={{
                height: 20, 
                width: 20
              }}/>
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
    
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
  },
  headerSection: {
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: '100%',
    height: 60,
    marginBottom: 20,
    borderRadius: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: StyleGuide.color.grey
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.grey,
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  logoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4757',
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  emergencyCallSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emergencyCallButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4757',
    borderRadius: 10,
    paddingVertical: 10,
  },
  emergencyCallText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: '#ffffff',
    marginLeft: 10,
  },
  emergencyCallIcon: {
    marginLeft: 10,
  },
});

export default DrawerNavigator;
