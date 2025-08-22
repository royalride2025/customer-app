import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview'; // Import WebView
import { StyleGuide } from '../../../StyleGuide';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';

const PrivacyPolicy = () => {
  const [webViewVisible, setWebViewVisible] = useState(false); // Manage WebView visibility

  useEffect(() => {
    console.log('App component mounted');
  }, []);

  useScreenHeader({
    title: 'Privacy Policy',
    showBackButton: true,
  });
  const handlePress = () => {
    setWebViewVisible(true); // Show WebView when button is pressed
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

      <WebView
        source={{ uri: 'https://app.royalride.qa/privacy' }} // URL of the webpage to display
        style={styles.webView}
        startInLoadingState={true} // Shows loading spinner while the page is loading
        contentInsetAdjustmentBehavior="never" // iOS: avoid extra top inset
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1, // Make the WebView fill the screen
    width: '100%',
  },
});

export default PrivacyPolicy;
