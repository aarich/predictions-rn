import FollowingContainer from '../../containers/following/FollowingContainer';
import { RootTabScreenProps } from '../../utils';
type Props = RootTabScreenProps<'FollowingTab'>;

const FollowingScreen = ({ navigation }: Props) => (
  <FollowingContainer onGoToExplore={() => navigation.navigate('HomeTab')} />
);

export default FollowingScreen;
