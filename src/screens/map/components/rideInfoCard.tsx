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
import { homeBlackIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_WIDTH,
    SCREEN_HEIGHT,
    getResponsiveSize,
    getResponsiveFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen, } from '../../../lib/responsiveStyles';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { RootState } from '../../../redux/store';
import { useAppSelector } from '../../../redux/reduxHooks';
import { t } from 'i18next';

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
    onCallPress?: () => void;
    onMessagePress?: () => void;
    onShowDetailsPress?: () => void;
    style?: object;
}

const car = require('../../../../assets/images/car1.png');
const profile = require('../../../../assets/images/profile.png');

const RideInfoCard: React.FC<RideInfoCardProps> = ({
    driverName = "RR Cullinan",
    driverRating = 5.5,
    carModel = "Rolls Royce Cullinan",
    carColor = "White",
    licensePlate = "CF 21536",
    driverImage = "https://via.placeholder.com/60x60/8B4513/FFFFFF?text=YA",
    currentLocation = "Zone 55 House 25 Street 873 South Muajther Doha",
    officeLocation = "Zone 55 House 25 Street 873 South Muajther Doha",
    distance = "2.7km",
    estimatedTime = "1 Hour",
    onCallPress,
    onMessagePress,
    onShowDetailsPress,
    style,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const { flexDirection,flipImage } = useTranslationStyles();
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
        outputRange: [0, getResponsiveSize(155)], // Increased height
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const styles = createStyles(isExpanded);

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={[styles.header,flexDirection]}>
                <Pressable 
                    onPress={() => navigation.navigate('carProfile')} 
                    style={styles.carSection}
                >
                    <Image
                        source={car}
                        style={[styles.carImage, flipImage]}
                        resizeMode="contain"
                    />
                    <Image
                        source={profile}
                        style={[styles.driverImage, isRTL ? { left: -3,bottom:5 } : { right: -10,bottom:5 }]}
                        resizeMode="cover"
                    />
                </Pressable>

                <View style={styles.driverInfo}>
                    <View style={[styles.driverNameRow,flexDirection]}>
                        <Text style={[styles.driverName,isRTL?{marginLeft:getResponsiveSize(10),textAlign:'right'}:{marginRight:getResponsiveSize(8),textAlign:'left'}]} numberOfLines={1}>
                        {t('rideInfo.driverName')}
                        </Text>
                        <Text style={styles.rating}>
                            {driverRating} 
                            <Text style={styles.starIcon}> ⭐</Text>
                        </Text>
                    </View>
                   
                    <Text style={[styles.carDetails,{textAlign:isRTL?'right':'left'}]} numberOfLines={1}>
                    {t('rideInfo.carModel', { carModel })} ({carColor}) {t('rideInfo.licensePlate', { licensePlate })}
                    </Text>
                    
                    <View style={[styles.bottomRow,flexDirection]}>
                        <View style={[styles.driverDetailsRow,flexDirection]}>
                            <Text style={[styles.driverImageName,isRTL?{marginLeft:getResponsiveSize(8),textAlign:'right'}:{marginRight: getResponsiveSize(8),textAlign:'left'}]} numberOfLines={1}>
                            {t('rideInfo.driverFullName')}
                            </Text>
                            <Text style={[styles.driverRating]}>
                                4.5 <Text style={styles.starIcon}>⭐</Text>
                            </Text>
                        </View>
                    
                        <View style={[styles.actionButtons,flexDirection,isRTL?{marginRight:5}:{marginLeft:0}]}>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={onCallPress}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.actionButtonText}>📞</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={onMessagePress}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.actionButtonText}>💬</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.showDetailsButton,{
                    alignSelf: isRTL ? 'flex-start' : 'flex-end',
                    borderTopLeftRadius: isRTL ? 0 : getResponsiveSize(18), 
                    borderTopRightRadius: isRTL ? getResponsiveSize(18) : 0, 
                    borderBottomLeftRadius: isRTL&&isExpanded ? 0 : getResponsiveSize(16), 
                    borderBottomRightRadius: isRTL ? 0 : getResponsiveSize(16),
                }]} 
                onPress={toggleExpanded}
                activeOpacity={0.8}
            >
                <Text style={styles.showDetailsText}>
                {isExpanded ? t('rideInfo.hideDetails') : t('rideInfo.showDetails')}
                </Text>
            </TouchableOpacity>

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
                            <Svg xml={locationBlackIcon} rest={{
                                height: getResponsiveSize(18),
                                width: getResponsiveSize(18)
                            }}/>
                        </View>
                        <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.locationLabel}>{t('rideInfo.currentLocation')}</Text>
                            <Text numberOfLines={2} style={[styles.locationAddress, { width: '90%', textAlign: isRTL ? 'right' : 'left' }]}>
                                {currentLocation}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.locationDivider, isRTL ? { marginRight: 14 } : { marginLeft: 14 }, { alignSelf: 'flex-end' }]} />


                    <View style={[styles.locationItem, styles.officeLocationItem,flexDirection]}>
                        <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                            <Svg xml={homeBlackIcon} rest={{
                                height: getResponsiveSize(18),
                                width: getResponsiveSize(18)
                            }}/>
                        </View>
                        <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.locationLabel}>{t('rideInfo.officeLocation')}</Text>
                            <Text numberOfLines={2} style={[styles.locationAddress,{textAlign:isRTL?'right':'left'}]}>
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
    );
};

const createStyles = (isExpanded = false) => StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: getResponsiveSize(20),
        marginHorizontal: getResponsiveSize(16),
        marginVertical: getResponsiveSize(8),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        // Remove overflow hidden to prevent cutting
        maxWidth: isLargeScreen ? SCREEN_WIDTH * 0.9 : '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        padding: getResponsiveSize(10),
        backgroundColor: '#FFFFFF',
        minHeight: getResponsiveSize(100),
        borderTopLeftRadius: getResponsiveSize(20),
        borderTopRightRadius: getResponsiveSize(20),
        overflow: 'hidden', // Only hide overflow for header
    },
    carSection: {
        justifyContent: 'center',
        position: 'relative',
        width: isSmallScreen ? getResponsiveSize(100) : getResponsiveSize(120),
    },
    carImage: {
        width: '100%',
        height: getResponsiveSize(80),
        maxWidth: getResponsiveSize(120),
    },
    driverInfo: {
        flex: 1,
        paddingHorizontal: getResponsiveSize(15),
        justifyContent: 'space-between',
        minWidth: 0, // Prevents flex child from overflowing
    },
    driverNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getResponsiveSize(4),
    },
    driverName: {
        fontSize: getResponsiveFontSize(16),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.bold,
        flex: 1,
        // marginRight: getResponsiveSize(8),
      
    },
    rating: {
        fontSize: getResponsiveFontSize(14),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.medium,
        flexShrink: 0,
    },
    starIcon: {
        fontSize: 10,
    },
    carDetails: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.regular,
        marginBottom: getResponsiveSize(15),
        // lineHeight:16
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    driverDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: getResponsiveSize(8),
    },
    driverImage: {
        width: getResponsiveSize(40),
        height: getResponsiveSize(40),
        borderRadius: getResponsiveSize(20),
        position: 'absolute',
        right: getResponsiveSize(-10),
        bottom: getResponsiveSize(5),
        zIndex: 1,
    },
    driverImageName: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.medium,
        
        flex: 1,
    },
    driverRating: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.medium,
        flexShrink: 0,
    },
    actionButtons: {
        flexDirection: 'row',
        // gap: getResponsiveSize(),
    },
    actionButton: {
        width: getResponsiveSize(25),
        // height: getResponsiveSize(40),
        // borderRadius: getResponsiveSize(20),
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0,0,0,0.05)',
    },
    actionButtonText: {
        fontSize: getResponsiveFontSize(14),
    },
    showDetailsButton: {
        alignSelf: 'flex-end',
        backgroundColor: StyleGuide.color.primary,
        paddingHorizontal: getResponsiveSize(16),
        borderTopLeftRadius: getResponsiveSize(20),
        borderBottomRightRadius: isExpanded ? 0 : getResponsiveSize(16),
    },
    showDetailsText: {
        color: StyleGuide.color.white,
        fontSize: getResponsiveFontSize(10),
        fontFamily: StyleGuide.fontFamily.semiBold,
        paddingVertical: getResponsiveSize(5),
    },
    expandableSection: {
        overflow: 'hidden',
    },
    expandableContent: {
        paddingVertical: getResponsiveSize(15),
        paddingHorizontal: getResponsiveSize(15),
        backgroundColor: StyleGuide.color.primary,
        borderBottomLeftRadius: getResponsiveSize(20),
        borderBottomRightRadius: getResponsiveSize(20),
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    officeLocationItem: {
        marginTop: getResponsiveSize(10),
    },
    locationIcon: {
        width: getResponsiveSize(30),
        height: getResponsiveSize(30),
        borderRadius: getResponsiveSize(15),
        backgroundColor: StyleGuide.color.white,
        justifyContent: 'center',
        alignItems: 'center',
        // marginRight: getResponsiveSize(12),
    },
    locationTextContainer: {
        flex: 1,
        marginRight: getResponsiveSize(8),
    },
    locationLabel: {
        fontSize: getResponsiveFontSize(14),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
        marginBottom: getResponsiveSize(2),
    },
    locationAddress: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        opacity: 0.9,
        lineHeight: getResponsiveFontSize(16),
    },
    locationDivider: {
        width: 2,
        height: getResponsiveSize(52),
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: getResponsiveSize(14),
        marginVertical: getResponsiveSize(-25),
    },
    distanceContainer: {
        alignItems: 'flex-end',
        flexShrink: 0,
    },
    distance: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
    },
    estimatedTime: {
        fontSize: getResponsiveFontSize(12),
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
    },
});

export default RideInfoCard;