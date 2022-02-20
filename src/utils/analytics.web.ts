import { Browser as SentryBrowser } from 'sentry-expo';

const Browser = SentryBrowser || {};

export const addBreadcrumb = Browser.addBreadcrumb;
export const captureException = Browser.captureException;
export const setSentryUser = Browser.setUser;
export const captureMessage = Browser.captureMessage;
export const Severity = Browser.Severity;
