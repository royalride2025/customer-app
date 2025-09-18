import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './stackNavigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    // Use any to avoid generic constraint issues when called outside React
    (navigationRef.navigate as any)(name, params);
  }
}


