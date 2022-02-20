import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useLinkTo } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import { getInitialURL } from 'expo-linking';
import { useLastNotificationResponse } from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Icon } from '../components/base';
import {
  enableNotifications,
  getProfile,
  updateProfile,
} from '../redux/actions/thunk';
import { useSetting } from '../redux/selectors';
import { useAppDispatch } from '../redux/store';
import {
  AppSetting,
  BottomTabScreenInfo,
  captureException,
  handleNotificationResponse,
  handlePasswordReset,
  log,
  RootTabParamList,
  setSentryUser,
  supabase,
} from '../utils';
import { useCurrentUserId } from '../utils/hooks';
import { authNotRequiredTabs, authRequiredTabs } from './screens';
import TopNavigation from './TopNavigation';

const BottomTab = createBottomTabNavigator<RootTabParamList>();

const makeBottomTabBar = (
  tabs: BottomTabScreenInfo[],
  paddingBottom: number
) => {
  return ({ navigation, state }: BottomTabBarProps) => (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => {
        const name = state.routeNames[index];
        navigation.navigate(name === 'CreatePostTab' ? 'CreatePost' : name);
      }}
      style={{ paddingBottom }}
    >
      {tabs.map(({ icon, name }) => (
        <BottomNavigationTab
          key={name}
          icon={(props) => <Icon name={icon} {...props} />}
        />
      ))}
    </BottomNavigation>
  );
};

const RootBottomTabNavigator = () => {
  const [tabs, setTabs] = useState<BottomTabScreenInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const dispatch = useAppDispatch();

  const lastNotificationResponse = useLastNotificationResponse();
  const linkTo = useLinkTo();

  useEffect(() => {
    if (lastNotificationResponse) {
      handleNotificationResponse(lastNotificationResponse);
    }
  }, [lastNotificationResponse]);

  useEffect(() => {
    getInitialURL().then((url) => {
      if (url?.includes('#')) {
        const hash = url.substring(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        if (accessToken && params.get('type') === 'recovery') {
          handlePasswordReset(accessToken);
        }
      } else if (url) {
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          if (path && path.length > 1) {
            log('Linking to url', { url, path });
            linkTo(path);
          }
        } catch (e) {
          captureException(e);
        }
      }
    });
  }, [linkTo]);

  const expo_push_token = useSetting(AppSetting.EXPO_NOTIFICATION_TOKEN);

  useEffect(() => {
    const handleSession = (sesh: Session | null) => {
      setSession(sesh);
      if (sesh && sesh.user) {
        const { id, email } = sesh.user;
        setSentryUser({ id, email });
        // fetch the user so we have it in our redux state
        dispatch(getProfile(id)).then(() => {
          if (Platform.OS !== 'web') {
            if (expo_push_token) {
              dispatch(updateProfile(id, { expo_push_token }));
            } else {
              dispatch(enableNotifications());
            }
          }
        });
      } else {
        setSentryUser(null);
      }
    };

    handleSession(supabase.auth.session());
    log('Subscribing to supabase auth', undefined, 'auth');
    const { data: unsubscribe } = supabase.auth.onAuthStateChange((_, s) =>
      handleSession(s)
    );
    setIsLoaded(true);

    return () => {
      log('Unsubscribing from supabase auth', undefined, 'auth');
      unsubscribe?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (isLoaded) {
      setTabs(session ? authRequiredTabs : authNotRequiredTabs);
    }
  }, [isLoaded, session]);

  const insets = useSafeAreaInsets();
  const onGoToLogin = () => linkTo('/login');
  const userId = useCurrentUserId();

  if (tabs.length === 0) {
    return <ActivityIndicator />;
  }

  return (
    <BottomTab.Navigator
      initialRouteName={tabs[0].name}
      tabBar={makeBottomTabBar(tabs, insets.bottom)}
      screenOptions={{
        header: TopNavigation(insets.top, !!userId, onGoToLogin),
      }}
    >
      {tabs.map(({ name, screen, initialParams, options }) => (
        <BottomTab.Screen
          key={name}
          name={name}
          options={options}
          component={screen}
          initialParams={initialParams}
        />
      ))}
    </BottomTab.Navigator>
  );
};

export default RootBottomTabNavigator;
