import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import EditProfile from '../../components/profile/EditProfile';
import { getProfile, updateProfile } from '../../redux/actions/thunk';
import { useProfile } from '../../redux/selectors';
import { useAppDispatch } from '../../redux/store';
import {
  deleteCachedImage,
  getResizedImage,
  handleError,
  handleUserError,
  log,
  MutableProfile,
  supabase,
  toast,
  uploadImage,
} from '../../utils';
import { useImage } from '../../utils/hooks';

const EditProfileContainer = () => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const user = supabase.auth.user();
  const profile = useProfile(user?.id);
  const [draft, setDraft] = useState<MutableProfile>({
    bio: '',
    username: '',
    website: '',
  });
  const [isDirty, setDirty] = useState(false);
  const avatarURI = useImage(true, 'avatars', draft.avatar_url);

  useEffect(() => {
    if (profile) {
      setDraft({
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        username: profile.username,
        website: profile.website,
      });
      setLoading(false);
    } else {
      dispatch(getProfile(user?.id));
    }
  }, [dispatch, profile, user?.id]);

  const save = useCallback(
    (fieldsToUpdate?: Partial<MutableProfile>) => {
      if (!user?.id || !fieldsToUpdate) {
        log('User not set!', { user, fieldsToUpdate });
        return;
      }

      if (
        typeof fieldsToUpdate.username === 'string' &&
        fieldsToUpdate.username.trim().length < 3
      ) {
        handleUserError('Username is too short!');
        return;
      }

      setLoading(true);
      dispatch(updateProfile(user.id, fieldsToUpdate))
        .then(() => toast('Saved!', 'success'))
        .catch(handleError)
        .finally(() => setLoading(false))
        .then(() => setDirty(false));
    },
    [dispatch, user]
  );

  const uploadAvatar = useCallback(
    async (image: { base64?: string; uri: string }) => {
      try {
        const avatarToDelete: string[] = [];
        if (profile?.avatar_url) {
          avatarToDelete.push(profile.avatar_url);
        }
        if (draft.avatar_url && !avatarToDelete.includes(draft.avatar_url)) {
          avatarToDelete.push(draft.avatar_url);
        }

        setLoading(true);
        const { uri, base64 } = image;
        const fileExt = uri.split('.').pop();
        const fileName = `${uuidV4()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        if (!base64) {
          throw new Error('Missing base64 image data');
        }

        log('uploading image');

        const { error } = await uploadImage(uri, base64, 'avatars', filePath);

        if (error) {
          throw error;
        }

        setLoading(false);
        save({ avatar_url: filePath });
        if (avatarToDelete.length > 0) {
          Promise.all(
            avatarToDelete.map((avatar) =>
              deleteCachedImage(true, 'avatars', avatar)
            )
          );
          log(`deleting ${avatarToDelete.length} old avatars`);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove(avatarToDelete);
          if (deleteError) {
            throw deleteError;
          }
        }
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    },
    [draft.avatar_url, save, user?.id, profile?.avatar_url]
  );

  const selectAvatar = useCallback(() => {
    getResizedImage(undefined, false).then(
      (image) => image && typeof image != 'string' && uploadAvatar(image)
    );
  }, [uploadAvatar]);

  return (
    <EditProfile
      loading={loading || !user}
      setDraft={(updates) => {
        setDraft((old) => (old ? { ...old, ...updates } : updates));
        setDirty(true);
      }}
      isDirty={isDirty}
      draft={draft}
      onSave={save}
      user={user}
      onSelectAvatar={selectAvatar}
      avatarSource={{ uri: avatarURI }}
    />
  );
};

export default EditProfileContainer;
