import moment, { Moment } from 'moment';
import { generateUsername } from './auth';
import { MyConstants } from './constants';
import { alert } from './interactions';
import { toSqlString } from './supabase';
import {
  Comment,
  OutcomeType,
  Post,
  Prediction,
  SourceType,
  TagType,
} from './typesDB';

let unique_id = -1;
const id = () => unique_id--;

const sorter = (a: Comment, b: Comment) => b.num_likes - a.num_likes;
const yesterday = toSqlString(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2));
const randDateInLast24Hrs = () =>
  toSqlString(new Date(Date.now() - 1000 * 60 * 60 * (1 + Math.random()) * 24));

const c = (str: string, predId?: number): Comment => ({
  id: id(),
  comment: str,
  created_at: randDateInLast24Hrs(),
  updated_at: toSqlString(new Date(Date.now())),
  user_id: '',
  username: generateUsername(),
  like_status: Math.random() > 0.7 ? 'liked' : 'none',
  num_comments: 0,
  num_dislikes: 0,
  num_likes: Math.floor(Math.random() * 100),
  trend_score: 55,
  parent_post: typeof predId === 'undefined' ? -1 : undefined,
  parent_comment: undefined,
  parent_prediction: predId,
  verified_user: false,
});

const comments = (...strs: string[]) => strs.map((str) => c(str)).sort(sorter);

const COMMENTS: Comment[][] = [
  comments('2023 might be a little optimistic'),
  comments(
    'Kind of a cop-out answer',
    'Does Waterworld even take place in California?',
    "Just because water is everywhere doesn't mean the drought is over. See: Antartica",
    "I don't think the drought monitor will be verifiable in 2500"
  ),
  comments(
    "I don't know if the state is ever supposed to be fully drought-free",
    'at least we have sunshine ☀️😅',
    "Up here in Seattle. I'll gladly send some rain down there",
    'The 12 people who disliked this post must live in california'
  ),
];

const p = (
  index: number,
  value: Moment,
  comment?: string,
  original = false,
  final = false,
  url?: string,
  source_type = SourceType.PERSONAL,
  author?: string
): Prediction => ({
  id: id(),
  value: value.toISOString(),
  comment,
  post_id: -1,
  created_at: randDateInLast24Hrs(),
  like_status: Math.random() > 0.7 ? 'liked' : 'none',
  num_comments: COMMENTS[index].length,
  num_dislikes: 0,
  num_likes: Math.floor(Math.random() * 500),
  original,
  final,
  source_type,
  trend_score: 0,
  updated_at: yesterday,
  user_id: '',
  username: generateUsername(),
  url,
  author,
  verified_user: false,
});

const PREDICTIONS: Prediction[] = [
  p(
    0,
    moment('20230315T000000-0400'),
    'Spring showers, but probably not this year',
    true
  ),
  p(
    1,
    moment('25000101T000000-0400'),
    "If we're still alive by then, of course",
    false,
    false,
    'https://en.wikipedia.org/wiki/Waterworld#cite_note-4',
    SourceType.MOVIE,
    'Waterworld'
  ),
];

const POST: Post = {
  id: id(),
  subject: 'California Drought',
  username: 'bay-area-native',
  created_at: yesterday,
  updated_at: yesterday,
  is_public: true,
  like_status: 'liked',
  num_comments: Object.values(COMMENTS).reduce((p, a) => p + a.length, 0),
  num_dislikes: 12,
  num_likes: 894,
  num_predictions: Object.keys(COMMENTS).length - 1,
  tags: [TagType.SCIENCE, TagType.NATURE, TagType.NEWS],
  outcome_test:
    'When the official drought monitor reaches mostly D0 (Abnormally Dry)',
  outcome_type: OutcomeType.DATE,
  trend_score: 50,
  user_id: '',
  description: 'When will California be out of the drought?',
  url: 'https://droughtmonitor.unl.edu/CurrentMap/StateDroughtMonitor.aspx?CA',
  verified_user: false,
  is_featured: false,
  media_type: 'image',
  media_url:
    'https://images.unsplash.com/photo-1629160497902-43a8e0b178b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80',
  avatar_url: 'https://source.unsplash.com/100x100/?profile',
};

export const getMockPost = () => POST;
export const getMockPredictions = () => PREDICTIONS;
export const getMockPredictionId = (predIdx?: number) =>
  typeof predIdx === 'number' ? PREDICTIONS[predIdx].id : undefined;
export const getMockComments = (predIdx?: number) =>
  COMMENTS[predIdx ?? COMMENTS.length - 1];

export const isMockEntity = <T extends string | number>(entity?: { id: T }) =>
  typeof entity?.id === 'string' ? entity?.id === '' : (entity?.id || 0) < 0;

export const alertLikeInfo = (didPressUp: boolean) =>
  alert(
    `Customize ${MyConstants.manifest?.name}`,
    `Make the experience better for everyone by voting ${
      didPressUp
        ? 'up posts that are interesting or fun.'
        : 'down posts that are less interesting to you'
    }`
  );
