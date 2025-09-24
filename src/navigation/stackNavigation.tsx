// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import Introduction from '../screens/introduction/index';
import Login from '../screens/auth';
import Signup from '../screens/auth/signup';
import BottomTabs from './bottomTabsNavigator';
import MakeTrip from '../screens/home/makeTrip/makeTrip';
import RentRide from '../screens/home/rentRide/rentRide';
import BookRide from '../screens/home/bookRide/bookRide';
import AirportTransfer from '../screens/home/airportTransfer/airportTransfer';
import ForgetPassword from '../screens/auth/forgetPassword';
import Otp from '../screens/auth/otp';
import Map from '../screens/map';
import CarProfile from '../screens/profile/carProfile';
import DrawerNavigator from './drawerNavigator';
import Transactions from '../screens/trasaction';

import CustomerClientChat from '../screens/customerChat';
import PaymentReceipt from '../screens/paymentReciept';
import PaymentWebView from '../screens/payment/PaymentWebView';

import ScheduleRideScreen from '../screens/home/airportTransfer/ScheduleRideScreen';

import { Text } from 'react-native';
import { t } from 'i18next';
import { StyleGuide } from '../../StyleGuide';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import ManageAddress from '../screens/address';


// Define the types for the navigator
export type RootStackParamList = {
  Introduction: undefined;
  login: undefined;
  signUp: undefined
  bottomTabs: undefined
  makeTrip:undefined
  rentRide:undefined
  bookRide:undefined
  airportTransfer:undefined
  forgetPassword:undefined
  otp:{ phone: string }
  map:undefined
  carProfile:undefined
  drawerNavigator:undefined
  Main: undefined;
  transaction:undefined
  paymentReceipt:undefined
  customerChat:undefined
  ScheduleRide: undefined;
  address:undefined
  Payment: {
    amount: number;
    currency?: string;
    description?: string;
  }
  PaymentWebView: {
    paymentUrl: string;
    amount: number;
    currency: string;
  }
  PaymentDemo: undefined
  PaymentDebug: undefined
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const isRTL = useSelector((state: RootState) => state.language.isRTL);

  return (
    <Stack.Navigator >
      {!token ? (
        <>
          <Stack.Screen options={{ headerShown: false }} name="Introduction" component={Introduction} />
          <Stack.Screen options={{ headerShown: false }} name="login" component={Login} />
          <Stack.Screen options={{ headerShown: false }} name="signUp" component={Signup} />
          <Stack.Screen name="forgetPassword"  component={ForgetPassword} options={{
            // headerShown: false,
            headerTitle: () => (
              <Text style={{
                color: StyleGuide.color.black,
                fontSize: 18,
                fontFamily: StyleGuide.fontFamily.bold,
              }}>
                {t("forgotPassword")}
              </Text>
            ),
          }} />
          <Stack.Screen name="otp" component={Otp} options={{
            // headerShown: false,
            headerTitle: () => (
              <Text style={{
                color: StyleGuide.color.black,
                fontSize: 18,
                fontFamily: StyleGuide.fontFamily.bold,
              }}>
                {t('otpVerification')}
              </Text>
            ),
          }} />
        </>
      ) : (
        <>
          <Stack.Screen options={{ headerShown: false }} name="Main" component={DrawerNavigator} />
          <Stack.Screen name="makeTrip" component={MakeTrip} />
          <Stack.Screen name="transaction" component={Transactions} />
          <Stack.Screen name="address" component={ManageAddress} />
         

          <Stack.Screen options={{ headerShown: false }} name="paymentReceipt" component={PaymentReceipt} />
          <Stack.Screen options={{ headerShown: false }} name="PaymentWebView" component={PaymentWebView} />
          <Stack.Screen options={{ headerShown: false }} name="customerChat" component={CustomerClientChat} />
          <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
          <Stack.Screen name="rentRide" component={RentRide} />
          <Stack.Screen name="bookRide" component={BookRide} />
          <Stack.Screen name="airportTransfer" component={AirportTransfer} />
          <Stack.Screen name="carProfile" component={CarProfile} />
          <Stack.Screen options={{ headerShown: false }} name="map" component={Map} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
