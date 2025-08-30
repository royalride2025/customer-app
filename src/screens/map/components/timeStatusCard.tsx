import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, Dimensions } from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { RootState } from '../../../redux/store';
import { useAppSelector } from '../../../redux/reduxHooks';

// Get screen width for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StatusCardProps {
    icon?: string;
    title?: string;
    waitingTime?: string;
    waitingLabel?: string;

    // Style props
    containerStyle?: ViewStyle;
    leftSectionStyle?: ViewStyle;
    rightSectionStyle?: ViewStyle;
    iconContainerStyle?: ViewStyle;
    iconStyle?: TextStyle;
    titleStyle?: TextStyle;
    waitingLabelStyle?: TextStyle;
    timeStyle?: TextStyle;

    // Quick style overrides
    backgroundColor?: string;
    titleColor?: string;
    timeColor?: string;
    iconBackgroundColor?: string;
    shadowColor?: string;
}

const logo = require('../../../../assets/images/logo.png');

const TimeStatusCard: React.FC<StatusCardProps> = ({
    icon = "🚗",
    title = "The Driver is heading toward you.",
    waitingTime = "2:12",
    waitingLabel = "Waiting Time",

    // Style props
    containerStyle,
    leftSectionStyle,
    rightSectionStyle,
    iconContainerStyle,
    iconStyle,
    titleStyle,
    waitingLabelStyle,
    timeStyle,

    // Quick overrides
    backgroundColor = "#f8f9fa",
    titleColor = "#1a1a1a",
    timeColor = "#d4a574",
    iconBackgroundColor = "#d4a574",
    shadowColor = "#000",
}) => {
    const { flexDirection } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
    return (
        <View
            style={[
                styles.container,
                { backgroundColor, shadowColor },
                containerStyle,
            ]}
        >
            <View style={[styles.leftSection, leftSectionStyle,flexDirection]}>
                <Image resizeMode='contain' source={logo} style={styles.logo} />
                <Text style={[styles.waitingLabel, waitingLabelStyle]}>
                    {waitingLabel}
                </Text>
            </View>

            <View style={[styles.rightSection, rightSectionStyle,flexDirection]}>
                <Text style={[styles.title, titleStyle]}>
                    {title}
                </Text>
                <Text
                    style={[
                        styles.time,
                        { color: timeColor },
                        timeStyle
                    ]}
                >
                    {waitingTime} mins
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: screenWidth * 0.05, // 5% of screen width for horizontal padding
        paddingVertical: 10,
        marginHorizontal: screenWidth * 0.04, // 4% of screen width for margin
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        width: '92%',
    },
    title: {
        fontSize: screenWidth * 0.030, // Font size based on screen width
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
        // lineHeight: 22,
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        height: 35,
        width: 50,
        marginBottom: 5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    waitingLabel: {
        fontSize: screenWidth * 0.03, // Adjust font size for smaller devices
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
    },
    time: {
        fontSize: screenWidth * 0.033, // Larger font size for time
        fontFamily: StyleGuide.fontFamily.bold,
        color: StyleGuide.color.black,
    },
});

export default TimeStatusCard;
