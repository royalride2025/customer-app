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
import Svg from '../../../lib/svg';
import { premiumIcon, standardIcon, vipIcon } from '../../../../assets/svgAssets';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { t } from 'i18next';

const services = [
    {
        id:'standard',
      icon: standardIcon,
      text: 'Standard',
      extraStyle: { marginRight: 5 },
    },
    {
        id:'premium',
      icon: premiumIcon,
      text: 'Premium',
      extraStyle: {},
    },
    {
        id:'vip',
      icon: vipIcon,
      text: 'VIP',
      extraStyle: {},
    },
  ];
const BookRide = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
 
 const navigation=useNavigation()
 
 useScreenHeader({
   title: 'Book a Ride',
   
  });
  const handleNextButton = () => {
    navigation.navigate('map', { from: 'bookRide' });  // Navigate to the 'Map' screen and pass parameters
  };
  const colorScheme = Appearance.getColorScheme();
  const textColor = colorScheme === 'dark' ? '#FFF' : '#000'; 
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle,{textAlign:isRTL?'right':'left'}]}>{t('select_reservation_time')}</Text>
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


        {/* <Text style={styles.servicesTitle}>Select Your Ride</Text>
        <View style={styles.servicesContainer}>
  {services.map((service, index) => {
    const isSelected = selectedService === service.id;
    return (

    <TouchableOpacity
      key={index}
      onPress={() => setSelectedService(service.id)}
      style={[
        styles.serviceButtonSecondary,
        { marginHorizontal: 0 },
        service.extraStyle,
        isSelected && styles.selectedButton, 
      ]}
    >
      <Svg xml={service.icon} rest={{ height: 62, width: 52 }} />
      <Text style={styles.serviceText}>{service.text}</Text>
    </TouchableOpacity>
  )})}
</View> */}
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
      <AppButton onPress={handleNextButton} title={t('next')}/>
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
    marginBottom: 10,
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
    marginTop:10
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
  servicesTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 12,
    marginTop:15
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceButtonSecondary: {
    backgroundColor: StyleGuide.color.white,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
   width:'31%',
    elevation: 0.4,
  },
  serviceText: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    textAlign: 'center',
    color: StyleGuide.color.blackishGrey,
    marginTop: 10,
  },
  savedTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.blackishGrey,
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedButton: {
    backgroundColor: StyleGuide.color.secondary, 
    borderRadius: 8,
  },
  
  selectedText: {
 
    fontWeight: 'bold',
  },
 
});

export default BookRide;
