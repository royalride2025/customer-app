import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppNavigator from './src/navigation/stackNavigation';
import SplashScreen from 'react-native-splash-screen';
import './i18n'; // This initializes i18n
import store, { RootState, persistor } from './src/redux/store';
import { changeLanguage } from './i18n'; // Import the language change function
import { useAppSelector } from './src/redux/reduxHooks';
import socket from './src/services/socket';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { StyleGuide } from './StyleGuide';
import { Platform, StatusBar } from 'react-native';
import { useNotifications } from './src/lib/hooks/useNotifications';

const toastConfig = {
  success: (props: any) => {
    console.log('Success toast props:', props);
    return (
      <BaseToast
        {...props}
        style={{ 
          borderLeftColor: '#4CAF50',
          marginTop: Platform.OS === 'ios' ? 60 : 0,
          marginHorizontal: 20,
          borderRadius: 8,
          height: 60,
          zIndex: 999999,
          elevation: 999999,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontFamily: StyleGuide.fontFamily.medium,
          color: '#4CAF50'
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: StyleGuide.fontFamily.regular,
          color: '#666'
        }}
      />
    );
  },
  error: (props: any) => {
    console.log('Error toast props:', props);
    return (
      <ErrorToast
        {...props}
        style={{ 
          borderLeftColor: '#F44336',
          marginTop: Platform.OS === 'ios' ? 60 :30 ,
          marginHorizontal: 20,
        
          borderRadius: 8,
          height: 60,
          zIndex: 999999,
          elevation: 999999,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontFamily: StyleGuide.fontFamily.medium,
          color: '#F44336'
        }}
        text2Style={{
          fontSize: 12,
          fontFamily: StyleGuide.fontFamily.regular,
          color: '#666'
        }}
      />
    );
  },
};

// Inner component that handles language changes
const AppContent: React.FC = () => {
  const language = useAppSelector((state: RootState) => state.language.language);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);
  
  // Initialize notifications
  const { fcmToken, permissionGranted, isInitialized } = useNotifications();

  console.log('user========/////////', user);
  console.log('token========/////////', token);
  console.log('FCM Token========/////////', fcmToken);
  console.log('Notification Permission========/////////', permissionGranted);

  useEffect(() => {
    // Change i18n language when Redux language changes
    changeLanguage(language);
    // ALWAYS keep LTR layout regardless of language
    console.log('Language changed to:', language, 'but layout remains LTR');
  }, [language]);

 // Socket connection logic: connect after login, disconnect on logout/unmount
 useEffect(() => {
  if (token) {
    socket.connect(token);
    console.log('Socket connecting with token:', token);
    // Remove any previous connect listeners to avoid duplicate emits
    socket.off('connect');
    socket.on('connect', () => {
      console.log('Socket connected:', socket.socket?.id);
      // Emit register event only after socket is connected
      if (user && user.id) {
        socket.emit('register', { userId: user?.id, userType: user.role },
        );
        console.log('Registered as driver: ' + user.id);
      }
    });
   
  }
  return () => {
    socket.disconnect();
    console.log('Socket disconnected (cleanup)');
  };
}, [token, user]);

  return (
    <NavigationContainer>
      <AppNavigator />
      <Toast 
        config={toastConfig} 
        position="top"
        topOffset={Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20}
      />
    </NavigationContainer>
  );
};

// Main App component
const App: React.FC = () => {
  useEffect(() => {
    SplashScreen.hide();
    // Force LTR layout at app startup
    console.log('App initialized with LTR layout');
  }, []);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;