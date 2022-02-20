import { AnyAction } from 'redux';
import { Profile } from '../../utils';
import { addProfiles, resetCache } from '../actions';

type ProfilesState = { [id: string]: Profile };

const initialState: ProfilesState = {};

const ProfileReducer = (
  state = initialState,
  action: AnyAction
): ProfilesState => {
  if (addProfiles.match(action)) {
    return action.payload.reduce((s, p) => ({ ...s, [p.id]: p }), state);
  } else if (resetCache.match(action)) {
    return initialState;
  }

  return state;
};

export default ProfileReducer;
