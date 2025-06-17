import { Platform } from 'react-native';
// import { widthPercentageToDP } from 'react-native-responsive-screen';

export const StyleGuide = {
  fontFamily: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    black: 'Montserrat-Black',
    semiBold: 'Montserrat-SemiBold',
    light: 'Montserrat-Light',
    thin: 'Montserrat-Thin',
    bold: 'Montserrat-Bold',
    extraBold: 'Montserrat-ExtraBold',
  },
  // fontSize: {
  //   textInput: widthPercentageToDP('3.8%'),
  //   buttonText: widthPercentageToDP('3.8%'),
  //   large: widthPercentageToDP('8%'),
  //   medium:
  //     Platform.OS == 'ios'
  //       ? widthPercentageToDP('5.5%')
  //       : widthPercentageToDP('6%'),
  //   small: widthPercentageToDP('3.5%'),
  // },
  color: {
    backgroundColor: '#FAFAFA',
    modalColor: '#F9F9F9',
    primary: '#D5B482',
    secondary:'#F2D5AF',
    border:'#EDEDED',
    grey: '#707071',
    blackishGrey:'#3C3B3C',
    lightGrey: '#ABABAB',
    // heading: '#171717',
    heading: '#383838',
    light: '#f6f6f6',
    white: '#FFFFFF',
    black:'#000000'
  
    
  },
  bottomNavigator: {
    focused: 'Montserrat-Medium',
    blurred: 'Montserrat-Regular',
    fontSize: 13,
  },
  headings: {
    bold: 'Prompt-Medium',
    fontSize: 14,
  },

  layout: {
    container: {
      flex: 1,
      backgroundColor: '#FAFAFA', // Match with your backgroundColor
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
  },
};
