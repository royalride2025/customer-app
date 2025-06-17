// src/navigation/BottomTabsNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';

import Home from '../screens/home';
import Activities from '../screens/Activities/activities';
import Svg from '../lib/svg';
import { activitiesActive, activitiesInactive, homeActive, homeInactive, profile, profileActive, profileIcon } from '../../assets/svgAssets'; // Import your icons
import { StyleGuide } from '../../StyleGuide';

// Define the types for the bottom tab navigator
export type BottomTabParamList = {
  Home: undefined;
  Activities: undefined;
  Profile: undefined; // Profile tab will now trigger drawer opening directly
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Bottom Tab Navigator
const BottomTabs = ({ navigation }: any) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false, // Hide header for bottom tab screens
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
              color: focused ? StyleGuide.color.primary : StyleGuide.color.grey, // Change color based on focus
            }}
          >
            {focused ? 'Home' : 'Home'} {/* Change text based on focus */}
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
              color: focused ? StyleGuide.color.primary : StyleGuide.color.grey, // Change color based on focus
            }}
          >
            {focused ? 'Activities' : 'Activities'} {/* Change text based on focus */}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <Svg xml={focused ? activitiesActive : activitiesInactive} rest={{ height: 15, width: 15 }} />
        ),
      }}
    />
    <Tab.Screen
      name="menue"
      component={''}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: 12,
              fontWeight: StyleGuide.fontFamily.bold,
              color:  StyleGuide.color.grey, // Change color based on focus
            }}
          >
            {'Menue'} {/* Change text based on focus */}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <Svg xml={ profile } rest={{ height: 18, width: 20 }} />
        ),
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            onPress={() => navigation.openDrawer()} // Open drawer directly on press of Profile tab
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default BottomTabs;
