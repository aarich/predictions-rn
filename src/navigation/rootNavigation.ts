import { createNavigationContainerRef } from '@react-navigation/native';
import { log } from '../utils/log';
import { RootStackParamList, RootTabParamList } from '../utils/types';

export const navigationRef = createNavigationContainerRef<
  RootStackParamList & RootTabParamList
>();

export const navigate = <R extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[R]
    ? [screen: R]
    : [screen: R, params: RootStackParamList[R]]
) => {
  if (navigationRef.isReady()) {
    log(`name: ${args[0]} params: ${JSON.stringify(args[1])}`);
    navigationRef.navigate(...args);
  } else {
    log("coudn't navigate.");
  }
};
