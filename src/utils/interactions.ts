import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvaStatus } from '@ui-kitten/components/devsupport';
import { setString } from 'expo-clipboard';
import { AlertButton, Platform, Share } from 'react-native';
import LinkingConfiguration from '../navigation/LinkingConfiguration';
import { captureException, captureMessage } from './analytics';
import { MyConstants } from './constants';
import { log } from './log';
import { RootStackParamList } from './types';

type PromptFn = (
  title: string,
  description?: string,
  settings?: {
    placeholder?: string;
    multiline?: boolean;
    initialValue?: string;
    okButton?: string;
    secureTextEntry?: boolean;
    maxLength?: number;
  }
) => Promise<[value: string, cancelled: boolean]>;

type AlertFn = (
  title: string,
  message?: string,
  options?: AlertButton[],
  cancelTitle?: string
) => void;

type ToastFn = (message: string, status?: EvaStatus, timeout?: number) => void;

type UnsplashSearchFn = () => Promise<string | undefined>;

export const promptFnRef: { current: PromptFn } = {
  current: () => Promise.resolve(['', true]),
};

export const alertFnRef: { current: AlertFn } = { current: () => null };

export const toastFnRef: { current: ToastFn } = { current: () => null };

export const unsplashFnRef: { current: UnsplashSearchFn } = {
  current: () => Promise.resolve(undefined),
};

/**
 * Send an alert
 *
 * @example alert('Alert!', 'Something went wrong')
 */
export const alert: AlertFn = (title, message, options, cancelTitle) =>
  alertFnRef.current(title, message, options, cancelTitle);

/**
 * Send a prompt
 *
 * @example
 * prompt('Alert!', 'Something went wrong', settings)
 *   .then(([value, cancelled]) => log({value, cancelled}));
 */
export const prompt: PromptFn = (title, description, settings) =>
  promptFnRef.current(title, description, settings);

/**
 * show a toast
 *
 * @default status 'success'
 *
 * @example toast('Successfully deleted', 'info')
 */
export const toast: ToastFn = (message, status, timeout = 3000) =>
  toastFnRef.current(message, status, timeout);

export const getUnsplashPhoto: UnsplashSearchFn = () => unsplashFnRef.current();

export const sendReport = (
  title: string,
  metadata: Record<string, unknown>
) => {
  prompt(title, undefined, {
    placeholder: "What's happening?",
    multiline: true,
    okButton: 'Send',
  }).then(
    ([message, cancelled]) =>
      !cancelled &&
      captureMessage(`Report from user`, { extra: { ...metadata, message } })
  );
};

export const share = async (
  type: 'profile' | 'post',
  id: string | number,
  message?: string
) => {
  let path = '';
  const { ViewPost, ViewProfile } = LinkingConfiguration.config?.screens || {};
  switch (type) {
    case 'post':
      // @ts-ignore
      path = ViewPost?.path.replace(':id', `${id}`) || '';
      break;
    case 'profile':
      // @ts-ignore
      path = ViewProfile?.toString().replace(':id', `${id}`) || '';
  }

  if (!path) {
    handleError('Something went wrong');
  }

  const url = MyConstants.baseUrl + path;

  if (Platform.OS !== 'web') {
    const content = Platform.select({
      ios: { url, message },
      default: { message: url },
    });
    log('sharing url', { url });
    Share.share(content, { dialogTitle: message });
  } else {
    alert('Copy to clipboard?', url, [
      {
        text: 'Copy',
        onPress: () => {
          setString(url);
          toast('Copied!');
        },
      },
    ]);
  }
};

export const navigateToUser = (
  id: string,
  navigation: NativeStackNavigationProp<RootStackParamList, never>
) => navigation.push('ViewProfile', { id });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasMessage = (error: any): error is { message: string } =>
  error && 'message' in error;

export const handleUserError = (error?: string) => {
  handleError(new UserError(error), false);
};

export const handleError = (error: unknown, sendToSentry = true) => {
  let message = 'An unknown error happened. Please try again later';

  if (error) {
    if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && hasMessage(error)) {
      message = error.message;
    }
  }

  const isUserError = error instanceof UserError;

  if (sendToSentry && !isUserError) {
    log('error', { error }, 'error');
    captureException(error);
  } else {
    log({ message: `Error not sent.`, data: { error } });
  }

  alert('Error', message);
};

export class UserError extends Error {
  isUserError = true;
}

export class NotLoggedInError extends UserError {
  constructor() {
    super('You must be logged in to do that');
  }
}
