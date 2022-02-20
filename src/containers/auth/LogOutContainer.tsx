import LogOut from '../../components/auth/LogOut';
import { updateProfile } from '../../redux/actions/thunk';
import { useAppDispatch } from '../../redux/store';
import { handleError, supabase } from '../../utils';
import { useCurrentUser } from '../../utils/hooks';

type Props = { onLogOutSuccess: VoidFunction };

const LogOutContainer = ({ onLogOutSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const user = useCurrentUser();

  const logOut = async () => {
    if (user?.push_token_set) {
      dispatch(updateProfile(user.id, { expo_push_token: null }));
    }
    const { error } = await supabase.auth.signOut();
    if (!error) {
      onLogOutSuccess();
    } else {
      handleError(error);
    }
  };

  return <LogOut onLogOut={logOut} />;
};

export default LogOutContainer;
