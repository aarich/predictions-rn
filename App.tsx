import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { CustomSchemaType } from '@eva-design/dss';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from 'sentry-expo';
import theme from './assets/theme.json';
import mapping from './src/components/base/mapping.json';
import Navigation from './src/navigation';
import { persistor, store } from './src/redux/store';
import {
  captureException,
  handleError,
  initNotifications,
  log,
} from './src/utils';
import { useIsDark } from './src/utils/hooks';
import AlertProvider from './src/utils/providers/AlertProvider';
import PromptProvider from './src/utils/providers/PromptProvider';
import ToastProvider from './src/utils/providers/ToastProvider';
import UnsplashSearchProvider from './src/utils/providers/UnsplashSearchProvider';

// @ts-expect-error partial mappings allowed
const customMapping = mapping as CustomSchemaType;

initNotifications();

Sentry.init({
  dsn: 'https://9e3fb083e55743ccb33925d4396748c5@o583200.ingest.sentry.io/6179348',
  enableInExpoDevelopment: false,
  debug: __DEV__,
  normalizeDepth: 5,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, cacheTime: 20 * 60 * 1000 },
    mutations: { onError: (error) => handleError(error) },
  },
});

setLogger({
  log,
  warn: captureException,
  error: captureException,
});

export default function App() {
  const isDark = useIsDark();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <IconRegistry icons={EvaIconsPack} />
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <ApplicationProvider
            {...eva}
            theme={{ ...(isDark ? eva.dark : eva.light), ...theme }}
            customMapping={customMapping}
          >
            <SafeAreaProvider>
              <AlertProvider>
                <PromptProvider>
                  <ToastProvider>
                    <UnsplashSearchProvider>
                      <Navigation />
                    </UnsplashSearchProvider>
                  </ToastProvider>
                </PromptProvider>
              </AlertProvider>
            </SafeAreaProvider>
          </ApplicationProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
