// LoginStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import { StyleGuide } from '../../../StyleGuide';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
...StyleGuide.layout.container
  },
  scrollContainer: {
    flexGrow: 1,
    // paddingHorizontal: screenWidth * 0.04, 
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: screenHeight * 0.09, 
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: StyleGuide.color.white,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minHeight: screenHeight * 0.07,
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    backgroundColor: StyleGuide.color.white,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: StyleGuide.color.border,
    minHeight: screenHeight * 0.07,
  },
  phoneInput: {
    flex: 1,
    fontSize: screenWidth * 0.03,
    color: '#858586',
    paddingVertical: 16,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  logoContainer: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    maxWidth: 80,
    maxHeight: 80,
    minWidth: 60,
    minHeight: 60,
    backgroundColor: '#D4B896',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  brandName: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: '300',
    color: '#333',
    letterSpacing: 3,
  },
  title: {
    fontSize: screenWidth * 0.05,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
    textAlign: 'center',
    marginBottom: screenHeight * 0.05,
    marginTop: screenHeight * 0.013,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: screenHeight * 0.032,
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: Math.min(screenWidth * 0.04, 18),
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  loginLink: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: screenWidth * 0.03,
    marginTop: screenHeight * 0.05,
  },
  termsText: {
    fontSize: Math.min(screenWidth * 0.038, 18),
    color: StyleGuide.color.black,
    textAlign: 'center',
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: 26,
  },
  termsLink: {
    fontSize: Math.min(screenWidth * 0.038, 18),
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.semiBold,
    lineHeight: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 16,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  forgotPasswordText: {
    fontSize: Math.min(screenWidth * 0.035, 14),
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
    textDecorationLine: 'underline',
  },
  remembermeContainermain:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  remembermeContainer:{
    height:20,
    width:20,
    borderRadius:5,
    backgroundColor:StyleGuide.color.primary,
    justifyContent:'center',
    alignItems:'center'
  },
  remembermeText:{
    marginLeft:6,
    fontFamily:StyleGuide.fontFamily.semiBold,
    fontSize:14
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily:StyleGuide.fontFamily.medium,
    color:StyleGuide.color.black
  },
  codeFieldRoot: { marginTop: 10 },
  cell: {
    width: 52,
    height: 52,
    fontSize: 24,
    borderWidth: 1.5,
    borderColor: StyleGuide.color.grey,
    textAlign: 'center',
    color: '#000', 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',   
    lineHeight: 52,
  },
  focusCell: {
    borderColor: StyleGuide.color.primary,
  },
});
export default styles;
