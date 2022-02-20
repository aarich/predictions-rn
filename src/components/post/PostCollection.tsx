import { ComponentPropsWithoutRef, forwardRef, Ref } from 'react';
import { Animated, FlatList, FlatListProps, StyleSheet } from 'react-native';
import {
  CollapsibleSubHeaderAnimator,
  useCollapsibleSubHeader,
} from 'react-navigation-collapsible';
import PostCollectionCardContainer from '../../containers/post/PostCollectionCardContainer';
import { Post, PostSearchInfo } from '../../utils';
import { EmptyState, Text } from '../base';
import PostSearchBar from './PostSearchBar';
type Props = {
  posts: Post[];
  atEnd: boolean;
  refreshing: boolean;
  onLoadMore: VoidFunction;
  onNavigateToPost: (id: number) => void;
  emptystateProps?: ComponentPropsWithoutRef<typeof EmptyState>;
  onSearch?: (query: PostSearchInfo) => void;
} & Omit<
  FlatListProps<Post>,
  | 'onScroll'
  | 'scrollIndicatorInsets'
  | 'data'
  | 'renderItem'
  | 'keyExtractor'
  | 'onEndReached'
  | 'contentContainerStyle'
  | 'ListFooterComponent'
  | 'ListEmptyComponent'
>;

const PostCollection = forwardRef(
  (
    {
      posts,
      refreshing,
      atEnd,
      onLoadMore,
      onNavigateToPost,
      onSearch,
      emptystateProps,

      ...flatListProps
    }: Props,
    ref?: Ref<FlatList>
  ) => {
    const showAtEndMessage = atEnd && posts && posts.length !== 0;
    const {
      onScroll,
      containerPaddingTop,
      scrollIndicatorInsetTop,
      translateY,
    } = useCollapsibleSubHeader();

    const paddingTop = onSearch ? containerPaddingTop : undefined;
    return (
      <>
        <Animated.FlatList
          ref={ref}
          onScroll={onSearch ? onScroll : undefined}
          scrollIndicatorInsets={
            onSearch ? { top: scrollIndicatorInsetTop } : undefined
          }
          data={posts}
          renderItem={({ item: post }) => (
            <PostCollectionCardContainer
              post={post}
              onNavigateToPost={onNavigateToPost}
            />
          )}
          refreshing={refreshing}
          keyExtractor={(item) => `${item.id}`}
          onEndReached={atEnd ? undefined : onLoadMore}
          contentContainerStyle={
            !refreshing && posts.length === 0 ? styles.empty : { paddingTop }
          }
          ListFooterComponent={
            showAtEndMessage ? (
              <Text italic center>
                That&apos;s all for now
              </Text>
            ) : undefined
          }
          ListEmptyComponent={
            emptystateProps && !refreshing ? (
              <EmptyState {...emptystateProps} />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
          {...flatListProps}
        />
        {onSearch ? (
          <CollapsibleSubHeaderAnimator translateY={translateY}>
            <PostSearchBar onSubmit={onSearch} loading={refreshing} />
          </CollapsibleSubHeaderAnimator>
        ) : null}
      </>
    );
  }
);

export default PostCollection;

const styles = StyleSheet.create({ empty: { flex: 1 } });
