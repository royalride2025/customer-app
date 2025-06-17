import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/stackNavigation';
import SplashScreen from 'react-native-splash-screen';


const App: React.FC = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
