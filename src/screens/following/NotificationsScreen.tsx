import { useEffect } from 'react';
import { useClearNotifications } from '../../api/mutations/postMutations';
import { usePosts } from '../../api/queries';
import { HeaderButton } from '../../components/base';
import NotificationsContainer from '../../containers/following/NotificationsContainer';
import {
  alert,
  IconsOutlined,
  PostFeedType,
  RootTabScreenProps,
} from '../../utils';

type Props = RootTabScreenProps<'NotificationsTab'>;

const NotificationsScreen = ({ navigation }: Props) => {
  const clearAllPastNotifications = useClearNotifications();
  const hasNotifications = usePosts(PostFeedType.NOTIFIED).data.length > 0;
  useEffect(() => {
    navigation.setOptions({
      title: 'Notifications',
      headerRight: hasNotifications
        ? () => (
            <HeaderButton
              icon={IconsOutlined.slash}
              onPress={() =>
                alert('Clear notifications', 'Are you sure?', [
                  {
                    text: 'Delete all',
                    onPress: () => clearAllPastNotifications.mutate(),
                    style: 'destructive',
                  },
                ])
              }
            />
          )
        : undefined,
    });
  });
  return (
    <NotificationsContainer
      onGoToExplore={() => navigation.navigate('HomeTab')}
    />
  );
};

export default NotificationsScreen;
