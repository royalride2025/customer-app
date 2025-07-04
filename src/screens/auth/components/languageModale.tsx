import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../../../redux/languageSlice';
import { StyleGuide } from '../../../../StyleGuide';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define the language options
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
];

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string; // Add currentLanguage prop to track the selected language
}

const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose, currentLanguage }) => {
  const dispatch = useDispatch();
  const [modalTranslateY] = useState(new Animated.Value(screenHeight)); // Start from bottom (off-screen)

  // Open the modal with an animation
  useEffect(() => {
    if (visible) {
      // Animate modal from bottom to top
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate modal out to bottom
      Animated.timing(modalTranslateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, modalTranslateY]);

  const handleLanguageChange = (language: string) => {
    dispatch(setLanguage(language)); // Dispatch action to update the language in Redux
    onClose(); // Close the modal after language change
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end', // Align content at the bottom
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <Animated.View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            borderTopLeftRadius: 10,
            borderTopRightRadius:10,
            width: screenWidth,
            transform: [{ translateY: modalTranslateY }],
          }}
        >
          <FlatList
            data={languageOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 15,
                //   borderBottomWidth: 1,
                //   borderColor: '#eee',
                borderRadius:8,
                  backgroundColor: item.value === currentLanguage ? StyleGuide.color.primary : 'transparent', // Highlight the selected language
                }}
                onPress={() => handleLanguageChange(item.value)}
              >
                <Text style={{
                  fontSize: 16, 
                  color: item.value === currentLanguage ? '#fff' : '#555', // Change color of selected item
                  fontFamily: item.value === currentLanguage ? StyleGuide.fontFamily.bold : StyleGuide.fontFamily.regular, // Bold the selected language
                }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: StyleGuide.color.primary,
              padding: 10,
              borderRadius: 5,
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16,fontFamily:StyleGuide.fontFamily.semiBold }}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LanguageModal;
