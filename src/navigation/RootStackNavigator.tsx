import { useLinkTo } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyConstants, RootStackParamList } from '../utils';
import { useCurrentUserId } from '../utils/hooks';
import RootBottomTabNavigator from './RootBottomTabNavigator';
import { stackScreens } from './screens';
import TopNavigation from './TopNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStackNavigator = () => {
  const topInsets = useSafeAreaInsets().top;

  const linkTo = useLinkTo();
  const onGoToLogin = () => linkTo('/login');
  const userId = useCurrentUserId();
  return (
    <Stack.Navigator
      initialRouteName="Root"
      screenOptions={{
        header: TopNavigation(topInsets, !!userId, onGoToLogin),
      }}
    >
      <Stack.Screen
        name="Root"
        component={RootBottomTabNavigator}
        options={{ headerShown: false, title: MyConstants.manifest?.name }}
      />
      {stackScreens.map(({ name, screen, options }) => (
        <Stack.Screen
          key={name}
          name={name}
          component={screen}
          options={options}
        />
      ))}
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
