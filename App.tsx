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

// Inner component that handles language changes
const AppContent: React.FC = () => {
  const language = useAppSelector((state: RootState) => state.language.language);

  useEffect(() => {
    // Change i18n language when Redux language changes
    changeLanguage(language);
    // ALWAYS keep LTR layout regardless of language
    console.log('Language changed to:', language, 'but layout remains LTR');
  }, [language]);

  return (
    <NavigationContainer>
      <AppNavigator />
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;