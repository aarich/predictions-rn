import { produce } from 'immer';
import { AnyAction } from 'redux';
import { AppSetting, ValueOf } from '../../utils/types';
import { setAppSetting } from '../actions';

export type SettingsState = {
  [AppSetting.EXPO_NOTIFICATION_TOKEN]?: string;
};

const initialState: SettingsState = {};

const SettingsReducer = (
  state = initialState,
  action: AnyAction
): SettingsState =>
  produce(state, (draft) => {
    if (setAppSetting.match(action)) {
      Object.entries(action.payload).forEach(
        ([key, value]) =>
          (draft[key as keyof SettingsState] = value as ValueOf<SettingsState>)
      );
    }
  });

export default SettingsReducer;
