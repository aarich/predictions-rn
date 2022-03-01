// eslint-disable-next-line no-restricted-imports
import Constants from 'expo-constants';

const myVersion = '40';

const IS_SCREENSHOTTING = false;

export const MyConstants = {
  isScreenshotting: __DEV__ && IS_SCREENSHOTTING,
  version: `${Constants.manifest?.version} (${myVersion})`,
  appStoreUrl:
    'https://apps.apple.com/app/apple-store/id1608077436?pt=117925864&ct=aj&mt=8',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=rich.alex.predictions',
  baseUrl: 'https://whattl.mrarich.com',
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY as string,
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  ...Constants,
};
