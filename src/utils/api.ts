import moment, { Moment } from 'moment';
import { UserError } from './interactions';
import { log } from './log';
import {
  Comment,
  CommentParentType,
  CreatePostDraft,
  CreatePredictionDraft,
  Post,
  Profile,
} from './typesDB';

const UNKNOWN_ERROR_MSG = 'An unknown error occurred. Please try again later.';

export const validatePrediction = (draft: CreatePredictionDraft): boolean => {
  let msg: string | undefined;
  let devError = false;

  if (!draft.value) {
    msg = `Missing ${draft.final ? 'outcome' : 'prediction'}`;
  } else if (draft.url && !isValidUrl(draft.url)) {
    msg = 'Invalid URL';
  } else {
    devError = anyFieldsMissing(draft, ['post_id', 'source_type']);
  }

  return handleResult(devError, msg);
};

export const validatePost = (
  draft: Partial<CreatePostDraft>
): draft is CreatePostDraft => {
  let msg: string | undefined;
  let devError = false;
  if (!draft.subject) {
    msg = 'Missing Subject';
  } else if (draft.url && !isValidUrl(draft.url)) {
    msg = 'Invalid URL';
  } else {
    devError = anyFieldsMissing(draft, ['tags', 'outcome_type']);
  }

  return handleResult(devError, msg);
};

const handleResult = (devError: boolean, msg: string | undefined) => {
  if (devError) {
    log('Developer error!: ' + msg);
    msg = UNKNOWN_ERROR_MSG;
    throw new Error(msg);
  }

  if (msg) {
    throw new UserError(msg);
  }

  return true;
};

const anyFieldsMissing = <T>(draft: T, fields: (keyof T)[]): boolean =>
  fields.filter((f) => (draft[f] ? true : log(`Missing ${f}`))).length !==
  fields.length;

export const isValidUrl = (str: string) => {
  let url: URL;
  try {
    url = new URL(str);
  } catch {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const calculatePoints = ({
  num_post_likes,
  num_pred_likes,
  num_comm_likes,
  num_post_dislikes,
  num_pred_dislikes,
  num_comm_dislikes,
  num_pred_comments,
  num_post_comments,
  num_post_predictions,
}: Profile): number =>
  3 * (num_post_likes - num_post_dislikes) +
  3 * (num_pred_likes - num_pred_dislikes) +
  2 * (num_comm_likes - num_comm_dislikes) +
  1 * (num_post_comments + num_pred_comments) +
  2 * num_post_predictions;

export const isValidSearchTerm = (s: string): boolean => {
  if (!s) {
    return false;
  }

  return !['the', 'a', 'and'].includes(s.toLowerCase());
};

export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const hasPassed = (post: Post, alreadyParsedDate?: Moment): boolean => {
  if (!post.check_date) {
    return false;
  }
  const checkDate = alreadyParsedDate ?? moment(post.check_date);
  return checkDate.isBefore(Date.now());
};

export const getParentInfo = (
  comment: Comment
): { parentId: number; parentType: CommentParentType } => {
  if (comment.parent_comment) {
    return { parentId: comment.parent_comment, parentType: 'comment' };
  }
  if (comment.parent_post) {
    return { parentId: comment.parent_post, parentType: 'post' };
  }
  if (comment.parent_prediction) {
    return { parentId: comment.parent_prediction, parentType: 'prediction' };
  }

  log("Couldn't determine parent info", { comment });
  throw new Error('Could not determine parent info');
};
