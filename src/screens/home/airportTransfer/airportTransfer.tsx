import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { StyleGuide } from '../../../../StyleGuide';
import Svg from '../../../lib/svg';
import { currentLocationicon, inputCross, locationBlackIcon, locationIcon, swap } from '../../../../assets/svgAssets';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { useNavigation } from '@react-navigation/native';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';
import { SCREEN_WIDTH } from '../../../lib/responsiveStyles';
import { screenWidth } from '../../../utils/dimenstions';
 

const airports = [
    {
        id: 1,
        name: 'Hamad International Airport',
        address: 'Hamad International Airport, Doha, Qatar',
        distance: '15.2 km',
        latitude: 25.2730,  // Add actual coordinates
        longitude: 51.6081,
    },
    {
        id: 2,
        name: 'Doha International Airport',
        address: 'Doha International Airport, Doha, Qatar',
        distance: '12.8 km',
        latitude: 25.2611,  // Add actual coordinates
        longitude: 51.5651,
    },
];



const AirportTransfer = () => {
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [fromLocationData, setFromLocationData] = useState({
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });
    const [toLocationData, setToLocationData] = useState({
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });
    console.log("fromLocationlllll", fromLocation)
    const [focusedInput, setFocusedInput] = useState('from'); // Track which input is focused
    const { flexDirection, textAlignment } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
 

    const navigation = useNavigation();
    const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
    const toLocationRef = useRef<GooglePlacesAutocompleteRef>(null);

    console.log("fromLocationData", fromLocationData)
    console.log("toLocationData", toLocationData)

    const handleAddressSelect = (address: any) => {
        setFromLocation(address.address);
    };

    const handleAirportSelect = (airport: any) => {
        if (focusedInput === 'from') {
            setFromLocation(airport.address);
            // Set coordinates for from location
            setFromLocationData({
                address: airport.address,
                latitude: airport.latitude,
                longitude: airport.longitude,
            });
        } else {
            setToLocation(airport.address);
            // Set coordinates for to location
            setToLocationData({
                address: airport.address,
                latitude: airport.latitude,
                longitude: airport.longitude,
            });
        }
    };

    const handleCurrentLocation = () => {
        setIsGettingLocation(true);
        setTimeout(() => {
            setFromLocation('Current Location - Zone 45 Street 923 Doha, Qatar');
            setIsGettingLocation(false);
        }, 1500);
    };

    const handleClearLocation = (type: any) => {
        if (type === 'from') {
            setFromLocation('');
        } else if (type === 'to') {
            setToLocation('');
        }
    };

    const handleSwapLocations = () => {
        // Swap the location strings
        const tempLocation = fromLocation;
        setFromLocation(toLocation);
        setToLocation(tempLocation);

        // Swap the location data objects
        const tempLocationData = fromLocationData;
        setFromLocationData(toLocationData);
        setToLocationData(tempLocationData);
    };


    const handlePickupLocationSelect = (data: any) => {
        console.log('📍 Pickup location selected:', data.description);
        setFromLocation(data.description);
    };

    const handleDestinationLocationSelect = (data: any) => {
        console.log('📍 Destination location selected:', data.description);
        setToLocation(data.description);
    };

    useScreenHeader({
        title: t('airport_transfer'),
    });

    console.log("from", fromLocation)
    console.log(",to", toLocation)

    // Check if both from and to location addresses are empty
    const isButtonDisabled = !fromLocationData.address || !toLocationData.address;

    const handleNextButton = () => {
        // If pickup location is an airport, navigate to ScheduleRideScreen with both locations

        // Default navigation (if needed, adjust as per your flow)
        (navigation as any).navigate('ScheduleRide', {

            fromLocation,
            toLocation,
            fromLocationData,
            toLocationData
        });
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
            <View
                style={styles.fieldsParent}
            >
                <View style={styles.airportFieldsRow}>
                    <View style={styles.airportFieldsColumn}>
                        <View style={styles.airportInputField}>
                        <GooglePlacesAutocomplete
            ref={googlePlaceAutoCompleteRef}
            placeholder={t('from')}
            textInputProps={{
backgroundColor:'transparent',
              placeholderTextColor: '#8e8e8e',
              value: fromLocation,
              autoCorrect: false,
              onChange(e) {
                setFromLocation(e.nativeEvent.target)
              },
            }}
            styles={{ textInput: { fontSize: 16, color: 'black', height: 50 }, 
            listView: { position: 'absolute', top: screenWidth * 0.28 ,elevation:1,backgroundColor:StyleGuide.color.grey },
            description: { color: 'black', fontSize: 16 } }}
            onPress={(data, details = null) => {setFromLocation(data.description)
              if (details) {
                const { lat, lng } = details.geometry.location;
                const address = data.description;
            
                // Save to state
                setFromLocationData({
                  address,
                  latitude: lat,
                  longitude: lng,
                });
            
                console.log('Selected:', { address, lat, lng });
              }
            }
            }


            query={{
              key: 'AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ',
              language: 'en',
            }}
            enablePoweredByContainer={false}
            renderLeftButton={() => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Svg
                  rest={{
                    height: 18,
                    width: 18,
                    style: { marginVertical: 10 },
                  }}
                  xml={locationBlackIcon}
                />
              </View>
            )}
            renderRightButton={() =>
              fromLocation ? (
                <TouchableOpacity
                  onPress={() => {
                    setFromLocation('');
                  }}
                  style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Svg xml={inputCross} rest={{ height: 16, width: 16 }} />
                </TouchableOpacity>
              ) : null
            }
            predefinedPlaces={[]}
            autoFillOnNotFound={false}
            currentLocation={false}
            currentLocationLabel="Current location"
            debounce={0}
            fetchDetails={true}
            keyboardShouldPersistTaps="always"
            keepResultsAfterBlur={false}
            minLength={2}
            nearbyPlacesAPI="GooglePlacesSearch"
            numberOfLines={1}
            onFail={(e) => { console.warn('Google Place Failed : ', e) }}
            onNotFound={() => { }}
            onTimeout={() => console.warn('google places autocomplete: request timeout')}
            predefinedPlacesAlwaysVisible={false}
            timeout={20000}
            fields="*"
          />
                        </View>
                        <View style={[styles.airportInputField, { marginBottom: 0 }]}>
                            <GooglePlacesAutocomplete
                                ref={googlePlaceAutoCompleteRef}
                                placeholder={t('to')}
                                textInputProps={{
                                    backgroundColor:'transparent',
                                    placeholderTextColor: '#8e8e8e',
                                    value: toLocation,
                                    autoCorrect: false,
                                    onFocus: () => {
                                        console.log('📍 Pickup input focused');
                                        setFocusedInput('to');
                                    },
                                    onChange(e) {
                                        setToLocation(e.nativeEvent.text);
                                    },
                                }}
                                styles={{
                                    textInput: {
                                        height: 50,
                                        fontSize: 16,
                                        color: StyleGuide.color.black,
                                        textAlign: isRTL ? 'right' : 'left'
                                    }, listView: { position: 'absolute', top: 50,elevation:1,backgroundColor:StyleGuide.color.grey },
                                    description: { color: 'black', fontSize: 16 }
                                }}
                                onPress={(data, details = null) => {
                                    setToLocation(data.description)
                                    if (details) {
                                        const { lat, lng } = details.geometry.location;
                                        const address = data.description;
                                        setToLocationData({
                                            address,
                                            latitude: lat,
                                            longitude: lng,
                                        });
                                        console.log('Selected:', { address, lat, lng });
                                    }
                                }
                                }

                                query={{
                                    key: 'AIzaSyDW6Ognz7Or3dGg6FauPwfHdGYazmMdhDQ',
                                    language: 'en',
                                }}
                                enablePoweredByContainer={false}
                                renderLeftButton={() => (
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <Svg
                                            rest={{
                                                height: 18,
                                                width: 18,
                                                style: { marginVertical: 10 },
                                            }}
                                            xml={locationBlackIcon}
                                        />
                                    </View>
                                )}
                                renderRightButton={() =>
                                    toLocation ? (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setToLocation('');
                                            }}
                                            style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Svg xml={inputCross} rest={{ height: 16, width: 16 }} />
                                        </TouchableOpacity>
                                    ) : null
                                }
                                predefinedPlaces={[]}
                                autoFillOnNotFound={false}
                                currentLocation={false}
                                currentLocationLabel="Current location"
                                debounce={0}
                                fetchDetails={true}
                                keyboardShouldPersistTaps="always"
                                keepResultsAfterBlur={false}
                                minLength={2}
                                nearbyPlacesAPI="GooglePlacesSearch"
                                numberOfLines={1}
                                onFail={(e) => { console.warn('Google Place Failed : ', e) }}
                                onNotFound={() => { }}
                                onTimeout={() => console.warn('google places autocomplete: request timeout')}
                                predefinedPlacesAlwaysVisible={false}
                                timeout={20000}
                                fields="*"
                            />
                        </View>
                    </View>
                    {/* Swap button to the right of both fields, vertically centered */}
                    <TouchableOpacity
                        onPress={handleSwapLocations}
                        style={styles.airportSwapButton}
                    >
                        <Svg xml={swap} rest={{ height: 24, width: 24 }} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.airportsContainer}>
                    <View style={[styles.airportsHeader, flexDirection]}>
                        <Text style={styles.airportsTitle}>{t('airports')}</Text>
                    </View>

                    {airports.map((airport) => (
                        <TouchableOpacity
                            key={airport.id}
                            style={styles.airportItem}
                            onPress={() => handleAirportSelect(airport)}
                        >
                            <View style={[styles.airportContent, flexDirection]}>
                                <Svg xml={locationIcon} rest={{ height: 20, width: 20 }} />
                                <View style={[styles.airportDetails, isRTL ? { marginRight: 13 } : { marginLeft: 13, }]}>
                                    <Text style={[styles.airportName, textAlignment]}>{airport.name}</Text>
                                    <Text style={[styles.airportText, textAlignment]}>{airport.address}</Text>
                                </View>
                                <Text style={[styles.airportDistance, textAlignment]}>{airport.distance}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <AppButton onPress={handleNextButton} title={t('next')} disabled={isButtonDisabled} />
            </View>
            
            
        </SafeAreaView>
    );
};

export default AirportTransfer;

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
    content: { flex: 1, marginTop: SCREEN_WIDTH * 0.35 },
    locationContainer: {
        backgroundColor: StyleGuide.color.white,
        borderRadius: 12,
        marginBottom: 30,
        borderLeftWidth: 8,
        borderLeftColor: StyleGuide.color.primary
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputsContainer: {
        flex: 1,
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
    clearButton: {
        marginLeft: 10,
    },
    clearButtonText: {
        fontSize: 18,
        color: StyleGuide.color.grey,
        fontWeight: 'bold',
    },
    swapButtonContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    swapButton: {
        // backgroundColor: StyleGuide.color.lightGrey,
        // borderRadius: 20,
        // padding: 10,
    },
    swapButtonText: {
        fontSize: 16,
        color: StyleGuide.color.black,
        fontWeight: 'bold',
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
        fontFamily: StyleGuide.fontFamily.medium,
        color: StyleGuide.color.primary,
    },
    addressItem: {
        backgroundColor: StyleGuide.color.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressDetails: {
        flex: 1,
    },
    addressName: {
        fontSize: 16,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        fontFamily: StyleGuide.fontFamily.regular,
        color: StyleGuide.color.grey,
    },
    addressDistance: {
        fontSize: 12,
        fontFamily: StyleGuide.fontFamily.medium,
        color: StyleGuide.color.primary,
    },
    airportsContainer: { flex: 1, marginTop: 20 },
    airportsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    airportsTitle: {
        fontSize: 18,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
    },
    airportItem: {
        backgroundColor: StyleGuide.color.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    airportContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    airportDetails: {
        flex: 1,
    },
    airportName: {
        fontSize: 16,
        fontFamily: StyleGuide.fontFamily.semiBold,
        color: StyleGuide.color.black,
        marginBottom: 4,
    },
    airportText: {
        fontSize: 14,
        fontFamily: StyleGuide.fontFamily.regular,
        color: StyleGuide.color.grey,
    },
    airportDistance: {
        fontSize: 12,
        fontFamily: StyleGuide.fontFamily.medium,
        color: StyleGuide.color.primary,
    },
    buttonContainer: {
        // paddingHorizontal: 20,
        paddingBottom: 20,
    },
    airportTransferContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    airportFieldsColumn: {
        flex: 1,
    },
    airportInputField: {
        marginBottom: 8,

        paddingHorizontal: 5,
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomColor: StyleGuide.color.border,
        borderRightColor: StyleGuide.color.border,
        borderTopColor: StyleGuide.color.border,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 1,
        marginLeft: 0,
        paddingLeft: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    airportSwapButton: {
        marginLeft: 8,
        zIndex: 10000,
        alignSelf: 'center',
    },
    airportFieldsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    airportSvgMargin: {
        marginTop: 7,
    },
    fieldsParent: {
        backgroundColor: 'transparent',
        borderLeftWidth: 6,
        borderLeftColor: StyleGuide.color.primary,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        // paddingVertical: 8,
        position: 'absolute',
        alignSelf: 'center',
        top: 2,
        zIndex: 9999,
        width: '100%',
    }
}); 