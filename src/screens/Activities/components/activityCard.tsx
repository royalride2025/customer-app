import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Pressable,
    Modal,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import { screenWidth } from '../../../utils/dimenstions';
import Svg from '../../../lib/svg';
import { Cash, deletIcon, editIcon, homeBlackIcon, locationBlackIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../../redux/reduxHooks';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import moment from 'moment';
import { clearBookingStatus, setCurrentBooking } from '../../../redux/bookingSlice';

import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

// Define the navigation type
type RootStackParamList = {
  map: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

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
    status: any,
    onCarPress?: () => void,
    data?: any, // Add data prop to pass the full booking data
}

const car = require('../../../../assets/images/car1.png');
const profile = require('../../../../assets/images/profile.png');
const carPlaceHolder = 'data:image/jpeg;base64,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';
const ActivityCard: React.FC<RideInfoCardProps> = ({
    driverName = "driver name",
    vehicleName = 'honda',
    driverRating = 5.5,
    vehicleModel = "Rolls Royce Cullinan",
    vehicleColor = "White",
    licensePlate = "CF 21536",
    carImage = "https://url-shortener.me/3EQ8",
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
    onCarPress,
    driverImage,
    data // Add data parameter
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [expandedHeight, setExpandedHeight] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const { flexDirection, flipImage } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
    const currentBooking = useAppSelector((state: RootState) => state.booking.currentBooking);
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NavigationProp>();

    // Calculate dynamic height based on booking type
    const calculateExpandedHeight = () => {
        if (bookingType === 'rent'||bookingType === 'book') {
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
console.log(currentBooking,"currr")
    // Handle card press for scheduled bookings
    const handleCardPress = () => {
        if (status === 'scheduled' && data) {
                        // Check if there's already a current booking and it's different from the clicked one
            if (currentBooking && currentBooking._id !== data._id) {
                console.log('🚨 Showing modal - different booking detected');
                console.log('Current booking ID:', currentBooking._id);
                console.log('Clicked booking ID:', data._id);
                // Show modal instead of toast
                setShowModal(true);
                return;
            }
            
                        // If it's the same booking or no current booking, just navigate to map
            if (!currentBooking || currentBooking._id === data._id) {
                navigation.navigate('map');
                // Only set current booking if it's not already set
                if (!currentBooking) {
                    dispatch(setCurrentBooking(data));
                    dispatch(clearBookingStatus());
                }
            }
        }
    };

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

    const formattedDate = moment.utc(date).format('MMM Do YYYY');
    const formattedTime = moment.utc(date).format('h:mm A');
    const capitalizeFirstLetter = (string: any) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    };

    // Check if the card should be touchable
    const isTouchable = status === 'scheduled';

    return (
        <View>
            <TouchableOpacity 
                style={[styles.container, style]} 
                onPress={handleCardPress}
                disabled={!isTouchable}
                activeOpacity={isTouchable ? 0.7 : 1}
            >
              
            {/* Header Section */}
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>
                <Text style={{ fontSize: 12, color: StyleGuide.color.grey }}>{formattedDate}<Text style={{ color: StyleGuide.color.primary, fontSize: 14 }}> | </Text>{formattedTime}</Text>
                <Text style={{ fontSize: 12, color: StyleGuide.color.grey }}>{capitalizeFirstLetter(bookingType)}<Text style={{ color: StyleGuide.color.primary, fontSize: 14 }}> | </Text>{capitalizeFirstLetter(status)}</Text>
            </View>

            <View style={[styles.header, flexDirection]}>
                <Pressable onPress={onCarPress} style={styles.carSection}>
                    <Image
                        source={{ uri: carImage}}
                        style={[styles.carImage, { transform: [{ scaleX: flipImage?.transform?.[0]?.scaleX ?? 1 }] }]}
                        resizeMode="cover"
                    />
                    <Image
                        source={{uri:driverImage}}
                        style={[styles.driverImage, isRTL ? { left: 0, bottom: 9 } : { right: -10, bottom: 5 }]}
                    />
                </Pressable>

                <View style={styles.driverInfo}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[styles.driverName, { textAlign: isRTL ? 'right' : 'left' }]}>{vehicleName}</Text>
                        <Text style={styles.rating}>{'5.5'} <Text style={{ fontSize: 10, textAlign: isRTL ? 'left' : 'right', marginBottom: 2 }}>⭐</Text></Text>
                    </View>

                    <Text style={[styles.carDetails, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {vehicleModel} ({vehicleColor}){'\n'}{t('rideInfo.licensePlate', { licensePlate })}
                    </Text>
                    {status !== 'pending' && (
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginVertical: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                                <Text style={[styles.driverImageName, { textAlign: isRTL ? 'right' : 'left' }]}> {driverName}</Text>
                                <Text style={[styles.driverRating, isRTL ? { marginRight: 7 } : { marginLeft: 4 }]}>{driverRating}{'  '}<Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 2 }}>⭐</Text></Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingLeft: isRTL ? 0 : 20, alignItems: 'center' }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                    <Svg xml={Cash} rest={{ height: 16, width: 16 }} />
                    <Text style={[isRTL ? { marginRight: 10 } : { marginLeft: 10 }, { fontFamily: StyleGuide.fontFamily.semiBold, color: StyleGuide.color.black }]}>{
                        typeof price === 'number' ? price.toFixed(2) : String(price ?? '')
                    }</Text>
                    {bookingType === 'rent'  && (
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

                    {bookingType !== 'rent' && bookingType !== 'book' && (
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
              
        </TouchableOpacity>

        {/* Modal for Active Booking Message */}
        <Modal
            visible={showModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Active Booking</Text>
                    <Text style={styles.modalMessage}>
                        You already have an active booking. Please complete it first.
                    </Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => {
                                setShowModal(false);
                                // Just close modal, don't navigate
                            }}
                        >
                            <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.modalButton, styles.okButton]}
                            onPress={() => {
                                setShowModal(false);
                                // Navigate to map after clicking OK
                                navigation.navigate('map');
                            }}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
        borderRadius: 5,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: StyleGuide.color.white,
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: StyleGuide.fontFamily.bold,
        color: StyleGuide.color.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        fontFamily: StyleGuide.fontFamily.medium,
        color: StyleGuide.color.grey,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 15,
    },
    cancelButton: {
        backgroundColor: StyleGuide.color.grey,
        flex: 1,
    },
    okButton: {
        backgroundColor: StyleGuide.color.primary,
        flex: 1,
    },
    modalButtonText: {
        color: StyleGuide.color.white,
        fontSize: 16,
        fontFamily: StyleGuide.fontFamily.semiBold,
        textAlign: 'center',
    },
    cancelButtonText: {
        color: StyleGuide.color.white,
    },
});

export default ActivityCard;