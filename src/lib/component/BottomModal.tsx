import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';
import Svg from '../svg';
import { cross } from '../../../assets/svgAssets';

const { height: screenHeight } = Dimensions.get('window');

const BottomModal = ({
  isVisible,
  onClose,
  children,
  showHandle = true,
  maxHeight = 0.85,
  animationDuration = 300,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  style,
  contentStyle,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, overlayAnim, animationDuration]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { 
            opacity: overlayAnim,
            backgroundColor: overlayColor,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * maxHeight,
          },
          style,
        ]}
      >
        <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Svg xml={cross} rest={{height:18,width:18}} />
              </TouchableOpacity>
        
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        <ScrollView 
          style={[styles.content, contentStyle]} 
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: StyleGuide.color.backgroundColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: '40%',
    height: 6,
    backgroundColor: StyleGuide.color.blackishGrey,
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
 
  closeButton: {
    padding: 4,
    flex:1,
    top:20,
    right:20,
   
    alignItems:'flex-end'
  },
 
  content: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    bottom:0
  },
});

export default BottomModal;
