import { Layout } from '../../components/base';
import { Icons, PostFeedType } from '../../utils';
import PostCollectionContainer from '../post/PostCollectionContainer';

type Props = {
  onGoToExplore: VoidFunction;
};

const FollowingContainer = ({ onGoToExplore }: Props) => {
  return (
    <Layout flex l2>
      <PostCollectionContainer
        type={PostFeedType.FOLLOWING}
        emptyStateProps={{
          description: "You aren't following any upcoming events",
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

export default FollowingContainer;
