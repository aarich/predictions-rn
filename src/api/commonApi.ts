import { QueryKey } from 'react-query';
import { CommentParentType, PostFeedType, PostSearchInfo } from '../utils';

export const PAGE_SIZE = 30;

export const makeCommentQueryKey = (
  parentId: number,
  parentType: CommentParentType
): QueryKey => ['comments', parentId, parentType];

export const makePredictionsQueryKey = (
  postId: number,
  special = false
): QueryKey =>
  special ? [`predictions`, postId, special] : ['predictions', postId];

export const makePostsQueryKey = (
  type?: PostFeedType,
  search?: PostSearchInfo
): QueryKey => {
  const key = 'posts';
  if (search) return [key, type, search];
  if (type) return [key, type];
  return [key];
};

export const makePostQueryKey = (id: number): QueryKey => [`post`, id];

export const makeUnsplashQueryKey = (query: string): QueryKey => [
  'unsplash_search',
  query,
];

export const makeUnsplashPhotoKey = (id?: string): QueryKey => [
  'unsplash_photo',
  id,
];
