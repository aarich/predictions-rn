import { useMutation, useQueryClient } from 'react-query';
import { CommentParentType, Post, Prediction, toast } from '../../utils';
import { makeCommentQueryKey } from '../commonApi';
import {
  createComment,
  CreateCommentVariables,
  deleteComment,
} from '../database/comment';
import {
  deleteCommentFromAllQueryData,
  updateAllPostQueryData,
  updateAllPredictionQueryData,
} from './updateHelpers';

export const useNewCommentMutation = (parent?: Post | Prediction) => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ comment, parentId, parentType }: CreateCommentVariables) =>
      createComment({ comment, parentId, parentType }),
    {
      onSuccess: (_, { parentId, parentType }) => {
        queryClient.invalidateQueries(
          makeCommentQueryKey(parentId, parentType)
        );
        if (parent) {
          parent.num_comments += 1;
          if ('check_date' in parent) {
            // post
            updateAllPostQueryData(parent, queryClient);
          } else if ('post_id' in parent) {
            // prediction
            updateAllPredictionQueryData(parent, queryClient);
          }
        }
        toast('Submitted!');
      },
    }
  );
};

export const useDeleteCommentMutation = (
  parentId: number,
  parentType: CommentParentType
) => {
  const queryClient = useQueryClient();
  return useMutation((id: number) => deleteComment({ id }), {
    onSuccess: (_, id) => {
      deleteCommentFromAllQueryData(parentType, parentId, id, queryClient);
      toast('Deleted');
    },
  });
};
