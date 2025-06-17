import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { StyleGuide } from '../../../StyleGuide';

// Define the types for the props that the button will accept
interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode; // Optional icon
  iconSize?: number; // Optional icon size
  iconColor?: string; // Optional icon color
  backgroundColor?: string; // Optional background color
  variant?: 'primary' | 'secondary'; // Variant for different background colors
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
  iconSize = 24,
  iconColor = '#fff',
  backgroundColor,
  variant = 'primary', // Default variant is primary
}) => {
  // Determine the background color based on the variant prop
  const buttonBackgroundColor = variant === 'secondary' ? '#F2D5AF' : backgroundColor || StyleGuide.color.primary;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonBackgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>{icon}</View>}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Default styles for the button
const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.semiBold,
    color: StyleGuide.color.black,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default AppButton;
