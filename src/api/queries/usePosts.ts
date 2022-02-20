import { useMemo } from 'react';
import { InfiniteData, QueryClient, useQueryClient } from 'react-query';
import { Post, PostFeedType, PostSearchInfo } from '../../utils';
import { makePostQueryKey, makePostsQueryKey } from '../commonApi';
import { getPost, getPosts } from '../database/post';
import { BaseGetterReturn, useBaseGetter } from './useBaseGetter';
import usePaginatedQuery, { PaginationInfo } from './useBasePaginatedQuery';

const findPostAnywhere = (client: QueryClient, id: number) => {
  for (const [key, data] of client.getQueriesData<
    InfiniteData<Post[]> | undefined
  >(makePostsQueryKey())) {
    const found = data?.pages?.flat().find((p) => p.id === id);
    if (found) {
      return {
        initialData: found,
        initialDataUpdatedAt: client.getQueryState(key)?.dataUpdatedAt,
      };
    }
  }
};

export const usePosts = (
  type: PostFeedType,
  search?: PostSearchInfo
): PaginationInfo<Post> => {
  const queryKey = useMemo(
    () => makePostsQueryKey(type, search),
    [search, type]
  );
  const queryFn = ({ pageParam = 0 }) => getPosts(type, pageParam, search);
  return usePaginatedQuery(queryFn, queryKey);
};

export const usePost = (
  id: number,
  onError?: VoidFunction
): BaseGetterReturn<Post> => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => makePostQueryKey(id), [id]);
  const queryFn = () => getPost(id);
  const { initialData, initialDataUpdatedAt } =
    findPostAnywhere(queryClient, id) || {};

  return useBaseGetter(
    queryKey,
    queryFn,
    initialData,
    initialDataUpdatedAt,
    onError
  );
};
