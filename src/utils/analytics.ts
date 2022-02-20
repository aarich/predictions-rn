import { Native as SentryNative } from 'sentry-expo';

const Native = SentryNative || {};

export const addBreadcrumb = Native.addBreadcrumb;
export const captureException = Native.captureException;
export const setSentryUser = Native.setUser;
export const captureMessage = Native.captureMessage;
export const Severity = Native.Severity;
