import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Import Firebase messaging for background message handling
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // You can perform background tasks here
  // For example, update local storage, sync data, etc.
  
  return Promise.resolve();
});

AppRegistry.registerComponent(appName, () => App);