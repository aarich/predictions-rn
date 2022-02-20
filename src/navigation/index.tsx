import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { useIsDark } from '../utils/hooks';
import LinkingConfiguration from './LinkingConfiguration';
import { navigationRef } from './rootNavigation';
import RootStackNavigator from './RootStackNavigator';

export default () => {
  const isDark = useIsDark();
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={isDark ? DarkTheme : DefaultTheme}
      ref={navigationRef}
    >
      <RootStackNavigator />
    </NavigationContainer>
  );
};
