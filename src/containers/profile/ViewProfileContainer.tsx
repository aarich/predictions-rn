import { useCallback, useEffect, useState } from 'react';
import { usePosts } from '../../api/queries';
import { LoadingWrapper } from '../../components/base';
import ViewProfile from '../../components/profile/ViewProfile';
import { getProfile } from '../../redux/actions/thunk';
import { useProfile } from '../../redux/selectors';
import { useAppDispatch } from '../../redux/store';
import { PostFeedType } from '../../utils';
import { useImage } from '../../utils/hooks';

type Props = {
  id: string;
  onNavigateToPost: (id: number) => void;
};

const ViewProfileContainer = ({ id, onNavigateToPost }: Props) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useAppDispatch();
  const profile = useProfile(id);
  const avatarURI = useImage(true, 'avatars', profile?.avatar_url);

  const {
    data: posts,
    atEnd: atEndOfPosts,
    onLoadMore: onLoadMorePosts,
    loading: loadingPosts,
    onRefresh: onRefreshPosts,
  } = usePosts(PostFeedType.NEWEST, { profileId: id });

  const refreshProfile = useCallback(
    () => dispatch(getProfile(id)),
    [dispatch, id]
  );

  useEffect(() => {
    if (profile) {
      setLoading(false);
    } else {
      refreshProfile();
    }
  }, [profile, refreshProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshProfile().finally(() => setRefreshing(false));
    onRefreshPosts();
  }, [onRefreshPosts, refreshProfile]);

  return (
    <LoadingWrapper loading={loading} flex>
      {profile ? (
        <ViewProfile
          profile={profile}
          avatarSource={{ uri: avatarURI }}
          refreshing={refreshing || loadingPosts}
          onRefresh={onRefresh}
          posts={posts}
          atEnd={atEndOfPosts}
          onLoadMore={onLoadMorePosts}
          onNavigateToPost={onNavigateToPost}
        />
      ) : null}
    </LoadingWrapper>
  );
};

export default ViewProfileContainer;
