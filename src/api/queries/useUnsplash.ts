import { useMemo } from 'react';
import { isUnsplashDbValue, UnsplashPhotoApiSuccess } from '../../utils';
import { makeUnsplashPhotoKey, makeUnsplashQueryKey } from '../commonApi';
import { getUnsplashPhotoInfo, queryUnsplash } from '../database/unsplash';
import { BaseGetterReturn, useBaseGetter } from './useBaseGetter';
import usePaginatedQuery, { PaginationInfo } from './useBasePaginatedQuery';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 100;

export const useUnsplashSearch = (
  query: string
): PaginationInfo<UnsplashPhotoApiSuccess> => {
  const queryKey = useMemo(() => makeUnsplashQueryKey(query), [query]);
  const queryFn = ({ pageParam = 0 }) => queryUnsplash(pageParam, query);
  return usePaginatedQuery(queryFn, queryKey, ONE_WEEK_MS);
};

export const useUnsplashPhotoInfo = (
  id?: string
): BaseGetterReturn<UnsplashPhotoApiSuccess | void> => {
  const idToUse = isUnsplashDbValue(id) ? id : undefined;
  const queryKey = useMemo(() => makeUnsplashPhotoKey(idToUse), [idToUse]);
  const queryFn = () => getUnsplashPhotoInfo(idToUse);
  return useBaseGetter(
    queryKey,
    queryFn,
    undefined,
    undefined,
    undefined,
    ONE_WEEK_MS
  );
};
