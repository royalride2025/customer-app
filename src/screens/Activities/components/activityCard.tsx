import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Pressable,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import { screenWidth } from '../../../utils/dimenstions';
import Svg from '../../../lib/svg';
import { Cash, deletIcon, editIcon, homeBlackIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/reduxHooks';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import moment from 'moment';

interface RideInfoCardProps {
    driverName?: string;
    driverRating?: number;
    vehicleName: string;
    vehicleModel?: string;
    vehicleColor?: string;
    licensePlate?: string;
    driverImage?: string;
    pickupLocation?: string;
    dropLocation?: string;
    distance?: string;
    carImage: string;
    estimatedTime?: string;
    duration?: any;
    onCallPress?: () => void;
    onMessagePress?: () => void;
    onShowDetailsPress?: () => void;
    style?: object;
    date: any,
    price: any,
    bookingType: string,
    status: any
}

const car = require('../../../../assets/images/car1.png');
const profile = require('../../../../assets/images/profile.png');

const ActivityCard: React.FC<RideInfoCardProps> = ({
    driverName = "driver name",
    vehicleName = 'honda',
    driverRating = 5.5,
    vehicleModel = "Rolls Royce Cullinan",
    vehicleColor = "White",
    licensePlate = "CF 21536",
    carImage = "https://via.placeholder.com/60x60/8B4513/FFFFFF?text=YA",
    pickupLocation = "Zone 55 House 25 Street 873 ",
    dropLocation = "Zone 55 House 25 Street 873 ",
    distance = "2.7km",
    estimatedTime = "1 Hour",
    price = "800",
    duration = 2,
    bookingType,
    onCallPress,
    onMessagePress,
    date,
    status,
    onShowDetailsPress,
    style,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [expandedHeight, setExpandedHeight] = useState(0);
    const { flexDirection, flipImage } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

    // Calculate dynamic height based on booking type
    const calculateExpandedHeight = () => {
        if (bookingType === 'rent') {
            return 80; // Height for just pickup location
        } else {
            return 140; // Height for pickup + drop location
        }
    };

    useEffect(() => {
        setExpandedHeight(calculateExpandedHeight());
    }, [bookingType]);

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

    const navigation = useNavigation()

    const animatedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, expandedHeight], // Use dynamic height
    });

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const formattedDate = moment(date).format('MMM Do YYYY');
    const formattedTime = moment(date).format('h:mm A');
    const capitalizeFirstLetter = (string: any) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    };

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>
                <Text style={{ fontSize: 12, color: StyleGuide.color.grey }}>{formattedDate}<Text style={{ color: StyleGuide.color.primary, fontSize: 14 }}> | </Text>{formattedTime}</Text>
                <Text style={{ fontSize: 12, color: StyleGuide.color.grey }}>{capitalizeFirstLetter(bookingType)}<Text style={{ color: StyleGuide.color.primary, fontSize: 14 }}> | </Text>{capitalizeFirstLetter(status)}</Text>
            </View>

            <View style={[styles.header, flexDirection]}>
                <Pressable onPress={() => navigation.navigate('carProfile')} style={styles.carSection}>
                    <Image
                        source={{ uri: carImage }}
                        style={[styles.carImage, flipImage]}
                        resizeMode="center"
                    />
                    <Image
                        source={profile}
                        style={[styles.driverImage, isRTL ? { left: 0, bottom: 9 } : { right: -10, bottom: 5 }]}
                    />
                </Pressable>

                <View style={styles.driverInfo}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.driverName, { textAlign: isRTL ? 'right' : 'left' }]}>{vehicleName}</Text>
                        <Text style={styles.rating}>{driverRating} <Text style={{ fontSize: 10, textAlign: isRTL ? 'left' : 'right', marginBottom: 2 }}>⭐</Text></Text>
                    </View>

                    <Text style={[styles.carDetails, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {vehicleModel} ({vehicleColor}){'\n'} {t('rideInfo.licensePlate', { licensePlate })}
                    </Text>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginVertical: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                            <Text style={[styles.driverImageName, { textAlign: isRTL ? 'right' : 'left' }]}> {driverName}</Text>
                            <Text style={[styles.driverRating, isRTL ? { marginRight: 7 } : { marginLeft: 4 }]}>4.5{'  '}<Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 2 }}>⭐</Text></Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingLeft: isRTL ? 0 : 20, alignItems: 'center' }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                    <Svg xml={Cash} rest={{ height: 16, width: 16, marginRight: isRTL ? 10 : 0, }} />
                    <Text style={[isRTL ? { marginRight: 10 } : { marginLeft: 10 }, { fontFamily: StyleGuide.fontFamily.semiBold, color: StyleGuide.color.black }]}>{price.toFixed(2)}</Text>
                    {bookingType === 'rent' && (
                        <View style={{ marginLeft: 5, backgroundColor: StyleGuide.color.primary, borderRadius: 16, paddingVertical: 2, paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: StyleGuide.fontFamily.semiBold, color: StyleGuide.color.white, fontSize: 12 }}>{duration} h</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={[styles.showDetailsButton, {
                    flexDirection:isRTL ? 'row-reverse' : 'row',
                    alignSelf: isRTL ? 'flex-start' : 'flex-end',
                    borderTopLeftRadius: isRTL ? 0 : 20,
                    borderTopRightRadius: isRTL ? 20 : 0,
                    borderBottomLeftRadius: isRTL ? (isExpanded ? 0 : 8) : 0,
                    borderBottomRightRadius: isRTL ? 0 : (isExpanded ? 0 : 15),
                },]} onPress={toggleExpanded}>
                    <Text style={styles.showDetailsText}>
                        {isExpanded ? t('rideInfo.hideDetails') : t('rideInfo.showDetails')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expandable Details Section */}
            <Animated.View
                style={[
                    styles.expandableSection,
                    {
                        height: animatedHeight,
                        opacity: opacity,
                    }
                ]}
            >
                <View style={styles.expandableContent}>
                    <View style={[styles.locationItem, flexDirection]}>
                        <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                            <Svg xml={locationBlackIcon} rest={{ height: 18, width: 18 }} />
                        </View>
                        <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.locationLabel}>{'Pickup Location'}</Text>
                            <Text numberOfLines={2} style={[styles.locationAddress, { width: '90%', textAlign: isRTL ? 'right' : 'left' }]}>{pickupLocation}</Text>
                        </View>
                    </View>

                    {bookingType !== 'rent' && (
                        <>
                            <View style={[styles.locationDivider, isRTL ? { marginRight: 14 } : { marginLeft: 14 }, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />

                            <View style={[styles.locationItem, { marginTop: 10 }, flexDirection]}>
                                <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                                    <Svg xml={homeBlackIcon} rest={{ height: 18, width: 18 }} />
                                </View>
                                <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                    <Text style={styles.locationLabel}>{'Drop Location'}</Text>
                                    <Text numberOfLines={2} style={styles.locationAddress}>{dropLocation}</Text>
                                </View>
                                <View style={styles.distanceContainer}>
                                    <Text style={styles.distance}> {distance}</Text>
                                    <Text style={styles.estimatedTime}>{estimatedTime}</Text>
                                </View>
                            </View>
                        </>
                    )}
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
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
    },
    carSection: {
        justifyContent: 'center',
        position: 'relative'
    },
    carImage: {
        width: 140,
        height: 80,
    },
    driverInfo: {
        flex: 1,
        paddingHorizontal: 20
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        width: '80%'
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    rating: {
        fontSize: 16,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.medium,
        marginLeft: 10,
    },
    emptyStar: {
        color: '#DDD',
        fontSize: 14,
        marginRight: 1,
    },
    carDetails: {
        fontSize: 12,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.regular,
    },
    driverImageContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    driverImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        position: 'absolute',
        right: -10,
        zIndex: 1
    },
    driverImageName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    driverRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverRating: {
        fontSize: 12,
        color: StyleGuide.color.black,
        fontFamily: StyleGuide.fontFamily.medium,
        marginLeft: 4,
        textAlign: 'center'
    },
    driverStarsContainer: {
        flexDirection: 'row',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 18,
    },
    showDetailsButton: {
        alignSelf: 'flex-end',
        backgroundColor: StyleGuide.color.primary,
        paddingHorizontal: 16,
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 8,
    },
    showDetailsText: {
        color: StyleGuide.color.white,
        fontSize: 14,
        fontWeight: '500',
        padding: 10,
    },
    expandableSection: {
        overflow: 'hidden', // Important: Add this back for smooth animation
    },
    expandableContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: StyleGuide.color.primary,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: StyleGuide.color.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationIconText: {
        fontSize: 16,
    },
    locationTextContainer: {
        flex: 1,
        height: 60
    },
    locationLabel: {
        fontSize: 14,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.medium,
    },
    locationAddress: {
        fontSize: 12,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        opacity: 0.9,
    },
    locationDivider: {
        width: 2,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: -25,
    },
    distanceContainer: {
        alignItems: 'flex-end',
    },
    distance: {
        fontSize: 16,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.bold,
    },
    estimatedTime: {
        fontSize: 12,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
    },
});

export default ActivityCard;