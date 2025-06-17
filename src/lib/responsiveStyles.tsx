// responsiveStyles.ts
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base width is 375px, which is the iPhone 6/7/8 width
const BASE_WIDTH = 375;

// Screen size categories
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeScreen = SCREEN_WIDTH >= 414;

// Function to get responsive size
const getResponsiveSize = (size: number): number => {
    return (size * SCREEN_WIDTH) / BASE_WIDTH;
};

// Function to get responsive font size
const getResponsiveFontSize = (size: number): number => {
    return Math.max(12, (size * SCREEN_WIDTH) / BASE_WIDTH); // Min font size of 12px
};

export {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    getResponsiveSize,
    getResponsiveFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
};
