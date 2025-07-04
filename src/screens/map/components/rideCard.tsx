import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  I18nManager,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';
import useTranslationStyles from '../../../../locales/useTranslationStyles';
import { useAppSelector } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';

const RideCard = ({ ride, isSelected, onSelect, style, image }) => {
  const { flexDirection } = useTranslationStyles();
  const isRTL = useAppSelector((state: RootState) => state.language.isRTL);
  
  // Create RTL-aware styles
  const rtlStyles = {
    container: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    content: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      paddingLeft: isRTL ? 0 : 16,
      paddingRight: isRTL ? 16 : 0,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    details: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    imageContainer: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    name: {
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    price: {
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    time: {
      textAlign: isRTL ? 'right' : 'left',
    },
    type: {
      textAlign: isRTL ? 'right' : 'left',
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        rtlStyles.container,
        isSelected && styles.selectedContainer,
        style,
      ]}
      onPress={() => onSelect(ride.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.content, rtlStyles.content]}>
        <View style={styles.info}>
          <View style={[styles.header, rtlStyles.header]}>
            <Text style={[styles.name, rtlStyles.name]}>{ride.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={[styles.type, rtlStyles.type]}>{ride.type}</Text>
            </View>
          </View>
          <View style={[styles.details, rtlStyles.details]}>
            <Text style={[styles.price, rtlStyles.price]}>
              {ride.price}{' '}
              <Text style={{ 
                color: StyleGuide.color.black, 
                fontSize: 14 
              }}>
                {ride.currency}
              </Text>
            </Text>
            <Text style={[styles.time, rtlStyles.time]}>{ride.time}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.imageContainer, rtlStyles.imageContainer]}>
        <Image 
          source={image} 
          style={[
            styles.image,
            isRTL && { transform: [{ scaleX: -1 }] }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedContainer: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3E2',
  },
  content: {
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    flex: 1,
  },
  info: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
  },
  typeContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  type: {
    fontSize: 10,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
  },
  details: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.primary,
  },
  time: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.lightGrey,
  },
  imageContainer: {
    flex: 0.45,
  },
  image: {
    height: 80,
    width: 100,
    resizeMode: 'contain',
  },
  icon: {
    fontSize: 32,
  },
});

// PropTypes for better development experience (optional)
RideCard.defaultProps = {
  ride: {
    id: null,
    name: '',
    type: '',
    price: '0',
    currency: '',
    time: '',
    icon: '🚗',
  },
  isSelected: false,
  onSelect: () => {},
  style: {},
};

export default RideCard;