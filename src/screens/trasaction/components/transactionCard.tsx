import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Pressable,
    Dimensions,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import { screenWidth } from '../../../utils/dimenstions';
import Svg from '../../../lib/svg';
import { Cash, deletIcon, editIcon, homeBlackIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HORIZONTAL_MARGIN = 20;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_HORIZONTAL_MARGIN * 2);

interface RideInfoCardProps {
    driverName?: string;
    driverRating?: number;
    carModel?: string;
    carColor?: string;
    licensePlate?: string;
    driverImage?: string;
    currentLocation?: string;
    officeLocation?: string;
    distance?: string;
    serviceType: string;
    estimatedTime?: string;
    onShowDetailsPress?: () => void;
    style?: object;
}

const car = require('../../../../assets/images/car1.png');
const profile = require('../../../../assets/images/profile.png');

const TransactionCard: React.FC<RideInfoCardProps> = ({
    driverName = "RR Cullinan",
    driverImage = "https://via.placeholder.com/60x60/8B4513/FFFFFF?text=YA",
    currentLocation = "Zone 55 House 25 Street 873",
    officeLocation = "Zone 55 House 25 Street 873",
    distance = "2.7km",
    estimatedTime = "1 Hour",
    serviceType = "Premium",
    onShowDetailsPress,
    style,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const { flexDirection, flipImage ,textAlignment} = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;

        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setIsExpanded(!isExpanded);

        if (onShowDetailsPress) {
            onShowDetailsPress();
        }
    };

    const navigation = useNavigation();

    const expandedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH < 400 ? 105 : 120],
    });

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // Responsive dimensions
    const isSmallScreen = SCREEN_WIDTH < 400;
    const carImageWidth = isSmallScreen ? 100 : 120;
    const carImageHeight = isSmallScreen ? 60 : 80;

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={[styles.headerRow,flexDirection]}>
                <View style={styles.dateTimeContainer}>
                    <Text style={[styles.dateText, textAlignment]} numberOfLines={1}>
                        December 2, 2024 <Text style={styles.separator}>|</Text> 3:00 PM
                    </Text>
                </View>
                <View style={styles.paymentContainer}>
                    <Svg xml={Cash} rest={{ height: 16, width: 20 }} />
                    <Text style={styles.paymentText} numberOfLines={1}>{t("rideInfo.cash")}</Text>
                </View>
            </View>

            {/* Main Content */}
            <View style={[styles.header,flexDirection]}>
                <Pressable onPress={() => navigation.navigate('carProfile')} style={styles.carSection}>
                    <Image
                        source={car}
                        style={[styles.carImage,flipImage, { width: carImageWidth, height: carImageHeight }]}
                        resizeMode="contain"
                    />
                    <Image
                        source={profile}
                        style={[styles.driverImage,isRTL ? { left: 0,bottom:0 } : { right: -8,bottom:0 }]}
                    />
                </Pressable>

                <View style={styles.driverInfo}>
                    <View style={[styles.driverNameRow,flexDirection]}>
                        <Text style={[styles.driverName,textAlignment,isRTL?{marginStart:5}:{marginEnd:5}]} numberOfLines={1}>
                            {driverName}
                        </Text>
                        <Text style={[styles.serviceType,textAlignment]} numberOfLines={1}>
                            {serviceType}
                        </Text>
                    </View>
                    <Text numberOfLines={2} style={[styles.carDetails,textAlignment]}>
                        Zone 55 House 25 Street 873 Zone 55 House 25
                    </Text>
                </View>
            </View>

            {/* Cost Breakdown */}
            <View style={[styles.costBreakdown,flexDirection]}>
                <View style={styles.costItem}>
                    <Text style={styles.costLabel} numberOfLines={1}>{t('paid_amount')}</Text>
                    <Text style={styles.costValue} numberOfLines={1}>15000 QR</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.costItem}>
                    <Text style={styles.costLabel} numberOfLines={1}>{t('trip_cost')}</Text>
                    <Text style={styles.costValue} numberOfLines={1}>15000 QR</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.costItem}>
                    <Text style={styles.costLabel} numberOfLines={1}>{t('waiting_fee')}</Text>
                    <Text style={styles.costValue} numberOfLines={1}>15 QR</Text>
                </View>
            </View>

            {/* Show Details Button */}
            <View >
                <TouchableOpacity style={[styles.showDetailsButton, {
                    flexDirection: isRTL ? 'row-reverse' : 'row', // Reverse flex direction for RTL
                    alignSelf: isRTL ? 'flex-start' : 'flex-end', // Adjust alignment for RTL
                    borderTopLeftRadius: isRTL ? 0 : 20, // Reverse the corner radius for RTL
                    borderTopRightRadius: isRTL ? 20 : 0, // Reverse the corner radius for RTL
                    borderBottomLeftRadius: isRTL&&isExpanded ? 0 : 8, // Reverse the corner radius for RTL
                    borderBottomRightRadius: isRTL ? 0 : 8, // Reverse the corner radius for RTL
                },]} onPress={toggleExpanded}>
                    <Text style={styles.showDetailsText} numberOfLines={1}>
                    {isExpanded ? t('rideInfo.hideDetails') : t('rideInfo.showDetails')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expandable Details Section */}
            <Animated.View
                style={[
                    styles.expandableSection,
                    {
                        height: expandedHeight,
                        opacity: opacity,
                    }
                ]}
            >
                <View style={styles.expandableContent}>
                    <View style={[styles.locationItem, flexDirection]}>
                        <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                            <Svg xml={locationBlackIcon} rest={{ height: 16, width: 16 }} />
                        </View>
                        <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.locationLabel} numberOfLines={1}>{t('rideInfo.currentLocation')}</Text>
                            <Text numberOfLines={2} style={[styles.locationAddress, { width: '90%', textAlign: isRTL ? 'right' : 'left' }]}>
                                {currentLocation}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.locationDivider, isRTL ? { marginRight: 24 } : { marginLeft: 14 }, { alignSelf: 'flex-end' }]} />

                    <View style={[styles.locationItem, styles.destinationItem,flexDirection]}>
                        <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                            <Svg xml={homeBlackIcon} rest={{ height: 16, width: 16 }} />
                        </View>
                        <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.locationLabel} numberOfLines={1}>{t('rideInfo.officeLocation')}</Text>
                            <Text numberOfLines={2} style={[styles.locationAddress,textAlignment]}>
                                {officeLocation}
                            </Text>
                        </View>
                        <View style={styles.distanceContainer}>
                            <Text style={[styles.distance,!textAlignment]} numberOfLines={1}>{distance}</Text>
                            <Text style={[styles.estimatedTime,!textAlignment]} numberOfLines={1}>{estimatedTime}</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: StyleGuide.color.primary,
        borderBottomRightRadius: 20,
        marginBottom: 20,
        // marginHorizontal: CARD_HORIZONTAL_MARGIN,
        maxWidth: CARD_WIDTH,
        // alignSelf: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SCREEN_WIDTH < 400 ? 12 : 16,
        paddingTop: 10,
        flexWrap: 'wrap',
        minHeight: 35,
    },
    dateTimeContainer: {
        flex: 1,
        marginRight: 10,
    },
    dateText: {
        fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
        color: StyleGuide.color.grey,
        flexShrink: 1,
    },
    separator: {
        color: StyleGuide.color.primary,
        fontSize: SCREEN_WIDTH < 400 ? 12 : 14,
    },
    paymentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
    },
    paymentText: {
        marginLeft: 8,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
        fontSize: SCREEN_WIDTH < 400 ? 12 : 14,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: SCREEN_WIDTH < 400 ? 8 : 12,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
    },
    carSection: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        marginRight: 8,
    },
    carImage: {
        maxWidth: SCREEN_WIDTH * 0.35,
    },
    driverInfo: {
        flex: 1,
        paddingHorizontal: SCREEN_WIDTH < 400 ? 8 : 12,
        marginTop: 5,
        minWidth: 0, 
    },
    driverNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        // flexWrap: 'wrap',
    },
    driverName: {
        fontSize: SCREEN_WIDTH < 400 ? 16 : 18,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.bold,
        // flex: 1,
         maxWidth:screenWidth*0.33,
        
    },
    serviceType: {
        fontSize: SCREEN_WIDTH < 400 ? 10 : 12,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.bold,
        flexShrink: 0,
    },
    carDetails: {
        fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.regular,
        lineHeight: SCREEN_WIDTH < 400 ? 16 : 18,
    },
    driverImage: {
        width: SCREEN_WIDTH < 400 ? 35 : 40,
        height: SCREEN_WIDTH < 400 ? 35 : 40,
        borderRadius: SCREEN_WIDTH < 400 ? 17.5 : 20,
        position: 'absolute',
        zIndex: 1,
    },
    costBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        paddingHorizontal: SCREEN_WIDTH < 400 ? 8 : 12,
    },
    costItem: {
        flex: 1,
        paddingHorizontal: 4,
        minWidth: 0,
    },
    costLabel: {
        fontSize: SCREEN_WIDTH < 400 ? 14 : 16,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.semiBold,
        marginBottom: 5,
    },
    costValue: {
        fontSize: SCREEN_WIDTH < 400 ? 14 : 16,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.semiBold,
    },
    divider: {
        width: 2,
        height: 30,
        backgroundColor: StyleGuide.color.black,
        marginHorizontal: 4,
    },
    buttonContainer: {
        alignItems: 'flex-end',
    },
    showDetailsButton: {
        backgroundColor: StyleGuide.color.primary,
        paddingHorizontal: SCREEN_WIDTH < 400 ? 12 : 16,
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderBottomRightRadius:8 ,
        alignSelf:'flex-end',
        maxWidth: '50%',
    },
    showDetailsText: {
        color: StyleGuide.color.white,
        fontSize: SCREEN_WIDTH < 400 ? 12 : 14,
        fontWeight: '500',
        padding: SCREEN_WIDTH < 400 ? 8 : 10,
    },
    expandableSection: {
        overflow: 'hidden',
    },
    expandableContent: {
        paddingVertical: SCREEN_WIDTH < 400 ? 8 : 10,
        paddingHorizontal: SCREEN_WIDTH < 400 ? 8 : 12,
        backgroundColor: StyleGuide.color.primary,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        minHeight: SCREEN_WIDTH < 400 ? 100 : 120,
        marginBottom: 5,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 40,
    },
    destinationItem: {
        marginTop: 8,
    },
    locationIcon: {
        width: SCREEN_WIDTH < 400 ? 26 : 30,
        height: SCREEN_WIDTH < 400 ? 26 : 30,
        borderRadius: SCREEN_WIDTH < 400 ? 13 : 15,
        backgroundColor: StyleGuide.color.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        flexShrink: 0,
    },
    locationTextContainer: {
        flex: 1,
        paddingRight: 8,
        minWidth: 0,
    },
    locationLabel: {
        fontSize: SCREEN_WIDTH < 400 ? 12 : 14,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: SCREEN_WIDTH < 400 ? 11 : 12,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        opacity: 0.9,
        lineHeight: SCREEN_WIDTH < 400 ? 15 : 16,
    },
    locationDivider: {
        width: 2,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: SCREEN_WIDTH < 400 ? 12 : 14,
        marginVertical: -24,
        borderLeftWidth: 2,
        borderColor: 'white',
        borderStyle: 'dotted',
    },
    distanceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexShrink: 0,
        minWidth: 60,
    },
    distance: {
        fontSize: SCREEN_WIDTH < 400 ? 14 : 16,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.bold,
    },
    estimatedTime: {
        fontSize: SCREEN_WIDTH < 400 ? 10 : 12,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
    },
});

export default TransactionCard;