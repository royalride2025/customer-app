import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

interface TimePickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  unit?: string;
  height?: number;
}

const ITEM_HEIGHT = 44;
const { width } = Dimensions.get('window');

export function TimePicker({
  values,
  selectedValue,
  onValueChange,
  unit,
  height = 160,
}: TimePickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const selectedIndex = values.indexOf(selectedValue);
    if (selectedIndex !== -1 && scrollViewRef.current && !isScrolling) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }, 100);
    }
  }, [selectedValue, values, isScrolling]);

  const handleScrollBegin = () => {
    setIsScrolling(true);
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
  };

  const handleScrollEnd = () => {
    scrollTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    
    if (values[clampedIndex] !== selectedValue) {
      onValueChange(values[clampedIndex]);
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
    
    handleScrollEnd();
  };

  const getItemOpacity = (index: number) => {
    const selectedIndex = values.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    
    if (distance === 0) return 1;
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.3;
    return 0.15;
  };

  const getItemScale = (index: number) => {
    const selectedIndex = values.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    
    if (distance === 0) return 1;
    if (distance === 1) return 0.9;
    return 0.8;
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Selection indicator */}
      <View style={styles.selectionIndicator} />
      
      {/* Gradient overlays for better visual effect */}
      <View style={[styles.gradientTop, { height: (height - ITEM_HEIGHT) / 2 }]} />
      <View style={[styles.gradientBottom, { height: (height - ITEM_HEIGHT) / 2 }]} />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.98}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: (height - ITEM_HEIGHT) / 2,
        }}>
        {values.map((value, index) => {
          const isSelected = value === selectedValue;
          const opacity = getItemOpacity(index);
          const scale = getItemScale(index);
          
          return (
            <TouchableOpacity
              key={`${value}-${index}`}
              style={[
                styles.item,
                { 
                  height: ITEM_HEIGHT,
                  opacity,
                  transform: [{ scale }],
                }
              ]}
              activeOpacity={0.7}
              onPress={() => {
                onValueChange(value);
                scrollViewRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
              }}>
              <Text style={[
                styles.itemText,
                isSelected && styles.selectedText,
                { fontSize: isSelected ? 18 : 16 }
              ]}>
                {isSelected && unit ? `${value} ${unit}` : value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: '#D4A574',
    borderRadius: 12,
    zIndex: 1,
    marginTop: -ITEM_HEIGHT / 2,
    opacity: 0.15,
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  itemText: {
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  selectedText: {
    color: '#D4A574',
    fontWeight: '700',
  },
});