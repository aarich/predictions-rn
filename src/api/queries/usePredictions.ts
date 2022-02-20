import { useMemo } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { Prediction } from '../../utils';
import { makePredictionsQueryKey } from '../commonApi';
import { getPredictions, getSpecialPredictions } from '../database/prediction';
import usePaginatedQuery, { PaginationInfo } from './useBasePaginatedQuery';

const useSpecialPredictions = (
  postId: number
): UseQueryResult<Prediction[], Error> => {
  const queryKey = makePredictionsQueryKey(postId, true);
  const queryFn = () => getSpecialPredictions(postId);
  return useQuery({ queryKey, queryFn });
};

export const usePredictions = (postId: number): PaginationInfo<Prediction> => {
  const queryKey = useMemo(() => makePredictionsQueryKey(postId), [postId]);
  const queryFn = ({ pageParam = 0 }) => getPredictions(postId, pageParam);

  const specialPredictions = useSpecialPredictions(postId).data;
  const { data, ...paginatedData } = usePaginatedQuery(queryFn, queryKey);

  const allPredictions = useMemo(() => {
    const ret = [...data];
    (specialPredictions || []).forEach((p) => ret.unshift(p));
    return ret;
  }, [data, specialPredictions]);

  return { data: allPredictions, ...paginatedData };
};
