import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, ActivityIndicator } from 'react-native';
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
  loading?: boolean; // Optional loading state
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
  iconSize = 24,
  iconColor = '#000',
  backgroundColor,
  variant = 'primary', // Default variant is primary
  loading = false,
}) => {
  // Determine the background color based on the variant prop
  const buttonBackgroundColor = variant === 'secondary' ? '#F2D5AF' : backgroundColor || StyleGuide.color.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: buttonBackgroundColor }, 
        (disabled || loading) && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size={28} color={iconColor} style={{ marginRight: 0 }} />
      ) : (
        <>
          {icon && <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>{icon}</View>}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </>
      )}
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
  disabledButton: {
    opacity: 0.5,
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
