import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Pressable,
} from 'react-native';
import { screenWidth } from '../../utils/dimenstions';
import Svg from '../../lib/svg';
import { Cash, deletIcon, editIcon, homeBlackIcon, locationBlackIcon } from '../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { StyleGuide } from '../../../StyleGuide';

import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    getResponsiveSize,
    getResponsiveFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
} from '../../lib/responsiveStyles';
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
    estimatedTime?: string;
    onShowDetailsPress?: () => void;
    style?: object;
}

const car = require('../../../assets/images/car1.png');
const profile = require('../../../assets/images/profile.png');

const PaymentReceiptCard: React.FC<RideInfoCardProps> = ({
    driverName = "RR Cullinan",
    driverRating = 5.5,
    carModel = "Rolls Royce Cullinan",
    carColor = "White",
    licensePlate = "CF 21536",
    driverImage = "https://via.placeholder.com/60x60/8B4513/FFFFFF?text=YA",
    currentLocation = "Zone 55 House 25 Street 873 ",
    officeLocation = "Zone 55 House 25 Street 873 ",
    distance = "2.7km",
    estimatedTime = "1 Hour",
    onShowDetailsPress,
    style,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const styles = createStyles(isExpanded);
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
        outputRange: [0, getResponsiveSize(140)],
    });

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeText}>
                    December 2, 2024 
                    <Text style={styles.separator}> | </Text>
                    3:00 PM
                </Text>
            </View>

            <View style={styles.header}>
                <Pressable 
                    onPress={() => navigation.navigate('carProfile')} 
                    style={styles.carSection}
                >
                    <Image
                        source={car}
                        style={styles.carImage}
                        resizeMode="contain"
                    />
                    <Image
                        source={profile}
                        style={styles.driverImage}
                    />
                </Pressable>

                <View style={styles.driverInfo}>
                    <View style={styles.driverNameContainer}>
                        <Text style={styles.driverName} numberOfLines={1}>
                            {driverName}
                        </Text>
                        <Text style={styles.rating}>
                            {driverRating} 
                            <Text style={styles.starIcon}> ⭐</Text>
                        </Text>
                    </View>
                   
                    <Text style={styles.carDetails} numberOfLines={1}>
                        ({carColor}) {licensePlate}
                    </Text>

                    <View style={styles.driverDetailsContainer}>
                        <View style={styles.driverNameRatingContainer}>
                            <Text style={styles.driverImageName} numberOfLines={1}>
                                Yousuf Abd
                            </Text>
                            <Text style={styles.driverRating}>
                                4.5
                                <Text style={styles.starIconSmall}> ⭐</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.paymentContainer}>
                <View style={styles.cashContainer}>
                    <Svg xml={Cash} rest={{ height: getResponsiveSize(16), width: getResponsiveSize(16) }} />
                    <Text style={styles.cashText}>Cash</Text>
                </View>
                
                <TouchableOpacity style={styles.showDetailsButton} onPress={toggleExpanded}>
                    <Text style={styles.showDetailsText}>
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expandable Details Section */}
            <View>
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
                        <View style={styles.locationItem}>
                            <View style={styles.locationIcon}>
                                <Svg xml={locationBlackIcon} rest={{ height: getResponsiveSize(18), width: getResponsiveSize(18) }} />
                            </View>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>Current Location</Text>
                                <Text numberOfLines={2} style={styles.locationAddress}>
                                    {currentLocation}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.locationDivider} />

                        <View style={[styles.locationItem, { marginTop: getResponsiveSize(10) }]}>
                            <View style={styles.locationIcon}>
                                <Svg xml={homeBlackIcon} rest={{ height: getResponsiveSize(18), width: getResponsiveSize(18) }} />
                            </View>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>Office</Text>
                                <Text numberOfLines={2} style={styles.locationAddress}>
                                    {officeLocation}
                                </Text>
                            </View>
                            <View style={styles.distanceContainer}>
                                <Text style={styles.distance}>{distance}</Text>
                                <Text style={styles.estimatedTime}>{estimatedTime}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const createStyles =(isExpanded=false)=> StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: getResponsiveSize(12),
        borderWidth: 1,
        borderColor: StyleGuide.color.primary,
        borderBottomRightRadius: getResponsiveSize(20),
        marginBottom: getResponsiveSize(20),
        marginHorizontal: getResponsiveSize(5),
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: getResponsiveSize(20),
        paddingTop: getResponsiveSize(10),
    },
    dateTimeText: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.grey,
        fontFamily: StyleGuide.fontFamily.regular,
    },
    separator: {
        color: StyleGuide.color.primary,
        fontSize: getResponsiveFontSize(14),
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: getResponsiveSize(10),
        paddingTop: getResponsiveSize(10),
        backgroundColor: '#FFFFFF',
    },
    carSection: {
        justifyContent: 'center',
        position: 'relative',
        minWidth: getResponsiveSize(120),
    },
    carImage: {
        width: getResponsiveSize(120),
        height: getResponsiveSize(70),
        maxWidth: SCREEN_WIDTH * 0.35,
    },
    driverInfo: {
        flex: 1,
        paddingHorizontal: getResponsiveSize(15),
        paddingRight: getResponsiveSize(10),
        justifyContent: 'center',
    },
    driverNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getResponsiveSize(4),
    },
    driverName: {
        fontSize: getResponsiveFontSize(isSmallScreen ? 14 : 16),
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: getResponsiveSize(8),
        fontFamily: StyleGuide.fontFamily.bold,
    },
    rating: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.semiBold,
        flexShrink: 0,
    },
    starIcon: {
        fontSize: getResponsiveFontSize(10),
        marginLeft: getResponsiveSize(9),
        textAlign:'center'
    },
    carDetails: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.regular,
        marginBottom: getResponsiveSize(8),
    },
    driverDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    driverNameRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    driverImage: {
        width: getResponsiveSize(35),
        height: getResponsiveSize(35),
        borderRadius: getResponsiveSize(20),
        position: 'absolute',
        right: getResponsiveSize(-8),
        bottom: getResponsiveSize(5),
        zIndex: 1,
    },
    driverImageName: {
        fontSize: getResponsiveFontSize(12),
        fontWeight: '600',
        color: '#333',
        marginRight: getResponsiveSize(8),
        flex: 1,
        fontFamily: StyleGuide.fontFamily.semiBold,
    },
    driverRating: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.semiBold,
        flexShrink: 0,
    },
    starIconSmall: {
        fontSize: getResponsiveFontSize(10),
        marginLeft: getResponsiveSize(2),
    },
    paymentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: getResponsiveSize(20),
        alignItems: 'center',
        marginTop: getResponsiveSize(25),
    },
    cashContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:10
    },
    cashText: {
        marginLeft: getResponsiveSize(10),
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
        fontSize: getResponsiveFontSize(14),
    },
    showDetailsButton: {
        alignSelf: 'flex-end',
        backgroundColor: StyleGuide.color.primary,
        paddingHorizontal: getResponsiveSize(16),
        flexDirection: 'row',
        borderTopLeftRadius: getResponsiveSize(20),
        borderBottomRightRadius:isExpanded?0: getResponsiveSize(20),
        minHeight: getResponsiveSize(40),
        alignItems: 'center',
    },
    showDetailsText: {
        color: StyleGuide.color.white,
        fontSize: getResponsiveFontSize(isSmallScreen ? 12 : 14),
        fontWeight: '500',
        paddingVertical: getResponsiveSize(10),
        paddingHorizontal: getResponsiveSize(5),
        fontFamily: StyleGuide.fontFamily.medium,
    },
    expandableSection: {
        overflow: 'hidden',
    },
    expandableContent: {
        paddingVertical: getResponsiveSize(15),
        paddingHorizontal: getResponsiveSize(15),
        backgroundColor: StyleGuide.color.primary,
        borderBottomLeftRadius: getResponsiveSize(15),
        borderBottomRightRadius: getResponsiveSize(15),
        minHeight: getResponsiveSize(120),
        marginBottom: getResponsiveSize(5),
        overflow: 'hidden',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getResponsiveSize(5),
    },
    locationIcon: {
        width: getResponsiveSize(30),
        height: getResponsiveSize(30),
        borderRadius: getResponsiveSize(15),
        backgroundColor: StyleGuide.color.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: getResponsiveSize(12),
        flexShrink: 0,
    },
    locationTextContainer: {
        flex: 1,
        minHeight: getResponsiveSize(50),
        paddingRight: getResponsiveSize(10),
    },
    locationLabel: {
        fontSize: getResponsiveFontSize(14),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
        marginBottom: getResponsiveSize(4),
    },
    locationAddress: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        opacity: 0.9,
        lineHeight: getResponsiveFontSize(16),
    },
    locationDivider: {
        width: getResponsiveSize(2),
        height: getResponsiveSize(35),
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: getResponsiveSize(14),
        marginVertical: getResponsiveSize(-20),
    },
    distanceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: getResponsiveSize(60),
        flexShrink: 0,
    },
    distance: {
        fontSize: getResponsiveFontSize(16),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.bold,
        textAlign: 'right',
    },
    estimatedTime: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        textAlign: 'right',
    },
});

export default PaymentReceiptCard;