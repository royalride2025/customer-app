import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Image,
  Appearance,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { StyleGuide } from '../../../../StyleGuide';
import AppButton from '../../../lib/component/AppButton';
import { useScreenHeader } from '../../../lib/hooks/useScreenHeader';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';


const car=require('../../../../assets/images/car.png')
const vehicles = [
  {
    id: 'lexus',
    name: t('lexus_600'),  
    model: t('model_black_cf_2826'),
    image: car,
  },
  {
    id: 'defender',
    name: t('defender'),  
    model: t('model_black_cf_5648'), 
    image: car,
  },
  {
    id: 'cullinan',
    name: t('cullinan'),  
    model: t('model_black_cf_58719'),
    image: car,
  },
];
const RentARide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDuration, setSelectedDuration] = useState(new Date(0, 0, 0, 0, 15, 0));
  const [selectedVehicle, setSelectedVehicle] = useState('Lexus 600');
 

  useScreenHeader({
    title: t('header.rent_ride'),
  });
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  const colorScheme = Appearance.getColorScheme();
  const textColor = colorScheme === 'dark' ? '#FFF' : '#000'; 
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_time_and_day')}</Text>
          <View style={styles.pickerBox}>
            <DatePicker
            theme='auto'
              date={selectedTime}
              onDateChange={setSelectedTime}
              mode="datetime"
              androidVariant=""
              textColor={textColor}
              fadeToColor="transparent"
              locale="en"
              dividerColor={StyleGuide.color.primary}
            />
          </View>
        </View>

        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_hours')}</Text>
          <View style={styles.pickerBox}>
            <DatePicker
            theme='auto'
              date={selectedDuration}
              onDateChange={setSelectedDuration}
              mode="time"
              androidVariant="iosClone"
              textColor={textColor}
              fadeToColor="transparent"
              locale="en"
              is24hourSource="locale"
              dividerColor={StyleGuide.color.primary}
            />
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_your_ride')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleScroller}
          >
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.name && styles.selectedVehicleCard,
                ]}
                onPress={() => setSelectedVehicle(vehicle.name)}
              >
                <View style={styles.vehicleImageContainer}>
                    <Image source={vehicle?.image} style={{height:50,width:50}} resizeMode='contain'/>
                </View>
                <Text style={[styles.vehicleName,selectedVehicle === vehicle.name && styles.selectedVehicleText,,{textAlign:isRTL?'right':'left'}]}>{vehicle.name}</Text>
                <Text style={[styles.vehicleModel,{textAlign:isRTL?'right':'left'}]}>{vehicle.model}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Auto Accept Toggle */}
        {/* <View style={styles.toggleSection}>
          <Text style={styles.toggleText}>Auto accept the nearest driver</Text>
          <Switch
            value={autoAccept}
            onValueChange={setAutoAccept}
            trackColor={{ false: '#E5E5E5', true: '#D4AF37' }}
            thumbColor={autoAccept ? '#FFFFFF' : '#FFFFFF'}
          />
        </View> */}

      </ScrollView>

      {/* Next Button */}
      <AppButton title={t("next")}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleGuide.layout.container,
   
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color:StyleGuide.color.black,
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor:StyleGuide.color.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  vehicleScroller: {
    marginTop: 10,
  },
  vehicleCard: {
    backgroundColor:StyleGuide.color.white,
    borderRadius: 12,
    padding: 20,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  selectedVehicleCard: {
    backgroundColor: StyleGuide.color.primary,
   
  },
  selectedVehicleText:{
    color:StyleGuide.color.black
  },
  vehicleImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleImage: {
    fontSize: 30,
  },
  vehicleName: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.primary,
    marginBottom: 5,
  },
  vehicleModel: {
    fontSize: 12,
    fontFamily:StyleGuide.fontFamily.regular,
    color: StyleGuide.color.black,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
 
});

export default RentARide;
