import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next'; // For translations
import { StyleGuide } from '../../StyleGuide';
import Home from '../screens/home';
import Activities from '../screens/Activities/activities';
import Svg from '../lib/svg';
import { activitiesActive, activitiesInactive, homeActive, homeInactive, menueIcon, profile } from '../../assets/svgAssets'; // Import your icons
import { useAppSelector } from '../redux/reduxHooks';
import i18n from '../../i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define the types for the bottom tab navigator
export type BottomTabParamList = {
  Home: undefined;
  Activities: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const BottomTabs = ({ navigation }: any) => {
  const isRTL = useAppSelector((state) => state.language.isRTL);
  const insets = useSafeAreaInsets();

  const { t } = useTranslation();

  const tabBarStyle = {
    flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const), // Fix flexDirection type
    height: 60 + insets.bottom, // Add bottom safe area
    paddingBottom: insets.bottom, // Add bottom padding
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // Ensure tab bar is above navigation buttons
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  };

  return (
    <I18nextProvider i18n={i18n}>
    <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: tabBarStyle,
      // Force RTL layout for the entire tab bar
      tabBarLabelPosition: 'below-icon',
      tabBarActiveTintColor: StyleGuide.color.primary,
      tabBarInactiveTintColor: StyleGuide.color.grey,
    }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontWeight: StyleGuide.fontFamily.semiBold,
                color: focused ? StyleGuide.color.primary : StyleGuide.color.grey,
                textAlign: 'center',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {focused ? t('home') : t('home')} {/* Translated label */}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Svg xml={focused ? homeActive : homeInactive} rest={{ height: 15, width: 15 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={Activities}
        options={{
          headerShown:true,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontWeight: StyleGuide.fontFamily.semiBold,
                color: focused ? StyleGuide.color.primary : StyleGuide.color.grey,
                textAlign: isRTL ? 'right' : 'left', // Align text based on RTL
              }}
            >
              {focused ? t('activities') : t('activities')} {/* Translated label */}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Svg xml={focused ? activitiesActive : activitiesInactive} rest={{ height: 15, width: 15 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={''}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontWeight: StyleGuide.fontFamily.bold,
                color: StyleGuide.color.grey,
                textAlign: isRTL ? 'right' : 'left', // Align text based on RTL
              }}
            >
              {t('menu')} {/* Translated label */}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Svg xml={menueIcon} rest={{ height: 18, width: 20 }} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.openDrawer()} // Open drawer when 'Profile' is pressed
            />
          ),
        }}
      />
    </Tab.Navigator>
    </I18nextProvider>
  );
};

export default BottomTabs;
