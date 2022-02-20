import { Layout, Tab, TabView } from '@ui-kitten/components';
import { useReducer, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCollectionContainer from '../../containers/post/PostCollectionContainer';
import { Icons, PostFeedType } from '../../utils';
import { useBackgroundColor } from '../../utils/hooks';
import { Icon } from '../base';

export default () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const paddingTop = useSafeAreaInsets().top;
  const [loaded, setLoaded] = useReducer(
    (s: Record<number, boolean>, i: number) => ({ ...s, [i]: true }),
    {}
  );

  const backgroundColor = useBackgroundColor(2);

  return (
    <Layout style={[styles.container, { paddingTop }]}>
      <TabView
        style={[styles.tabView, { backgroundColor }]}
        selectedIndex={selectedIndex}
        onSelect={(index) => {
          if (isNaN(index)) {
            return;
          }
          setSelectedIndex(index);
          setLoaded(index);
        }}
        shouldLoadComponent={(i) => loaded[i] || selectedIndex === i}
        swipeEnabled={false}
      >
        <Tab icon={(props) => <Icon {...props} name={Icons.trendingUp} />}>
          <PostCollectionContainer type={PostFeedType.TRENDING} />
        </Tab>
        <Tab title="Newest">
          <PostCollectionContainer type={PostFeedType.NEWEST} />
        </Tab>
        <Tab title="Personal">
          <PostCollectionContainer
            type={PostFeedType.PERSONAL}
            emptyStateProps={{
              description: "You haven't created any personal posts yet",
            }}
          />
        </Tab>
      </TabView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabView: { flex: 1 },
});
