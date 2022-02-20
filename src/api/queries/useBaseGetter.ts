import { useEffect, useState } from 'react';
import { QueryFunction, QueryKey, useQuery } from 'react-query';
import { handleError } from '../../utils';

export type BaseGetterReturn<T> = {
  data: T | undefined;
  loading: boolean;
  refetch: VoidFunction;
};

export const useBaseGetter = <T>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  initialData?: T,
  initialDataUpdatedAt?: number,
  onError?: (error: Error) => void,
  cacheTime?: number
): BaseGetterReturn<T> => {
  const [loading, setLoading] = useState(false);
  const { data, error, status, refetch } = useQuery<T, Error>({
    queryKey,
    queryFn,
    initialData,
    initialDataUpdatedAt,
    cacheTime,
  });

  useEffect(() => {
    setLoading(status === 'loading');
  }, [status]);

  useEffect(() => {
    if (error) {
      handleError(error);
      onError?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return { data, loading, refetch };
};
