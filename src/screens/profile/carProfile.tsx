import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,

  StatusBar,
} from 'react-native';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { StyleGuide } from '../../../StyleGuide';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { RootState } from '../../redux/store';
import { useAppSelector } from '../../redux/reduxHooks';
import { t } from 'i18next';
import { screenHeight, screenWidth } from '../../utils/dimenstions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

const carMain=require('../../../assets/images/carp1.png')
const engine1=require('../../../assets/images/carEngin1.png')
const engine2=require('../../../assets/images/carEngin2.png')

interface CarProfileProps {}

const CarProfile: React.FC<CarProfileProps> = () => {
  const { carData } = useRoute().params as { carData: any };
    useScreenHeader({
        title:"Car Profile",
        
      });
      const { flexDirection, flipImage ,textAlignment} = useTranslationStyles();
      const isRTL = useAppSelector((state: RootState) => state.language.isRTL);

const userProfile=useAppSelector((state: RootState) => state.profile?.data);
const vehiicleData=userProfile?.profile?.driver_profile?.vehicle;

  return (
    <SafeAreaView style={StyleGuide.layout.container    }>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
    
      <ScrollView 
        testID="car-profile-scroll"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}>
        {/* Main Car Image */}
        {carData?.vehicle_pictures?.[0] && (
          <View style={styles.mainImageContainer}>
            <Image
              source={{uri: carData.vehicle_pictures[0]}}
              style={styles.mainCarImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Interior Images - Handle different image counts */}
        {carData?.vehicle_pictures && carData.vehicle_pictures.length > 1 && (
          <View style={[
            styles.interiorImagesContainer,
            // Adjust layout based on image count
            carData.vehicle_pictures.length === 2 && styles.twoImagesContainer
          ]}>
            {/* Second image */}
            {carData.vehicle_pictures[1] && (
              <View style={[
                styles.interiorImageWrapper,
                // If only 2 images, make the second image take full width
                carData.vehicle_pictures.length === 2 && styles.singleImageWrapper
              ]}>
                <Image
                  source={{uri: carData.vehicle_pictures[1]}}
                  style={styles.interiorImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            {/* Third image - only show if it exists */}
            {carData.vehicle_pictures[2] && (
              <View style={styles.interiorImageWrapper}>
                <Image
                  source={{uri: carData.vehicle_pictures[2]}}
                  style={styles.interiorImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        )}

        {/* Show message if no images available */}
        {(!carData?.vehicle_pictures || carData.vehicle_pictures.length === 0) && (
          <View style={styles.noImagesContainer}>
            <Text style={styles.noImagesText}>No car images available</Text>
          </View>
        )}
        {/* {Array.from({ length: 10 }, (_, index) => (
  <View key={index} style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 10 }}>
    <Text>Test content {index + 1}</Text>
  </View>
))} */}


        {/* Car Details */}
        <View style={styles.detailsContainer}>
          <View style={[styles.detailRow,flexDirection]}>
            <View style={styles.detailColumn}>
              <Text style={[styles.detailLabel]}>{t('carProfile.model')}</Text>
              <Text style={styles.detailValue}>{carData?.car_model}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.plates_number')}</Text>
              <Text style={styles.detailValue}>{carData?.license_plate}</Text>
            </View>
          </View>

          <View style={[styles.detailRow,flexDirection]}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.body')}</Text>
              <Text style={styles.detailValue}>{carData?.vehicle_type}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.color')}</Text>
              <Text style={styles.detailValue}>{carData?.vehicle_color}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginRight: 20,
    padding: 5,
  },
  scrollContentContainer: {
    paddingBottom: 30,
    // paddingHorizontal: 10,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  mainImageContainer: {
    backgroundColor: '#fff',
    // marginHorizontal: 5,
    borderRadius: 15,
    height: screenHeight * 0.3,
    marginTop:10,
    width: screenWidth * 0.90,
    overflow: 'hidden', // Add this to ensure image respects border radius
    elevation:1,
    marginHorizontal:2
  },
  mainCarImage: {
    width: '100%',
    height: '100%', // Changed from '80%' to '100%' to fill the container
    borderRadius: 15, // Match the container's border radius
  },
  interiorImagesContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 18,
    paddingHorizontal:1,

  },
  interiorImageWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation:1
   
  },
  interiorImage: {
    width: '100%',
    height: 170,
    borderRadius:15
  },
  detailsContainer: {
    marginTop: 30,
    marginBottom: 30,   

  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 25,
    
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: StyleGuide.color.lightGrey,
    fontFamily:StyleGuide.fontFamily.semiBold,
    textAlign:'left',
    marginLeft:10,
    lineHeight:18
  },
  detailValue: {
    fontSize: 18,
    color: StyleGuide.color.blackishGrey,
    fontFamily:StyleGuide.fontFamily.semiBold,
    textAlign:'left',
    marginLeft:10,
    lineHeight:24
  },
  noImagesContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  noImagesText: {
    fontSize: 16,
    color: StyleGuide.color.lightGrey,
    fontFamily: StyleGuide.fontFamily.medium,
    textAlign: 'center',
  },
  twoImagesContainer: {
    // When there are only 2 images, adjust the layout
    justifyContent: 'center',
  },
  singleImageWrapper: {
    // When there's only 1 interior image, make it take more space
    flex: 1.5,
  },
});

export default CarProfile;