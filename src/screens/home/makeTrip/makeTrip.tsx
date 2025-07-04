import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import { currentLocationicon, locationBlackIcon, locationIcon, locationIconOuter } from '../../../../assets/svgAssets';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { useNavigation } from '@react-navigation/native';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';

const MakeTripc = () => {
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const { flexDirection, textAlignment } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

    const GOOGLE_PLACES_API_KEY = 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY';
    const navigation = useNavigation()
    const savedAddresses = [
        {
            id: 1,
            name: t('office'),
            address: 'Zone 55 House 10 Street 873 South Muaither Doha',
            distance: '2.7 km',
        },
        {
            id: 2,
            name: t('home'),
            address: 'Zone 55 House 35 Street 873 South Muaither Doha',
            distance: '2.7 km',
        },
        {
            id: 3,
            name: t('wardrobe'),
            address: 'Zone 55 House 89 Street 801 South Muaither Doha',
            distance: '2.7 km',
        },
        {
            id: 4,
            name: t('shop'),
            address: 'Zone 55 House 08 Street 740 South Muaither Doha',
            distance: '2.7 km',
        },
    ];

    const handleAddressSelect = (address) => {
        setFromLocation(address.address);
    };

    const handleCurrentLocation = () => {
        setIsGettingLocation(true);
        setTimeout(() => {
            setFromLocation('Current Location - Zone 45 Street 923 Doha, Qatar');
            setIsGettingLocation(false);
        }, 1500);
    };
    useScreenHeader({
        title: t('header.plan_your_ride'),

    });
    const handleNextButton = () => {
        navigation.navigate('map', { from: 'plan' });  // Navigate to the 'Map' screen and pass parameters
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.locationContainer}>
                    <View style={[styles.locationInputWrapper, flexDirection, { borderTopLeftRadius: 5, marginBottom: 15, borderBottomLeftRadius: 1 }]}>
                        <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20 }} />
                        <View style={styles.autocompleteContainer}>
                            <GooglePlacesAutocomplete
                                predefinedPlaces={[]}
                                placeholder={t('home')}
                                onPress={(data) => setFromLocation(data.description)}
                                query={{
                                    key: 'AIzaSyAKwc_liBJuKwkEuftyfFN-rJWpsWOQJjw',
                                    language:isRTL?'ar': 'en',
                                    components: 'country:qa',
                                }}
                                fetchDetails={true}
                                debounce={300}
                                onFail={(error) => {
                                    console.error('❌ Places API Error:', error);
                                    console.error('Error type:', typeof error);
                                    console.error('Error details:', JSON.stringify(error, null, 2));
                                }}
                                onNotFound={() => {
                                    console.warn('⚠️ No places found for the search query');
                                }}
                                setAddressText={(text) => setToLocation(text)}
                                enablePoweredByContainer={false}
                                textInputProps={{
                                    placeholderTextColor: '#8e8e8e',
                                    onChange: (e) => setFromLocation(e?.nativeEvent?.text),
                                    value: fromLocation,
                                }}
                                styles={{
                                    textInputContainer: {
                                        paddingHorizontal: 10,


                                    },
                                    textInput: {
                                        height: 46,
                                        fontSize: 16,
                                        color: StyleGuide.color.black,
                                        textAlign: isRTL ? 'right' : 'left'

                                    },
                                    listView: {
                                        backgroundColor: 'red',
                                    },

                                }}
                            />

                        </View>
                        <TouchableOpacity
                            style={styles.targetIcon}
                            onPress={handleCurrentLocation}
                            disabled={isGettingLocation}
                        >
                            <Svg xml={currentLocationicon} rest={{ height: 22, width: 22 }} />
                        </TouchableOpacity>
                    </View>


                    <View style={[styles.locationInputWrapper, flexDirection, { borderTopLeftRadius: 1, borderBottomLeftRadius: 5 }]}>
                        <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20 }} />
                        <View style={styles.autocompleteContainer}>
                            <GooglePlacesAutocomplete
                                predefinedPlaces={[]}

                                styles={{
                                    textInputContainer: {
                                        backgroundColor: StyleGuide.color.white,
                                        //   borderRadius: 8,
                                        paddingHorizontal: 10,
                                        paddingVertical: 5
                                        //   marginBottom: 5,
                                    },
                                    textInput: {
                                        height: 44,
                                        fontSize: 16,
                                        color: StyleGuide.color.black,
                                        textAlign: isRTL ? 'right' : 'left'
                                    },
                                    listView: {
                                        backgroundColor: StyleGuide.color.white,
                                    },
                                }}
                                placeholder={t('to')} 
                                onPress={(data) => setFromLocation(data.description)}
                                query={{
                                    key: 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY',
                                    language: 'en',
                                    components: 'country:qa',
                                }}
                                fetchDetails={true}
                                debounce={300}

                                // styles={autoStyles}
                                enablePoweredByContainer={false}
                                textInputProps={{
                                    placeholderTextColor: '#8e8e8e',
                                    onChange(e) {
                                        setToLocation(e?.nativeEvent?.text);
                                    },
                                    value: toLocation,
                                }}
                            />


                        </View>
                    </View>
                </View>

                <View style={styles.savedAddressesContainer}>
                    <View style={[styles.savedAddressesHeader, flexDirection]}>
                        <Text style={styles.savedAddressesTitle}>{t('saved_addresses')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.addButton}>{t('add')}</Text>
                        </TouchableOpacity>
                    </View>

                    {savedAddresses.map((address) => (
                        <TouchableOpacity
                            key={address.id}
                            style={styles.addressItem}
                            onPress={() => handleAddressSelect(address)}
                        >
                            <View style={[styles.addressContent, flexDirection]}>
                                <Svg xml={locationIcon} rest={{ height: 20, width: 20, marginTop: 7, }} />
                                <View style={[styles.addressDetails, isRTL ? { marginRight: 13 } : { marginLeft: 13, }]}>
                                    <Text style={[styles.addressName, textAlignment]}>{address.name}</Text>
                                    <Text style={[styles.addressText, textAlignment]}>{address.address}</Text>
                                </View>
                                <Text style={[styles.addressDistance, textAlignment]}>{address.distance}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <AppButton onPress={handleNextButton} title={t('next')} />
            </View>
        </SafeAreaView>
    );
};

export default MakeTripc;

const styles = StyleSheet.create({
    container: { ...StyleGuide.layout.container },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    content: { flex: 1 },
    locationContainer: {
        backgroundColor: StyleGuide.color.white,
        borderRadius: 12,
        // paddingVertical: 10,
        marginBottom: 30,
        borderLeftWidth: 8,
        borderLeftColor: StyleGuide.color.primary
    },
    locationInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: StyleGuide.color.lightGrey,
        borderRadius: 8,
        borderLeftWidth: 0,
        width: '100%'

    },
    locationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C8A882',
        marginRight: 10,
    },
    destinationDot: {
        backgroundColor: '#444',
    },
    autocompleteContainer: {
        flex: 1,
    },
    targetIcon: {
        marginLeft: 10,
    },
    savedAddressesContainer: { flex: 1 },
    savedAddressesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    savedAddressesTitle: {
        fontSize: 18,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
    },
    addButton: {
        fontSize: 16,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.primary,
    },
    addressItem: {


        marginBottom: 5,
        // padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressContent: {
        flexDirection: 'row',
        // alignItems: 'center',
        flex: 1,
    },
    addressDetails: {
        flex: 1,

    },
    addressName: {
        fontSize: 16,
        fontFamily: StyleGuide.fontFamily.bold,
        color: StyleGuide.color.black
    },
    addressText: {
        fontSize: 14,
        fontFamily: StyleGuide.fontFamily.medium,
        color: StyleGuide.color.lightGrey
    },
    addressDistance: {
        fontSize: 14,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black
    },
    buttonContainer: {
        marginBottom: 20
    },
    nextButton: {
        backgroundColor: '#C8A882',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
