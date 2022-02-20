import {
  BottomTabNavigationOptions,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, ParamListBase } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AlertButton } from 'react-native';
import { IconType } from './icons';

export type ValueOf<T> = T[keyof T];

export type ScreenInfo<P extends ParamListBase, O> = {
  name: keyof P;
  icon: IconType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  screen?: any;
  onPress?: VoidFunction;
  initialParams?: Partial<P[keyof P]>;
  options?: O;
};

export type RootStackParamList = {
  Root: undefined;

  // auth
  LogOut: undefined;

  // app
  App: undefined;
  About: undefined;
  Help: undefined;
  Twitter: undefined;
  Feedback: undefined;
  ResetCache: undefined;
  Tutorial: undefined;
  Statistics: undefined;

  // content
  ViewProfile: { id: string };
  EditProfile: undefined;
  CreatePost: undefined;
  ViewPost: { id: number };
};

export type RootTabParamList = {
  // Auth not required
  LogInTab: undefined;
  TwitterTab: undefined;
  AboutTab: undefined;
  GuestTab: undefined;

  // Logged in
  MoreTab: undefined;
  HomeTab: undefined;
  CreatePostTab: undefined;
  FollowingTab: undefined;
  NotificationsTab: undefined;
};

export type BottomTabScreenInfo = ScreenInfo<
  RootTabParamList,
  BottomTabNavigationOptions
>;

export type RootStackScreenInfo = Omit<
  ScreenInfo<RootStackParamList, NativeStackNavigationOptions>,
  'icon'
> & { icon?: IconType };

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export const isValidParam = <T>(
  k: string | number | symbol,
  obj: T
): k is keyof T => {
  return k in obj;
};

export enum AppSetting {
  EXPO_NOTIFICATION_TOKEN = 'EXPO_NOTIFICATION_TOKEN',
}

export type MyAlertButton = AlertButton & { icon?: IconType };
