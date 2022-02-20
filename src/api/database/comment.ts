import {
  Comment,
  CommentParentType,
  log,
  NotLoggedInError,
  supabase,
} from '../../utils';
import { PAGE_SIZE } from '../commonApi';

export type CreateCommentVariables = {
  parentId: number;
  parentType: CommentParentType;
  comment: string;
};

export const createComment = async ({
  parentId,
  parentType,
  comment,
}: CreateCommentVariables): Promise<Comment> => {
  const user_id = supabase.auth.user()?.id;
  if (!user_id) {
    throw new NotLoggedInError();
  }

  const insertData = {
    user_id,
    [`parent_${parentType}`]: parentId,
    comment,
  };

  const { data } = await supabase
    .from('comment')
    .insert(insertData)
    .throwOnError();

  if (!data) {
    throw new Error('Comment not created');
  }

  const { data: comments } = await supabase
    .from<Comment>('comment_view')
    .select('*')
    .eq('id', data[0].id)
    .throwOnError();
  const newComment = comments?.[0];
  if (!newComment) {
    throw new Error('Comment not found');
  }

  newComment.like_status = 'none';

  return newComment;
};

export const deleteComment = async ({ id }: { id: number }): Promise<void> => {
  await supabase
    .from('comment')
    .delete({ returning: 'minimal' })
    .eq('id', id)
    .throwOnError();
};

export const getComments = async (
  parent_type: CommentParentType,
  parent_id: number,
  page_offset: number
): Promise<Comment[]> => {
  log(
    `Querying comments for ${parent_type} ${parent_id}. page: ${page_offset}`
  );

  const params = { page_offset, page_size: PAGE_SIZE, parent_id, parent_type };

  const { data } = await supabase
    .rpc<Comment>('get_comments', params)
    .throwOnError();

  return data || [];
};
