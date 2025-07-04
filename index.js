/**
 * @format
 */

import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import React from 'react';
import {Provider} from 'react-redux';
import store from './src/redux/store'; // Adjust path to your store
import App from './App';
import {name as appName} from './app.json';

// Create a wrapper component with Redux Provider
const AppWithProvider = () => (

    <App />
 
);

AppRegistry.registerComponent(appName, () => AppWithProvider);