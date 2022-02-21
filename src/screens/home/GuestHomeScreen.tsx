import { Layout } from '../../components/base';
import PostCollectionContainer from '../../containers/post/PostCollectionContainer';
import { PostFeedType } from '../../utils';

const GuestHomeScreen = () => {
  return (
    <Layout l2 flex>
      <PostCollectionContainer type={PostFeedType.TRENDING} />
    </Layout>
  );
};

export default GuestHomeScreen;
