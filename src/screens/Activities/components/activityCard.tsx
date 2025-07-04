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
import { StyleGuide } from '../../../../StyleGuide';
import { screenWidth } from '../../../utils/dimenstions';
import Svg from '../../../lib/svg';
import { Cash, deletIcon, editIcon, homeBlackIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/reduxHooks';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { RootState } from '../../../redux/store';
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
    style?: object; // Accept style as prop
}


const car = require('../../../../assets/images/car1.png');
const profile = require('../../../../assets/images/profile.png');

const ActivityCard: React.FC<RideInfoCardProps> = ({
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
    onCallPress,
    onMessagePress,
    onShowDetailsPress,
    style, // Get style from props
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const { flexDirection, flipImage } = useTranslationStyles();
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
    const navigation = useNavigation()
    const expandedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 140], // Reduced height for better fit
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
        <View style={[styles.container, style]}> {/* Apply the style prop */}
            {/* Header Section */}
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>

                <Text style={{ fontSize: 12, color: StyleGuide.color.grey }}>December 2, 2024 <Text style={{ color: StyleGuide.color.primary, fontSize: 14 }}>|</Text> 3:00 PM</Text>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }}>
                    <Pressable>
                        <Svg xml={editIcon} rest={{ height: 16, width: 16 }} />
                    </Pressable>
                    <Pressable>
                        <Svg xml={deletIcon} rest={{ height: 16, width: 16 }} />
                    </Pressable>

                </View>
            </View>
            <View style={[styles.header, flexDirection]}>
                <Pressable onPress={() => navigation.navigate('carProfile')} style={styles.carSection}>
                    <Image
                        source={car}
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
                        <Text numberOfLines={1} style={[styles.driverName, { textAlign: isRTL ? 'right' : 'left' }]}>{t('rideInfo.driverName')}</Text>

                        <Text style={styles.rating}>{driverRating} <Text style={{ fontSize: 10, textAlign: isRTL ? 'left' : 'right', marginBottom: 2 }}>⭐</Text></Text>
                    </View>


                    <Text style={[styles.carDetails, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('rideInfo.carModel', { carModel })} ({carColor}) {t('rideInfo.licensePlate', { licensePlate })}

                    </Text>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginVertical: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                            <Text style={[styles.driverImageName, { textAlign: isRTL ? 'right' : 'left' }]}> {t('rideInfo.driverFullName')}</Text>
                            <Text style={[styles.driverRating, isRTL ? { marginRight: 7 } : { marginLeft: 4 }]}>4.5{'  '}<Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 2 }}>⭐</Text></Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingLeft: isRTL ? 0 : 20, alignItems: 'center' }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                    <Svg xml={Cash} rest={{ height: 16, width: 16, marginRight: isRTL ? 10 : 0, }} />
                    <Text style={[isRTL ? { marginRight: 10 } : { marginLeft: 10 }, { fontFamily: StyleGuide.fontFamily.semiBold, color: StyleGuide.color.black }]}>{t('rideInfo.cash')}</Text>
                </View>
                <TouchableOpacity style={[styles.showDetailsButton, {
                    flexDirection: isRTL ? 'row-reverse' : 'row', // Reverse flex direction for RTL
                    alignSelf: isRTL ? 'flex-start' : 'flex-end', // Adjust alignment for RTL
                    borderTopLeftRadius: isRTL ? 0 : 20, // Reverse the corner radius for RTL
                    borderTopRightRadius: isRTL ? 20 : 0, // Reverse the corner radius for RTL
                    borderBottomLeftRadius: isRTL ? 8 : 0, // Reverse the corner radius for RTL
                    borderBottomRightRadius: isRTL ? 0 : 8, // Reverse the corner radius for RTL
                },]} onPress={toggleExpanded}>
                    <Text style={styles.showDetailsText}>
                        {isExpanded ? t('rideInfo.hideDetails') : t('rideInfo.showDetails')}
                    </Text>
                </TouchableOpacity>
            </View>


            {/* Location Section */}
            <View>

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
                                <Svg xml={locationBlackIcon} rest={{ height: 18, width: 18 }} />
                            </View>
                            <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.locationLabel}>{t('rideInfo.currentLocation')}</Text>
                                <Text numberOfLines={2} style={[styles.locationAddress, { width: '90%', textAlign: isRTL ? 'right' : 'left' }]}>{currentLocation}</Text>
                            </View>
                        </View>

                        <View style={[styles.locationDivider, isRTL ? { marginRight: 14 } : { marginLeft: 14 }, { alignSelf: 'flex-end' }]} />

                        <View style={[styles.locationItem, { marginTop: 10 }, flexDirection]}>
                            <View style={[styles.locationIcon, isRTL ? { marginLeft: 8 } : { marginRight: 12 }]}>
                                <Svg xml={homeBlackIcon} rest={{ height: 18, width: 18 }} />
                            </View>
                            <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.locationLabel}>{t('rideInfo.officeLocation')}</Text>
                                <Text numberOfLines={2} style={styles.locationAddress}>{officeLocation}</Text>
                            </View>
                            <View style={styles.distanceContainer}>
                                <Text style={styles.distance}> {distance}</Text>
                                <Text style={styles.estimatedTime}>{estimatedTime}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        // margin:,
        borderColor: StyleGuide.color.primary,
        borderBottomRightRadius: 20,
        marginBottom: 20
        // overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        // padding: 10,
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
        // alignItems: 'center',
    },
    carSection: {
        // flex: 1,
        // backgroundColor:'yellow',
        justifyContent: 'center',
        // alignItems:'center',
        position: 'relative'

    },
    carImage: {
        width: 140,
        height: 80,
        // backgroundColor: 'blue',
    },
    driverInfo: {
        flex: 1,
        // marginLeft: 10,
        // backgroundColor:'red',
        paddingHorizontal: 20

    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        // backgroundColor:'red',
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
        // gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: '#F0F0F0',
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
        overflow: 'hidden',
    },
    expandableContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: StyleGuide.color.primary,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        minHeight: 120,
        marginBottom: 5,
        overflow: 'hidden',

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
        // marginRight: 12,
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
        // marginBottom: 4,
    },
    locationAddress: {
        fontSize: 12,
        color: StyleGuide.color.white,
        fontFamily: StyleGuide.fontFamily.regular,
        opacity: 0.9,

        // width:screenWidth*0.7
        // lineHeight: 16,
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
