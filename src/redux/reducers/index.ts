/* eslint-disable filenames/match-exported */
import { combineReducers } from 'redux';
import profiles from './ProfileReducer';
import settings from './SettingsReducer';

const rootReducer = combineReducers({
  profiles,
  settings,
});

export default rootReducer;
