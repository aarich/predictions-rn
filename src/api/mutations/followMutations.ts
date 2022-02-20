import { useMutation, useQueryClient } from 'react-query';
import { Post } from '../../utils';
import { toggleFollow } from '../database/follow';
import { updateAllPostQueryData } from './updateHelpers';

export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation((post: Post) => toggleFollow(post, 'post'), {
    onSuccess: (post) => updateAllPostQueryData(post, queryClient, true),
  });
};
