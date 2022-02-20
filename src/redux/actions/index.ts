import { createAction } from '@reduxjs/toolkit';
import { Profile } from '../../utils';
import { SettingsState } from '../reducers/SettingsReducer';

// App
export const resetCache = createAction('App/RESET_CACHE');
export const setAppSetting =
  createAction<Partial<SettingsState>>('App/SET_SETTING');

// Profile
export const addProfiles = createAction<Profile[]>('Profiles/ADD');
