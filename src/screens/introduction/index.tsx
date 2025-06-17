import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from '../introduction/intro.styles';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
const manBg=require('../../../assets/images/manBg.png')
const logo=require('../../../assets/images/logo.png')
const nextButton=require('../../../assets/images/nextStep.png')
const arrowRight=require('../../../assets/images/arrowRight.png')


const App = () => {
  const [progress, setProgress] = useState(0);

  const navigation =useNavigation()
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval); 
          navigation.navigate('login');
          return 100;
        }
        return prev + 5; 
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.imageContainer}>
        <Image
          source={manBg}
          style={styles.backgroundImage}
          resizeMode="stretch"
        />

      </View>

      <View style={styles.contentContainer}>
    
    

        <Image
          source={logo}
          style={{width:70,height:60}}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>Welcome to ROYAL RIDE</Text>
          <Text style={styles.welcomeSubtitle}>
            Are you ready to elevate your{'\n'}ride experience?
          </Text>
        </View>
        <AnimatedCircularProgress
          size={65}
          width={2}
          fill={progress}
          tintColor="#000"
          backgroundColor="#707071"
          style={{ marginTop:5}}
        >
          {() => (
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Image
                source={arrowRight}
                style={styles.arrow}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </AnimatedCircularProgress>
       
      </View>
    </View>
  );
};



export default App;