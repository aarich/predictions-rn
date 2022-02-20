import { useMutation, useQueryClient } from 'react-query';
import { PostFeedType, toast, UpdatePostDraft } from '../../utils';
import { makePostsQueryKey } from '../commonApi';
import { clearAllPastNotifications } from '../database/follow';
import { createPost, deletePost, updatePost } from '../database/post';
import { usePosts } from '../queries';
import {
  deletePostFromAllQueryData,
  updateAllPostQueryData,
} from './updateHelpers';

export const useClearNotifications = () => {
  const queryClient = useQueryClient();
  const posts = usePosts(PostFeedType.NOTIFIED).data;
  return useMutation(() => clearAllPastNotifications('post', posts), {
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries(makePostsQueryKey(PostFeedType.NOTIFIED));
        data.forEach((post) => updateAllPostQueryData(post, queryClient));
      }
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePost, {
    onSuccess: (_, post) => {
      deletePostFromAllQueryData(post.id, queryClient);
      toast('Deleted');
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation(createPost, {
    onSuccess: () =>
      queryClient.resetQueries(makePostsQueryKey(PostFeedType.NEWEST)),
  });
};

export const useUpdatePost = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation((post: UpdatePostDraft) => updatePost(post, id), {
    onSuccess: (post) => updateAllPostQueryData(post, queryClient),
  });
};
