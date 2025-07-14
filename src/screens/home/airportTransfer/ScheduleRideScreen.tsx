import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, TextInput, Linking } from 'react-native';
import Svg from '../../../lib/svg';
import { locationIcon, currentLocationicon, inputCross, swap, airportTransferIcon } from '../../../../assets/svgAssets';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import { t } from 'i18next';
import { useAppSelector } from '../../../redux/reduxHooks';
import useTranslationStyles from '../../../../locales/useTranslationStyles';

const ScheduleRideScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { toLocation = '' } = route.params || {};
  const isAirportDestination = typeof toLocation === 'string' && toLocation.toLowerCase().includes('airport');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [flightNumber, setFlightNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'flight' | 'time'>('flight');
  const isRTL = useAppSelector((state) => state.language.isRTL);
  const { flexDirection, textAlignment } = useTranslationStyles();

  // Example drop-off time calculation
  const rideDuration = 19; // minutes
  const dropoffDate = new Date(date.getTime() + rideDuration * 60000);
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  useScreenHeader({
    title: t('schedule_ride'),
  });
console.log("isAirportDestination",isAirportDestination)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
  
      {/* Date & Time */}
      <View style={styles.tabRow}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'flight' && styles.activeTab,
              { flex: 1 }
            ]}
            onPress={() => setActiveTab('flight')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'flight' && styles.activeTabText,
              !isAirportDestination && styles.disabledTabText
            ]}>
              {t('by_flight_arrival')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'time' && styles.activeTab,
              { flex: 1 }
            ]}
            onPress={() => setActiveTab('time')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'time' && styles.activeTabText
            ]}>
              {t('by_time')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Date</Text>
        <TouchableOpacity onPress={() => { setPickerMode('date'); setShowDatePicker(true); }}>
          <Text style={[styles.inputValue, textAlignment]}>{formatDate(date)}</Text>
        </TouchableOpacity>
      </View>
      {isAirportDestination &&(
      <View style={styles.cardInput}>
        <Text style={[styles.inputLabel, textAlignment]}>Time</Text>
        <TouchableOpacity onPress={() => { setPickerMode('time'); setShowDatePicker(true); }}>
          <Text style={[styles.inputValue, textAlignment]}>{formatTime(date)}</Text>
        </TouchableOpacity>
      </View>
      )
}
      {/* Date/Time Picker Modal */}
     
      { showDatePicker &&  (
    <View style={styles.pickerModalOverlay}>
      <View style={styles.pickerModalContent}>
        <DatePicker
          modal
          open={showDatePicker}
          date={date}
          mode={pickerMode}
          onConfirm={(selectedDate) => {
            setShowDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setShowDatePicker(false)}
          theme="auto"
          locale="en"
          dividerColor={StyleGuide.color.primary}
        />
      </View>
    </View>
)}
      {/* Flight number (only if airport is destination) */}
     
          <View style={[styles.cardInputRow, flexDirection]}>
            <Svg xml={airportTransferIcon} rest={{ height: 20, width: 20, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
            <TextInput
              style={[styles.flightInput, textAlignment]}
              placeholder={isAirportDestination?t('flight_number_optional'):t('flight_number_required')}
              placeholderTextColor={StyleGuide.color.grey}
              value={flightNumber}
              onChangeText={setFlightNumber}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          <Text style={[styles.infoText, textAlignment]}>{t('flight_info_helps_terminal')}</Text>
      

      {/* Drop-off estimate */}
      {isAirportDestination &&(
        <>
      <View style={styles.estimateRow}>
        <Svg xml={locationIcon} rest={{ height: 18, width: 18, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
        <View>
          <Text style={[styles.dropoffTime, textAlignment]}>{t('dropoff_at_approx', { time: formatTime(dropoffDate) })}</Text>
          <Text style={[styles.estimateText, textAlignment]}>{t('estimated_ride_duration', { duration: rideDuration })}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      </>
      )}
      {/* Airport drop-off perks */}
      <View style={styles.perksRow}>
        <Svg xml={airportTransferIcon} rest={{ height: 18, width: 18, style: isRTL ? { marginLeft: 8 } : { marginRight: 8 } }} />
        <View>
          <Text style={[styles.perksTitle, textAlignment]}>{t('airport_dropoff_perks')}</Text>
          <Text style={[styles.perksLink, textAlignment]} onPress={() => Linking.openURL('https://www.blacklane.com/en/airport-transfer/')}>{t('learn_more_blacklane')}</Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <AppButton title="Set pickup time" onPress={() => {}} style={{ width: '100%' }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
   ...StyleGuide.layout.container
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: StyleGuide.color.black,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: StyleGuide.color.black,
  },
  cardInput: {
    backgroundColor: '#F6F6F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  inputLabel: {
    color: StyleGuide.color.grey,
    fontSize: 14,
    marginBottom: 2,
  },
  inputValue: {
    color: StyleGuide.color.black,
    fontSize: 16,
    fontWeight: '500',
  },
  flightInput: {
    flex: 1,
    fontSize: 16,
    color: StyleGuide.color.black,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 8,
  },
  infoText: {
    color: StyleGuide.color.grey,
    fontSize: 13,
    marginBottom: 18,
    marginLeft: 4,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropoffTime: {
    fontWeight: 'bold',
    color: StyleGuide.color.black,
    fontSize: 16,
  },
  estimateText: {
    color: StyleGuide.color.grey,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perksTitle: {
    fontWeight: 'bold',
    color: StyleGuide.color.black,
    fontSize: 16,
  },
  perksLink: {
    color: StyleGuide.color.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  pickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: StyleGuide.color.grey,
  },
  activeTab: {
    backgroundColor: StyleGuide.color.primary,
    borderColor: StyleGuide.color.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: StyleGuide.color.white,
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    color: '#999',
  },
});

export default ScheduleRideScreen; 