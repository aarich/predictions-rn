import { InfiniteData, QueryClient, QueryKey } from 'react-query';
import {
  BaseEntity,
  Comment,
  CommentParentType,
  getParentInfo,
  hasPassed,
  Post,
  PostFeedType,
  Prediction,
} from '../../utils';
import {
  makeCommentQueryKey,
  makePostQueryKey,
  makePostsQueryKey,
  makePredictionsQueryKey,
} from '../commonApi';

const deleteFromQueryState = <T extends BaseEntity>(
  client: QueryClient,
  key: QueryKey,
  id: number
) =>
  client.setQueriesData<InfiniteData<T[]> | T[] | undefined>(key, (old) => {
    if (!old) {
      return old;
    }

    if (Array.isArray(old)) {
      return old.filter((entity) => entity.id !== id);
    }

    return {
      ...old,
      pages: old?.pages?.map((page) => page.filter((ent) => ent.id !== id)),
    };
  });

const addToQueryState = <T extends BaseEntity>(
  client: QueryClient,
  key: QueryKey,
  entity: T
) =>
  client.setQueryData<InfiniteData<T[]> | T[] | undefined>(key, (data) => {
    if (!data) {
      return data;
    }
    if (Array.isArray(data)) {
      if (data.find((e) => e.id === entity.id)) {
        // already has it
        return data;
      }
      data.push(entity);
      return data;
    }

    const { pages, pageParams } = data;

    if (pageParams?.length === 0 && pages?.length === 0) {
      pageParams.push(0);
      pages.push([entity]);
    } else {
      if (pages.flat().find((e) => e.id === entity.id)) {
        // already exists
        return { pages, pageParams };
      }
      pages[pages.length - 1].push(entity);
    }

    return { pageParams, pages };
  });

const updateInQueryState = <T extends BaseEntity>(
  client: QueryClient,
  queryKey: QueryKey,
  entity: T
) => {
  client.setQueriesData<InfiniteData<T[]> | T[] | undefined>(
    queryKey,
    (data) => {
      if (!data) {
        return data;
      }

      const map = (old: T[]) =>
        old.map((oldEntity) =>
          oldEntity.id === entity.id ? entity : oldEntity
        );

      if (Array.isArray(data)) {
        return map(data);
      }

      return { ...data, pages: data.pages?.map(map) };
    }
  );
};

export const deleteCommentFromAllQueryData = (
  parentType: CommentParentType,
  parentId: number,
  id: number,
  client: QueryClient
) =>
  deleteFromQueryState(client, makeCommentQueryKey(parentId, parentType), id);

export const updateAllCommentQueryData = (
  comment: Comment,
  client: QueryClient
) => {
  const { parentId, parentType } = getParentInfo(comment);
  updateInQueryState(
    client,
    makeCommentQueryKey(parentId, parentType),
    comment
  );
};

export const deletePostFromAllQueryData = (id: number, client: QueryClient) => {
  deleteFromQueryState(client, makePostsQueryKey(), id);

  client.invalidateQueries(makePostQueryKey(id));
};

export const updateAllPostQueryData = (
  post: Post,
  client: QueryClient,
  didToggleFollow = false
) => {
  updateInQueryState(client, makePostsQueryKey(), post);

  if (didToggleFollow) {
    for (const type of [PostFeedType.FOLLOWING, PostFeedType.NOTIFIED]) {
      let shouldAdd = false;
      let shouldRemove = false;
      if (type === PostFeedType.FOLLOWING) {
        shouldRemove = hasPassed(post);
        shouldAdd = !shouldRemove;
      } else if (type === PostFeedType.NOTIFIED) {
        shouldAdd = hasPassed(post);
        shouldRemove = !shouldAdd;
      }

      const key = makePostsQueryKey(type);

      if (shouldAdd) {
        // make it's been added to the list
        addToQueryState(client, key, post);
      } else if (shouldRemove) {
        // remove it from the list
        deleteFromQueryState(client, key, post.id);
      }
    }
  }

  client.setQueryData(makePostQueryKey(post.id), post);
};

export const deletePredictionFromAllQueryData = (
  postId: number,
  id: number,
  client: QueryClient
) => deleteFromQueryState(client, makePredictionsQueryKey(postId), id);

export const updateAllPredictionQueryData = (
  prediction: Prediction,
  client: QueryClient
) =>
  updateInQueryState(
    client,
    makePredictionsQueryKey(prediction.post_id),
    prediction
  );
