// src/styles/IntroScreenStyles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const IntroScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 0.8,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },

  contentContainer: {
    flex: 0.4,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    // justifyContent: 'space-between',
    alignItems: 'center',
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom:5,
    marginTop:15,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  getStartedButton: {
    // marginBottom: 20,  
    justifyContent:'center',
    alignItems:'center',
    height:55,
    width:55,
    borderRadius:100,
    backgroundColor: '#D5B482',
  },
  
  arrowText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow:{ width: 22,
    height: 18,}
});

export default IntroScreenStyles;
