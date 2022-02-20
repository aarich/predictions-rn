import { Layout } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import PostCollectionContainer from '../../containers/post/PostCollectionContainer';
import { PostFeedType } from '../../utils';

const GuestHomeScreen = () => {
  return (
    <Layout level="2" style={styles.flex}>
      <PostCollectionContainer type={PostFeedType.TRENDING} />
    </Layout>
  );
};

export default GuestHomeScreen;

const styles = StyleSheet.create({ flex: { flex: 1 } });
