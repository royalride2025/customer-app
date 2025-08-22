import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';

const { width: screenWidth } = Dimensions.get('window');

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  thumbSize?: number;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  width = 60,
  height = 32,
  activeColor = StyleGuide.color.primary,
  inactiveColor = StyleGuide.color.border,
  thumbColor = StyleGuide.color.white,
  thumbSize = 24,
}) => {
  const translateX = useRef(new Animated.Value(value ? width - height : 0)).current;
  const backgroundColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    const toValue = value ? width - height : 0;
    const bgValue = value ? 1 : 0;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backgroundColor, {
        toValue: bgValue,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, width, height]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const interpolatedBgColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: interpolatedBgColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            transform: [{ translateX }],
            backgroundColor: thumbColor,
          },
        ]}
      />
      {/* Add subtle inner shadow effect */}
      <View style={styles.innerShadow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  thumb: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  innerShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default CustomSwitch;
