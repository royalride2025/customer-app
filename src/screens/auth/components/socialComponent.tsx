// SocialLogin.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import { apple, facebook, google } from '../../../../assets/svgAssets';
// import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SocialLogin = ({ onSocialLogin }) => {
    return (
        <>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

           
            <View style={styles.socialContainer}>
                <TouchableOpacity onPress={() => onSocialLogin('Apple')}>
                    <Svg xml={apple} rest={{ height: 24, width: 24 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onSocialLogin('Google')}  >
                    <Svg xml={google} rest={{ height: 24, width: 24 }} />
                </TouchableOpacity>

                {/* <TouchableOpacity onPress={() => onSocialLogin('Facebook')}>
                    <Svg xml={facebook} rest={{ height: 24, width: 24 }} />
                </TouchableOpacity> */}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenHeight * 0.04,
        justifyContent:'center'
    },
    dividerLine: {
        // flex: 1,
        height: 2,
        backgroundColor: StyleGuide.color.black,
        width:125,
        
    },
    dividerText: {
        fontSize: Math.min(screenWidth * 0.035, 16),
        color: StyleGuide.color.black,
        marginHorizontal: 8,
        fontFamily: StyleGuide.fontFamily.semiBold
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: screenWidth * 0.045,
        alignItems: 'center',
    },
    socialButton: {
        width: screenWidth * 0.13,
        height: screenWidth * 0.13,
        maxWidth: 50,
        maxHeight: 50,
        minWidth: 40,
        minHeight: 40,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
});

export default SocialLogin;