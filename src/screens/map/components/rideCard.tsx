import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { StyleGuide } from '../../../../StyleGuide';

const RideCard = ({ ride, isSelected, onSelect, style,image }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        style,
      ]}
      onPress={() => onSelect(ride.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.name}>{ride.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{ride.type}</Text>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={styles.price}>
              {ride.price} <Text style={{color:StyleGuide.color.black,fontSize:14}}>{ride.currency}</Text> 
            </Text>
            <Text style={styles.time}>{ride.time}</Text>
          </View>
        </View>
      </View>
      <View style={{flex:0.45,alignItems:'flex-end'}}>

        <Image source={image} style={{height:80,width:100,resizeMode:'contain'}}/>
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
    paddingRight:0,
    flexDirection:'row',
    alignItems:'center'
  },
  selectedContainer: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3E2',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    // backgroundColor:'green',
    flex:1
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontFamily:StyleGuide.fontFamily.bold,
    color: StyleGuide.color.black,
    marginRight: 8,
  },
  typeContainer: {
   
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  type: {
    fontSize: 10,
 
    fontFamily:StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between'
  },
  price: {
    fontSize: 18,
    fontFamily:StyleGuide.fontFamily.bold,
    color: StyleGuide.color.primary,
    marginRight: 16,
  },
  time: {
    fontSize: 14,
    fontFamily:StyleGuide.fontFamily.bold,
    color: StyleGuide.color.lightGrey,
  },
  icon: {
    fontSize: 32,
    marginLeft: 16,
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