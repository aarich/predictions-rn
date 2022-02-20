import { useCallback, useEffect } from 'react';
import { HeaderButton } from '../../components/base';
import ViewProfileContainer from '../../containers/profile/ViewProfileContainer';
import {
  alert,
  IconsOutlined,
  RootStackScreenProps,
  sendReport,
  share,
} from '../../utils';

type Props = RootStackScreenProps<'ViewProfile'>;

const ViewProfileScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;

  useEffect(() => {
    const moreAction = () => {
      alert(' Actions', undefined, [
        { text: 'Share', onPress: () => share('profile', id) },
        {
          text: 'Report this profile',
          onPress: () => sendReport('Report User', { idOfUser: id }),
          style: 'destructive',
        },
      ]);
    };

    navigation.setOptions({
      headerRight: () => (
        <HeaderButton icon={IconsOutlined.moreH} onPress={moreAction} />
      ),
    });
  }, [id, navigation]);

  const onNavigateToPost = useCallback(
    (postId: number) => navigation.push('ViewPost', { id: postId }),
    [navigation]
  );

  return <ViewProfileContainer id={id} onNavigateToPost={onNavigateToPost} />;
};

export default ViewProfileScreen;
