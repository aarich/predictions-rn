import { ComponentProps, useCallback, useState } from 'react';
import { usePosts } from '../../api/queries';
import { EmptyState } from '../../components/base';
import PostCollection from '../../components/post/PostCollection';
import { IconsOutlined, PostFeedType, PostSearchInfo } from '../../utils';
import { useStackNavigation } from '../../utils/hooks';

type Props = {
  type: PostFeedType;
  emptyStateProps?: Partial<ComponentProps<typeof EmptyState>>;
};

const PostCollectionContainer = ({ type, emptyStateProps = {} }: Props) => {
  const [searchInfo, setSearchInfo] = useState<PostSearchInfo>({ query: '' });
  const {
    data: posts,
    atEnd,
    onLoadMore,
    onRefresh,
    loading,
    dataUpdatedAt,
  } = usePosts(type, searchInfo);

  const navigation = useStackNavigation();
  const navigateToPost = useCallback(
    (id: number) => navigation.push('ViewPost', { id }),
    [navigation]
  );

  const getEmptyStateProps = () => {
    const {
      title = 'Nothing to see here',
      description,
      actions = [
        {
          icon: IconsOutlined.plusCircle,
          onPress: () => navigation.navigate('CreatePost'),
          label: 'Post Something',
        },
      ],
    } = emptyStateProps;
    return { title, description, actions };
  };

  return (
    <PostCollection
      posts={posts}
      atEnd={atEnd}
      onLoadMore={onLoadMore}
      refreshing={loading}
      onRefresh={onRefresh}
      onNavigateToPost={navigateToPost}
      emptystateProps={getEmptyStateProps()}
      onSearch={setSearchInfo}
      extraData={dataUpdatedAt}
    />
  );
};

export default PostCollectionContainer;
