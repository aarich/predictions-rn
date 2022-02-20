import { useMutation, useQueryClient } from 'react-query';
import { makePredictionsQueryKey } from '../commonApi';
import { createPrediction, deletePrediction } from '../database/prediction';
import { deletePredictionFromAllQueryData } from './updateHelpers';

export const useDeletePrediction = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePrediction, {
    onSuccess: (_, prediction) => {
      deletePredictionFromAllQueryData(
        prediction.post_id,
        prediction.id,
        queryClient
      );
    },
  });
};

export const useCreatePrediction = () => {
  const queryClient = useQueryClient();
  return useMutation(createPrediction, {
    onSuccess: (prediction) => {
      queryClient.resetQueries(makePredictionsQueryKey(prediction.post_id));
    },
  });
};
