import AsyncStorage from '@react-native-async-storage/async-storage';
import { nativeApplicationVersion } from 'expo-application';
import { openURL } from 'expo-linking';
import * as StoreReview from 'expo-store-review';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import FeedbackContainer from '../../containers/about/FeedbackContainer';
import {
  captureException,
  captureMessage,
  Icons,
  IconType,
  log,
  MyConstants,
  parseSqlDateString,
  prompt,
  Severity,
  supabase,
  toast,
} from '../../utils';
import { openTwitter, TWITTER_PROFILE } from './TwitterTimelineScreen';

const FeedbackScreen = () => {
  const user = supabase.auth.user();

  useEffect(() => {
    try {
      const today = new Date();
      const userCreated = user?.created_at
        ? parseSqlDateString(user?.created_at)
        : today;
      const userAge = today.getTime() - userCreated.getTime();
      const userIsOldEnough = userAge > 1000 * 60 * 60 * 24 * 5;

      if (today.getDate() % 10 === 1 && userIsOldEnough) {
        StoreReview.isAvailableAsync()
          .then((available) => {
            if (available) {
              AsyncStorage.getItem('REVIEW').then((val) => {
                if (!val) {
                  AsyncStorage.setItem('REVIEW', 'asked');
                  StoreReview.requestReview();
                }
              });
            }
          })
          .catch(log);
      }
    } catch (e) {
      captureException(e, { extra: { message: 'Requesting store review' } });
    }
  }, [user?.created_at]);

  const sendBugReport = useCallback(
    (value: string) => {
      captureMessage(value, {
        extra: {
          version: nativeApplicationVersion,
          myAppVersion: MyConstants.version,
          userCreated: user?.created_at,
        },
        level: Severity.Debug,
      });
      toast('Submitted', 'info');
    },
    [user?.created_at]
  );

  const buttons: { title: string; icon: IconType; onPress: () => void }[] = [];

  const storeUrl = Platform.select({
    default: MyConstants.appStoreUrl,
    android: MyConstants.playStoreUrl,
  });
  const app = Platform.select({ default: 'App', android: 'Play' });

  buttons.push({
    title: `Open in the ${app} Store`,
    icon: Icons.bulb,
    onPress: () => openURL(storeUrl),
  });

  buttons.push({
    title: 'Send Bug Report',
    icon: Icons.activity,
    onPress: () =>
      prompt(
        'Bug Report',
        'Did you hit a bug? Sorry about that! Thank you for taking a moment to help us out.\n\n' +
          'If you would like a response, please include your email address.',
        {
          placeholder: 'I tried X and then Y happened...',
          multiline: true,
          okButton: 'send',
        }
      ).then(([value, cancelled]) => !cancelled && sendBugReport(value)),
  });

  buttons.push({
    title: 'Visit @' + TWITTER_PROFILE,
    icon: Icons.twitter,
    onPress: openTwitter,
  });

  return <FeedbackContainer buttons={buttons} />;
};

export default FeedbackScreen;
