import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StyleGuide } from '../../../../../StyleGuide';
import Svg from '../../../../lib/svg';
import { check, checkIcon, cross } from '../../../../../assets/svgAssets';
import { screenWidth } from '../../../../utils/dimenstions';
import { useAppSelector } from '../../../../redux/reduxHooks';
import useTranslationStyles from '../../../../../locales/useTranslationStyles';
import { RootState } from '../../../../redux/store';

const car = require('../../../../../assets/images/car1.png');
const profile = require('../../../../../assets/images/profile.png');



interface TripCardProps {
  vehicleImage: any; // can be {uri: string} or require statement
  vehicleName: string;
  vehicleModel: string;
  vehicleRating?: number;
  driverName: string;
  driverImage: any; // can be {uri: string} or require statement
  driverRating?: number;
  price: string;
  currency?: string;
  onAccept: () => void;
  onReject: () => void;
  style?: object;
}

const TripCard: React.FC<TripCardProps> = ({
  vehicleImage,
  vehicleName,
  vehicleModel,
  vehicleRating = 5.0,
  driverName,
  driverImage,
  driverRating = 5.0,
  price,
  currency = 'QR',
  onAccept,
  onReject,
  style,
}) => {
  const { flexDirection, textAlignment, flipImage } = useTranslationStyles();
    const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content,flexDirection]}>

        <View style={styles.vehicleSection}>
          <View style={{ position: 'relative' }}>
            <Image source={{uri:vehicleImage}} style={[styles.vehicleImage, flipImage,isRTL?{marginLeft:10}:{marginRight:10}]} resizeMode="contain" />
            <Image source={{uri:driverImage}} style={[styles.driverImage,isRTL ? { left: 8,bottom:0 } : { right: 0,bottom:5 }]} />
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          <View style={[styles.vehicleNameSection,flexDirection]}>
            <Text numberOfLines={1} style={[styles.vehicleName,textAlignment]}>{vehicleName}</Text>
            <Text style={[styles.vehicleRating, textAlignment,isRTL?{marginRight:10}:{marginLeft: 10,}]}>
              {vehicleRating} ⭐
            </Text>
          </View>

          <Text style={[styles.vehicleModel,isRTL?{textAlign: 'right'  }:{textAlign: 'left' }]}>({vehicleModel}) XYZ-123</Text>
          <View style={[styles.driverSection,flexDirection]}>
            <View style={[styles.driverInfo,flexDirection]}>
              <View style={[styles.driverNameSection,flexDirection]}>
                <Text numberOfLines={1} style={[styles.driverName,textAlignment]}>{driverName}</Text>
                <Text style={[styles.driverRating,isRTL?{marginRight:8}:{marginLeft:8},textAlignment]}>
                  {driverRating} ⭐
                </Text>
              </View>

              <Text style={styles.price}>
                {price} {currency}
              </Text>
            </View>
          </View>
          <View style={[styles.buttons,flexDirection,{alignSelf:isRTL?'flex-end':'flex-start'}]}>
            <TouchableOpacity style={styles.button} onPress={onReject}>
              <Svg xml={cross} rest={{ height: 14, width: 14 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onAccept}>
              <Svg xml={checkIcon} rest={{ height: 18, width: 18 }} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    width: screenWidth - 20,
    alignSelf: 'center',
    marginVertical: 10,
  },
  content: {
    flexDirection: 'row',
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 95,
  },
  vehicleImage: {
    width: screenWidth * 0.32,
    height: 120,
    borderRadius: 5,
    // marginRight: 10,
  },
  vehicleInfo: {
    flex: 1,
    paddingLeft: 10,
    marginTop: 15,
  },
  vehicleNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    // width: screenWidth * 0.45,
    // backgroundColor:'red'
  },
  vehicleName: {
    fontSize: screenWidth * 0.045,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
    flex: 1,
    overflow: 'hidden',
    flexShrink: 1,
  },
  vehicleRating: {
    fontSize: screenWidth * 0.035,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
    
  },
  vehicleModel: {
    fontSize: screenWidth * 0.027,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  driverNameSection: {
    flexDirection: 'row',
    width: screenWidth * 0.33,
    alignItems: 'center',
  },
  driverImage: {
    width: 52,
    height: 52,
    borderRadius: 100,
    position: 'absolute',
    right: 0,
    bottom: 3,
    zIndex: 1,
  },
  driverInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverName: {
    fontSize: screenWidth * 0.029,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
    width:'70%'
  },
  driverRating: {
    fontSize: screenWidth * 0.029,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
   
  },
  price: {
    fontSize: screenWidth * 0.04,
    color: StyleGuide.color.black,
    fontFamily: StyleGuide.fontFamily.semiBold,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: screenWidth * 0.22,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    width: screenWidth * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default TripCard;
