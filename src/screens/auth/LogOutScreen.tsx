import LogOutContainer from '../../containers/auth/LogOutContainer';
import { RootStackScreenProps } from '../../utils';

type Props = RootStackScreenProps<'LogOut'>;

const LogOutScreen = ({ navigation }: Props) => {
  return <LogOutContainer onLogOutSuccess={() => navigation.popToTop()} />;
};

export default LogOutScreen;
