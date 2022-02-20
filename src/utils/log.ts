import { Breadcrumb } from '@sentry/react-native';
import { addBreadcrumb, Severity } from './analytics';

export const log = (
  message: string | Error | Breadcrumb,
  data?: Record<string, unknown>,
  category = 'log'
) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    data ? console.log(message, data) : console.log(message);
  } else {
    const breadcrumb: Breadcrumb =
      typeof message === 'string'
        ? { category, message, level: Severity.Info, data }
        : message;
    addBreadcrumb(breadcrumb);
  }
};
