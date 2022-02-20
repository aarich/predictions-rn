// eslint-disable-next-line filenames/match-exported
import { isDevice } from 'expo-device';
import { PermissionStatus } from 'expo-modules-core';
import {
  AndroidImportance,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  NotificationResponse,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';
import { navigate } from '../navigation/rootNavigation';
import { MyConstants } from './constants';
import { log } from './log';

export const initNotifications = () =>
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

export const handleNotificationResponse = (response: NotificationResponse) => {
  log('received notification response', { response });
  const { data } = response.notification.request.content;
  if ('post' in data) {
    const post = data.post as { id: number; is_public: boolean };

    navigate('ViewPost', { id: post.id });
  } else {
    log('Unhandled notification data', data);
  }
};

export const isNotificationsEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== 'web' && isDevice) {
    const { status } = await getPermissionsAsync();
    return status === PermissionStatus.GRANTED;
  }

  return false;
};

/** this can take a long time so best to do this asynchronously */
export const registerNotifications = async (): Promise<string | void> => {
  if (!isDevice || Platform.OS === 'web') {
    log('Not a device');
  }

  if (!(await isNotificationsEnabled())) {
    log('Notifications are disabled');

    const { status } = await requestPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      log('Notifications were denied');
      return;
    }
  }

  if (Platform.OS === 'android') {
    setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: MyConstants.manifest?.backgroundColor,
    });
  }

  // We are here so notifications are enabled
  try {
    return (await getExpoPushTokenAsync()).data;
  } catch (error) {
    log('Error getting push token', { error });
  }
};
