import {
  captureException,
  CreatePostDraft,
  deleteCachedImage,
  escapeRegExp,
  isValidSearchTerm,
  log,
  NotLoggedInError,
  Post,
  PostFeedType,
  PostSearchInfo,
  supabase,
  UpdatePostDraft,
} from '../../utils';
import { PAGE_SIZE } from '../commonApi';

export const getPost = async (id: number): Promise<Post> => {
  log(`Querying single post with id: ${id}`);

  const userId = supabase.auth.user()?.id;
  const isPublicFilter = 'is_public.eq.true';
  const filter = userId
    ? `${isPublicFilter},user_id.eq.${userId}`
    : isPublicFilter;
  const { data } = await supabase
    .from<Post>('post_view')
    .select('*')
    .eq('id', id)
    .or(filter)
    .throwOnError();

  if (!data || data.length !== 1) {
    throw new Error('No data found');
  }

  if (userId) {
    const { data: likes } = await supabase
      .from<{ is_up: boolean; post_id: number; user_id: string }>('post_like')
      .select('is_up')
      .eq('post_id', id)
      .eq('user_id', userId)
      .throwOnError();
    if (likes && likes.length === 1) {
      data[0].like_status = likes[0].is_up ? 'liked' : 'disliked';
    } else {
      data[0].like_status = 'none';
    }

    const { data: follows } = await supabase
      .from<{ created_at: string; post_id: number; user_id: string }>(
        'post_follow'
      )
      .select('created_at')
      .eq('post_id', id)
      .eq('user_id', userId)
      .throwOnError();
    if (follows && follows.length === 1) {
      data[0].followed_at = follows[0].created_at;
    }
  } else {
    data[0].like_status = 'none';
  }

  return data[0];
};

export const deletePost = async (post: Post) => {
  await supabase.from('post').delete().eq('id', post.id).throwOnError();
  deleteCachedImage(true, 'post', post.media_url);
  if (post.media_url && post.media_type === 'image') {
    log('Deleting photo from storage: ' + post.media_url);
    const { error } = await supabase.storage
      .from('post')
      .remove([post.media_url]);
    if (error) {
      captureException(error);
    }
  }
};

export const createPost = async (post: CreatePostDraft): Promise<Post> => {
  if (!supabase.auth.user()) {
    throw new NotLoggedInError();
  }
  const { data } = await supabase.from('post').insert(post).throwOnError();

  if (!data) {
    throw new Error('No data was returned!');
  }

  return getPost(data[0]?.id);
};

export const updatePost = async (
  post: UpdatePostDraft,
  id: number
): Promise<Post> => {
  if (!supabase.auth.user()) {
    throw new NotLoggedInError();
  }

  log(`Updating post ${id}: ${JSON.stringify(post)}`);

  const { status } = await supabase
    .from('post')
    .update(post, { returning: 'minimal' })
    .eq('id', id)
    .throwOnError();

  if (status !== 204) {
    throw new Error('No data updated');
  }

  return getPost(id);
};

export const getPosts = async (
  feed_type: PostFeedType,
  page_offset: number,
  search: PostSearchInfo = {}
): Promise<Post[]> => {
  let search_term = search.query
    ?.split(' ')
    .filter(isValidSearchTerm)
    .map(escapeRegExp)
    .map((s) => `(?=.*${s})`)
    .join('');

  if (!search_term) {
    // convert empty string to undefined
    search_term = undefined;
  }

  log(
    `Querying ${feed_type} posts, p ${page_offset} ${JSON.stringify({
      ...search,
      search_term,
    })}`
  );

  const { data } = await supabase
    .rpc<Post>('get_posts', {
      feed_type,
      page_offset,
      page_size: PAGE_SIZE,
      search_term,
      search_tag: search.tag,
      profile_id: search.profileId,
    })
    .throwOnError();

  return data || [];
};
