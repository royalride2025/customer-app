import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useScreenHeader } from '../../lib/hooks/useScreenHeader';
import { StyleGuide } from '../../../StyleGuide';
import useTranslationStyles from '../../../locales/useTranslationStyles';
import { RootState } from '../../redux/store';
import { useAppSelector } from '../../redux/reduxHooks';
import { t } from 'i18next';

const carMain=require('../../../assets/images/carp1.png')
const engine1=require('../../../assets/images/carEngin1.png')
const engine2=require('../../../assets/images/carEngin2.png')

interface CarProfileProps {}

const CarProfile: React.FC<CarProfileProps> = () => {
    useScreenHeader({
        title: t("header.profile"),
        
      });
      const { flexDirection, flipImage ,textAlignment} = useTranslationStyles();
      const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  return (
    <SafeAreaView style={StyleGuide.layout.container    }>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
    
      <ScrollView  showsVerticalScrollIndicator={false}>
        {/* Main Car Image */}
        <View style={styles.mainImageContainer}>
          <Image
            source={carMain}
            style={styles.mainCarImage}
            resizeMode="contain"
          />
        </View>

        {/* Interior Images */}
        <View style={[styles.interiorImagesContainer]}>
          <View style={styles.interiorImageWrapper}>
            <Image
              source={engine1}
              style={styles.interiorImage}
            />
          </View>
          <View style={styles.interiorImageWrapper}>
            <Image
              source={engine2}
              style={styles.interiorImage}
            />
          </View>
        </View>

        {/* Car Details */}
        <View style={styles.detailsContainer}>
          <View style={[styles.detailRow,flexDirection]}>
            <View style={styles.detailColumn}>
              <Text style={[styles.detailLabel]}>{t('carProfile.model')}</Text>
              <Text style={styles.detailValue}>RR Cullinan</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.plates_number')}</Text>
              <Text style={styles.detailValue}>B12</Text>
            </View>
          </View>

          <View style={[styles.detailRow,flexDirection]}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.body')}</Text>
              <Text style={styles.detailValue}>SUV</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>{t('carProfile.color')}</Text>
              <Text style={styles.detailValue}>Black</Text>
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
    backgroundColor: '#f5f5f5',
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
    marginHorizontal: 10,
    // marginTop: 20,
    borderRadius: 15,
    // paddingVertical: 40,
    // paddingHorizontal: 20,
  
  },
  mainCarImage: {
    width: '100%',
    height: '80%',
  },
  interiorImagesContainer: {
    flexDirection: 'row',
    // marginTop: 20,
    gap: 18,
  },
  interiorImageWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
   
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
    textAlign:'center'
  },
  detailValue: {
    fontSize: 20,
    color: StyleGuide.color.blackishGrey,
    fontFamily:StyleGuide.fontFamily.semiBold,
    textAlign:'center'
  },
});

export default CarProfile;