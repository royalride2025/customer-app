<View style={styles.locationContainer}>
                    <View style={styles.inputRow}>
                        <View style={styles.inputsContainer}>
                            <View style={[styles.locationInputWrapper, flexDirection, { borderTopLeftRadius: 5, marginBottom: 15, borderBottomLeftRadius: 1 }]}>
                                <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20 }} />
                                <View style={styles.autocompleteContainer}>
                                    <GooglePlacesAutocomplete
                                        predefinedPlaces={[]}
                                        placeholder={t('pickup_location')}
                                        onPress={handlePickupLocationSelect}
                                        query={{
                                            key: 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY',
                                            language: isRTL ? 'ar' : 'en',
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
                                        enablePoweredByContainer={false}
                                        textInputProps={{
                                            placeholderTextColor: '#8e8e8e',
                                            value: fromLocation,
                                            onFocus: () => {
                                                console.log('📍 Pickup input focused');
                                                setFocusedInput('from');
                                            },
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
                                {fromLocation ? (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => handleClearLocation('from')}
                                    >
                                                                        <Svg xml={inputCross} rest={{ height: 14, width: 14 }} />

                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            <View style={[styles.locationInputWrapper, flexDirection, { borderTopLeftRadius: 1, borderBottomLeftRadius: 5 }]}>
                                <Svg xml={locationBlackIcon} rest={{ height: 20, width: 20 }} />
                                <View style={styles.autocompleteContainer}>
                                    <GooglePlacesAutocomplete
                                        predefinedPlaces={[]}
                                        styles={{
                                            textInputContainer: {
                                                backgroundColor: StyleGuide.color.white,
                                                paddingHorizontal: 10,
                                                paddingVertical: 5
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
                                        placeholder={t('airport_destination')}
                                        onPress={handleDestinationLocationSelect}
                                        query={{
                                            key: 'AIzaSyDKnHa_iplWVK5q4VjxWvfp8ZlDMDtdkWY',
                                            language: 'en',
                                            components: 'country:qa',
                                        }}
                                        fetchDetails={true}
                                        debounce={300}
                                        enablePoweredByContainer={false}
                                        textInputProps={{
                                            placeholderTextColor: '#8e8e8e',
                                            value: toLocation,
                                            onFocus: () => {
                                                console.log('📍 Destination input focused');
                                                setFocusedInput('to');
                                            },
                                        }}
                                    />
                                </View>
                                {toLocation && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => handleClearLocation('to')}
                                    >
                                                                                                                <Svg xml={inputCross} rest={{ height: 14, width: 14 }} />

                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        
                        <View style={styles.swapButtonContainer}>
                            <TouchableOpacity
                                style={styles.swapButton}
                                onPress={handleSwapLocations}
                            >
                                                                <Svg xml={swap} rest={{ height: 30, width: 24 }} />

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>