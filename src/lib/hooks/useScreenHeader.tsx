import { useLayoutEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { Platform, TouchableOpacity } from 'react-native';
import Svg from '../svg';
import { backArrow } from '../../../assets/svgAssets';
import { StyleGuide } from '../../../StyleGuide';
import { getResponsiveFontSize } from '../responsiveStyles';


interface UseScreenHeaderProps {
  title: string;
  options?: Partial<StackNavigationOptions>;
  showBackButton?: boolean;
}

export const useScreenHeader = ({
  title,
  options = {},
  showBackButton = true,
}: UseScreenHeaderProps): void => {
  const navigation = useNavigation<NavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerStyle: {
        backgroundColor: StyleGuide.color.backgroundColor,
        elevation: 0,            // Android shadow
        shadowOpacity: 0,        // iOS shadow
        shadowOffset: {
          height: 0,
          width: 0,
        },
        shadowRadius: 0,
        borderBottomWidth: 0,    // Sometimes needed fallback
        ...(options.headerStyle ?? {}),
      },
      headerShadowVisible: false, // For newer React Navigation versions (iOS)
      headerLeft: showBackButton
        ? () => (
            <TouchableOpacity
              style={{ marginHorizontal: 16 }}
              onPress={() => navigation.goBack()}
            >
              <Svg xml={backArrow} rest={{ height: 24, width: 24 }} />
            </TouchableOpacity>
          )
        : undefined,
        headerTitleStyle: {
          color: StyleGuide.color.black, // Set the title color here
          fontSize: getResponsiveFontSize(18), // Customize the font size (optional)
          fontWeight: StyleGuide.fontFamily.bold, // Customize the font weight (optional)
        },
      ...options,
    });
  }, [navigation, title, showBackButton, options]);
};
