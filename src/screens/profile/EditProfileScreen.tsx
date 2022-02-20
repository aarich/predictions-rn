import { useCallback, useEffect } from 'react';
import { AlertButton } from 'react-native';
import { HeaderButton } from '../../components/base';
import EditProfileContainer from '../../containers/profile/EditProfileContainer';
import { deleteProfile, updateProfile } from '../../redux/actions/thunk';
import { useAppDispatch } from '../../redux/store';
import {
  alert,
  handleError,
  IconsOutlined,
  log,
  RootStackScreenProps,
  supabase,
  toast,
} from '../../utils';
import { useCurrentUser } from '../../utils/hooks';

type Props = RootStackScreenProps<'EditProfile'>;

const EditProfileScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();

  const profile = useCurrentUser();
  const onLogOut = useCallback(() => {
    if (profile?.push_token_set) {
      dispatch(updateProfile(profile.id, { expo_push_token: null }));
    }
    supabase.auth.signOut().finally(() => navigation.popToTop());
  }, [dispatch, navigation, profile?.id, profile?.push_token_set]);

  useEffect(() => {
    const deleteAccountAlert = () => {
      alert(
        'Are you sure?',
        "This action can't be undone. You can also log out for now, your data will be here when you come back. This is the final warning.",
        [
          {
            text: 'Log Out',
            onPress: onLogOut,
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              dispatch(deleteProfile())
                .then(() => navigation.popToTop())
                .then(() => toast('Account deleted', 'info'))
                .catch(handleError),
          },
        ]
      );
    };
    const avatarToDelete = profile?.avatar_url;

    const clearAvatar = () => {
      if (profile) {
        log('deleting avatar');
        if (!avatarToDelete) {
          return;
        }
        dispatch(updateProfile(profile.id, { avatar_url: '' }))
          .then(() => {
            log(`deleting old avatar from storage`);
            supabase.storage
              .from('avatars')
              .remove([avatarToDelete])
              .then(({ error }) => error && log('got error', { error }))
              .catch(handleError);
          })
          .catch(handleError);
      } else {
        handleError('User not found');
      }
    };

    const deleteAvatarAction: AlertButton = {
      text: 'Delete Profile Picture',
      onPress: clearAvatar,
      style: 'destructive',
    };

    const moreAction = () => {
      if (!profile) {
        handleError('Whoops, try that again please.');
        return;
      }
      alert('Account Actions', undefined, [
        { text: 'Log Out', onPress: onLogOut },
        {
          text: 'View Public Profile',
          onPress: () => navigation.push('ViewProfile', { id: profile.id }),
        },
        ...(avatarToDelete ? [deleteAvatarAction] : []),
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: deleteAccountAlert,
        },
      ]);
    };

    navigation.setOptions({
      headerRight: () => (
        <HeaderButton icon={IconsOutlined.moreH} onPress={moreAction} />
      ),
      headerBackTitle: 'Back',
    });
  }, [dispatch, navigation, onLogOut, profile, profile?.avatar_url]);

  return <EditProfileContainer />;
};

export default EditProfileScreen;
