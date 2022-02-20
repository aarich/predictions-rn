import { useMemo } from 'react';
import { Comment, CommentParentType } from '../../utils';
import { makeCommentQueryKey } from '../commonApi';
import { getComments } from '../database/comment';
import usePaginatedQuery, { PaginationInfo } from './useBasePaginatedQuery';

export const useComments = (
  parentType: CommentParentType,
  parentId: number
): PaginationInfo<Comment> => {
  const queryKey = useMemo(
    () => makeCommentQueryKey(parentId, parentType),
    [parentId, parentType]
  );
  const queryFn = ({ pageParam = 0 }) =>
    getComments(parentType, parentId, pageParam);
  return usePaginatedQuery(queryFn, queryKey);
};
