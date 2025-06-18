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
import ForgetPassword from '../screens/auth/forgetPassword';
import Otp from '../screens/auth/otp';
import Map from '../screens/map';
import CarProfile from '../screens/profile/carProfile';
import DrawerNavigator from './drawerNavigator';
import Transactions from '../screens/trasaction';

import CustomerClientChat from '../screens/customerChat';
import PaymentReceipt from '../screens/paymentReciept';


// Define the types for the navigator
export type RootStackParamList = {
  Introduction: undefined;
  login: undefined;
  signUp: undefined
  bottomTabs: undefined
  makeTrip:undefined
  rentRide:undefined
  bookRide:undefined
  forgetPassword:undefined
  otp:undefined
  map:undefined
  carProfile:undefined
  drawerNavigator:undefined
  Main: undefined;
  transaction:undefined
  paymentReceipt:undefined
  customerChat:undefined
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Introduction">
      <Stack.Screen options={{ headerShown: false }} name="Introduction" component={Introduction} />
      <Stack.Screen options={{ headerShown: false }} name="login" component={Login} />
      <Stack.Screen options={{ headerShown: false }} name="signUp" component={Signup} />
      {/* <Stack.Screen options={{ headerShown: false }} name="bottomTabs" component={BottomTabs} /> */}
      <Stack.Screen options={{ headerShown: false }} name="Main" component={DrawerNavigator} />
      <Stack.Screen  name="makeTrip" component={MakeTrip} />
      <Stack.Screen  name="transaction" component={Transactions} />
      <Stack.Screen options={{ headerShown: false }} name="paymentReceipt" component={PaymentReceipt} />
      <Stack.Screen options={{ headerShown: false }} name="customerChat" component={CustomerClientChat} />



      <Stack.Screen  name="rentRide" component={RentRide} />
      <Stack.Screen  name="bookRide" component={BookRide} />
      <Stack.Screen  name="forgetPassword" component={ForgetPassword} />
      <Stack.Screen  name="otp" component={Otp} />
      <Stack.Screen  name="carProfile" component={CarProfile} />
      <Stack.Screen options={{ headerShown: false }} name="map" component={Map} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
