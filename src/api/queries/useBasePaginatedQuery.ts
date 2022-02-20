import { useCallback, useEffect, useState } from 'react';
import {
  QueryFunction,
  QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from 'react-query';
import { handleError } from '../../utils';
import { PAGE_SIZE } from '../commonApi';

export type PaginationInfo<T> = {
  data: T[];
  atEnd: boolean;
  loading: boolean;
  dataUpdatedAt: number;
  onRefresh: VoidFunction;
  onLoadMore: VoidFunction;
};

export default <T>(
  queryFn: QueryFunction<T[]>,
  queryKey: QueryKey,
  cacheTime?: number
): PaginationInfo<T> => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [resultList, setResultList] = useState<T[]>([]);

  const {
    data,
    error,
    fetchNextPage: onLoadMore,
    hasNextPage,
    status,
    dataUpdatedAt,
  } = useInfiniteQuery<T[], Error, T[]>({
    queryKey,
    queryFn,
    keepPreviousData: true,
    getNextPageParam: (prevPage, pages) =>
      prevPage.length === PAGE_SIZE ? pages.length : undefined,
    cacheTime,
  });

  useEffect(() => {
    setLoading(status === 'loading');
    if (error) {
      handleError(error);
    }
  }, [error, status]);

  useEffect(() => {
    if (data) {
      setResultList(data.pages.flat(1));
    }
  }, [data]);

  const onRefresh = useCallback(() => {
    queryClient.resetQueries(queryKey);
  }, [queryClient, queryKey]);

  return {
    data: resultList,
    atEnd: !hasNextPage,
    loading,
    dataUpdatedAt,
    onRefresh,
    onLoadMore,
  };
};
