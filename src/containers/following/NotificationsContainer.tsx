import { Layout } from '../../components/base';
import { Icons, PostFeedType } from '../../utils';
import PostCollectionContainer from '../post/PostCollectionContainer';

type Props = {
  onGoToExplore: VoidFunction;
};

const NotificationsContainer = ({ onGoToExplore }: Props) => {
  return (
    <Layout flex l2>
      <PostCollectionContainer
        type={PostFeedType.NOTIFIED}
        emptyStateProps={{
          title: 'No Notifications',
          description: 'Get notified of posts past their check-in date',
          actions: [
            {
              icon: Icons.trendingUp,
              onPress: onGoToExplore,
              label: 'Start Exploring',
            },
          ],
        }}
      />
    </Layout>
  );
};

export default NotificationsContainer;
