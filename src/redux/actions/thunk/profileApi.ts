import { addProfiles, resetCache, setAppSetting } from '..';
import {
  AppSetting,
  captureException,
  generateUsername,
  handleUserError,
  log,
  MutableProfile,
  Profile,
  registerNotifications,
  supabase,
} from '../../../utils';
import { AppThunk } from '../../store';

export const getProfiles =
  (ids: (string | undefined)[]): AppThunk<Profile[]> =>
  async (dispatch) => {
    log(`Querying Profile API with ids: ${ids}`);
    const { data } = await supabase
      .from<Profile>('profile_view')
      .select('*')
      .in(
        'id',
        ids.filter((i) => i)
      )
      .limit(ids.length)
      .throwOnError();

    log(`Found ${data?.length || 0} profiles`);

    if (!data) {
      return [];
    }

    dispatch(addProfiles(data));
    return data;
  };

export const getProfile =
  (id?: string): AppThunk<Profile | undefined> =>
  async (dispatch) =>
    dispatch(getProfiles([id])).then((profiles) =>
      profiles.length === 1 ? profiles[0] : undefined
    );

export const updateProfile =
  (
    id: string,
    fieldsToUpdate: Partial<MutableProfile>
  ): AppThunk<Profile | undefined> =>
  async (dispatch) => {
    const updates = { id, ...fieldsToUpdate };

    log('Updating profile', updates);

    try {
      await supabase
        .from('profile')
        .upsert(updates, {
          // Don't return the value after inserting
          returning: 'minimal',
        })
        .throwOnError();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        // @ts-ignore
        error.code === '23505'
      ) {
        handleUserError('This name has already been taken');
        return;
      } else {
        throw error;
      }
    }

    return dispatch(getProfile(id));
  };

export const setNewUserUsername =
  (id: string): AppThunk =>
  async (dispatch) => {
    const numAttempts = 40;
    let lastError = null;
    for (let i = 0; i < numAttempts; i++) {
      const username = generateUsername();
      try {
        await dispatch(updateProfile(id, { username }));
        return;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      captureException(lastError, { extra: { numAttempts } });
    }
  };

export const deleteProfile = (): AppThunk => async (dispatch, getState) => {
  log('Deleting profile');
  const id = supabase.auth.user()?.id;
  if (!id) {
    throw new Error('User not logged in');
  }
  const profile = getState().profiles[id];

  if (!profile) {
    throw new Error('User not found');
  }

  const { avatar_url } = profile;
  if (avatar_url) {
    log(`Deleting avatar url ${avatar_url}`);
    await supabase.storage.from('avatars').remove([avatar_url]);
  }

  const { data, error } = await supabase.storage.from('post').list(id + '/');
  if (error) {
    throw error;
  }

  if (data && data.length > 0) {
    log(`Deleting ${data.length} images from storage`);

    const { data: deleteResult, error: deleteError } = await supabase.storage
      .from('post')
      .remove(data.map((file) => `${id}/${file.name}`));
    if (deleteError) {
      throw deleteError;
    }
    log(`Deleted ${deleteResult?.length} files`);
    if (deleteResult?.length !== data.length) {
      throw new Error(
        "We weren't able to delete your data. Please contact us for assistance."
      );
    }
  }

  const { error: deleteUserError } = await supabase.rpc('delete_user');

  if (deleteUserError) {
    throw deleteUserError;
  }

  supabase.auth.signOut();
  dispatch(resetCache());
};

export const enableNotifications =
  (): AppThunk => async (dispatch, getState) => {
    const userId = supabase.auth.user()?.id;
    if (userId) {
      const profile = getState().profiles[userId];

      await registerNotifications().then((expo_push_token) => {
        if (expo_push_token) {
          dispatch(updateProfile(profile.id, { expo_push_token }));
          dispatch(
            setAppSetting({
              [AppSetting.EXPO_NOTIFICATION_TOKEN]: expo_push_token,
            })
          );
        }
      });
    }
  };
