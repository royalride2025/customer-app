import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import Svg from '../svg';
import { currentLocationicon } from '../../../assets/svgAssets';
import { StyleGuide } from '../../../StyleGuide';

interface CurrentLocationButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  iconSize?: number;
  showWhenEmpty?: boolean; // Only show when location is empty (for use in input fields)
  isEmpty?: boolean; // Whether the location field is empty
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  style,
  iconSize = 20,
  showWhenEmpty = false,
  isEmpty = true,
}) => {
  // If showWhenEmpty is true, only show when isEmpty is true
  if (showWhenEmpty && !isEmpty) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        (disabled || isLoading) && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={StyleGuide.color.primary} />
      ) : (
        <Svg xml={currentLocationicon} rest={{ height: iconSize, width: iconSize }} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CurrentLocationButton;

