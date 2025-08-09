import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next'; // For translations
import { StyleGuide } from '../../StyleGuide';
import Home from '../screens/home';
import Activities from '../screens/Activities/activities';
import Svg from '../lib/svg';
import { activitiesActive, activitiesInactive, homeActive, homeInactive, profile } from '../../assets/svgAssets'; // Import your icons
import { useAppSelector } from '../redux/reduxHooks';
import i18n from '../../i18n';

// Define the types for the bottom tab navigator
export type BottomTabParamList = {
  Home: undefined;
  Activities: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs = ({ navigation }: any) => {
  const isRTL = useAppSelector((state) => state.language.isRTL);

  const { t } = useTranslation();

  const tabBarStyle = {
    flexDirection: isRTL ? 'row-reverse' : 'row', // Flip layout for RTL
  };

  return (
    <I18nextProvider i18n={i18n}>
    <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        // Add additional RTL-specific styling
        paddingHorizontal: 10,
      },
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
            <Svg xml={profile} rest={{ height: 18, width: 20 }} />
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
