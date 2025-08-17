import React, { useEffect, useState } from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../../../redux/reduxHooks';
import { setToken, setUser } from '../../../redux/authSlice';
import networkClient from '../../../../networkClient';
import { API_ENDPOINTS } from '../../../../apiEndpoints';


const useGoogleLogin = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive'],
      webClientId: '619574928613-ethj6rkbukf80v0skp343h2ss6ccj2sf.apps.googleusercontent.com',
      offlineAccess: true,
      forceConsentPrompt: true,
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      googleServicePlistPath: '',
    });
  }, []);

  const sendToBackend = async (idToken) => {
    try {
      const body = {
        idToken,
        role: 'customer',
      };
      
      console.log('Google auth body:', body);
      
      const response = await networkClient.post(API_ENDPOINTS.GOOGLE_AUTH, body);
      
      if (response.data && response.data.token) {
        // Dispatch to Redux store
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        
        // Show success toast
        Toast.show({ 
          type: 'success', 
          text1: 'Success', 
          text2: response?.data?.message || 'Google sign-in successful' 
        });
        
        // Navigate to main screen
        navigation.navigate('Main', { screen: 'Home' });
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      console.error('Backend error:', error);
      const message = error?.response?.data?.message || error.message || 'Something went wrong';
      Toast.show({ 
        type: 'error', 
        text1: 'Authentication Failed', 
        text2: message 
      });
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Get user info
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
      
      console.log('User Info:', userInfo);
      console.log('ID Token:', userInfo.idToken);
      
      // Send to your backend
      await sendToBackend(userInfo?.data?.idToken);
      
    } catch (error) {
      // Handle Google Sign-In specific errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign in');
        return; // Don't show error for user cancellation
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in already in progress');
        return; // Don't show error for in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: 'Google Play Services not available' 
        });
      } else {
        // For any other error (including backend errors), show generic message
        console.error('Sign in error:', error);
        Toast.show({ 
          type: 'error', 
          text1: 'Sign In Failed', 
          text2: 'Something went wrong' 
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const checkSignedIn = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const currentUser = await GoogleSignin.getCurrentUser();
        setUserInfo(currentUser);
      }
    } catch (error) {
      console.error('Check signed in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    googleLogin,
    googleLoading,
    userInfo,
    checkSignedIn,
    signOut,
  };
};

export default useGoogleLogin;