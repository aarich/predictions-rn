import { useMutation, useQueryClient } from 'react-query';
import { Comment, Post, Prediction } from '../../utils';
import { toggleLike } from '../database/like';
import {
  updateAllCommentQueryData,
  updateAllPostQueryData,
  updateAllPredictionQueryData,
} from './updateHelpers';

export const useToggleLike = <T extends Post | Comment | Prediction>(
  type: 'post' | 'prediction' | 'comment'
) => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ didPressUp, entity }: { didPressUp: boolean; entity: T }) =>
      toggleLike(didPressUp, type, entity),
    {
      onSuccess: (updatedEntity) => {
        if ('check_date' in updatedEntity) {
          updateAllPostQueryData(updatedEntity, queryClient);
        } else if ('post_id' in updatedEntity) {
          updateAllPredictionQueryData(updatedEntity, queryClient);
        } else if ('comment' in updatedEntity) {
          updateAllCommentQueryData(updatedEntity, queryClient);
        }
      },
    }
  );
};
