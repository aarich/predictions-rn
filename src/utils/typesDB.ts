import { CombinedImageInfo } from './image';

export type CommentParentType = 'post' | 'prediction' | 'comment';

export enum PostFeedType {
  PERSONAL = 'personal',
  TRENDING = 'trending',
  NEWEST = 'newest',
  FOLLOWING = 'following',
  NOTIFIED = 'notified',
}

export interface BaseEntity<IdType = number> {
  id: IdType;
  updated_at: string;
  created_at: string;
}

export interface CreatedByUserInfo extends BaseEntity {
  user_id: string;
  username: string;
  avatar_url?: string;
  verified_user: boolean;
}

export type LikeStatus = 'liked' | 'disliked' | 'none';

export interface LikeableEntity extends BaseEntity {
  num_likes: number;
  num_dislikes: number;
  num_comments: number;
  like_status: LikeStatus;
  trend_score: number;
}

export interface FollowableEntity extends BaseEntity {
  /** Date at which it was followed. null if not following */
  followed_at?: string;
}

export interface MutableProfile {
  website?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  expo_push_token?: string | null;
}

export interface Profile extends BaseEntity<string> {
  website?: string;
  avatar_url?: string;
  username: string;
  push_token_set: boolean;
  bio?: string;
  verified: boolean;
  num_post_likes: number;
  num_post_dislikes: number;
  num_post_comments: number;
  num_post_predictions: number;
  num_pred_likes: number;
  num_pred_dislikes: number;
  num_pred_comments: number;
  num_comm_likes: number;
  num_comm_dislikes: number;
}

export const isTag = (s: string): s is TagType =>
  Object.values<string>(TagType).includes(s);
export enum TagType {
  MEDIA = 'media',
  PERSONAL = 'personal',
  POLITICS = 'politics',
  SCIENCE = 'science',
  SPORTS = 'sports',
  NEWS = 'news',
  NATURE = 'nature',
  TECHNOLOGY = 'technology',
}

export enum SourceType {
  NEWS = 'news',
  MOVIE = 'movie',
  TV_SHOW = 'TV series',
  ARTICLE = 'article',
  PERSONAL = 'personal',
  POLITICS = 'politics',
  SCIENCE = 'science',
  RELIGION = 'religion',
  OTHER = 'other',
}

export enum OutcomeType {
  NUMERIC = 'numeric', // e.g. what will the score be
  YESNO = 'yesno',
  NONE = 'none',
  DATE = 'date',
}

export interface Post
  extends CreatedByUserInfo,
    LikeableEntity,
    FollowableEntity,
    Omit<CreatePostDraft, 'check_date' | 'user_id' | 'media_url'> {
  check_date?: string;
  num_predictions: number;
  media_url?: string;
  is_featured: boolean;
}

export type UpdatePostDraft = {
  check_date?: Date;
};

export type CreatePostDraft = {
  user_id: string;
  tags: TagType[];
  url?: string;
  subject: string;
  check_date?: Date;
  media_url?: string | CombinedImageInfo;
  media_type?: 'image';
  description?: string;
  is_public: boolean;
  outcome_type: OutcomeType;
  outcome_test: string;
};

export type CreatePredictionDraft = {
  user_id?: string;
  value: string;
  original: boolean;
  final: boolean;
  source_type: SourceType;
  comment: string;
  post_id: number;
  url?: string;
  author?: string;
};

export interface Prediction extends CreatedByUserInfo, LikeableEntity {
  value: string;
  original: boolean;
  final: boolean;
  source_type: SourceType;
  comment?: string;
  post_id: number;
  url?: string;
  author?: string;
}

type CommentParent = Record<
  'parent_post' | 'parent_comment' | 'parent_prediction',
  number | undefined
>;
export interface Comment
  extends CreatedByUserInfo,
    LikeableEntity,
    CommentParent {
  comment: string;
}

export type PostSearchInfo = {
  tag?: TagType;
  query?: string;
  profileId?: string;
};

export const MAX_COMMENT_LENGTH = 500;
