import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
  FollowableEntity,
  log,
  NotLoggedInError,
  supabase,
  toast,
  toSqlString,
} from '../../utils';

/**
 * @returns true if user is now following the entity
 */
export const toggleFollow = async <T extends FollowableEntity>(
  entity: T,
  type: 'post'
): Promise<T> => {
  const { followed_at } = entity;
  const from = supabase.from(`${type}_follow`);
  const relationColumn = `${type}_id`;
  const user_id = supabase.auth.user()?.id;

  if (!user_id) {
    throw new NotLoggedInError();
  }

  let action: PostgrestFilterBuilder<unknown>;
  if (followed_at) {
    log(`Deleting the following record for ${type} ${entity.id}`);
    action = from.delete().eq(relationColumn, entity.id).eq('user_id', user_id);
  } else {
    log(`Creating a following record for ${type} ${entity.id}`);
    const data = { [relationColumn]: entity.id, user_id };
    action = from.upsert(data);
  }

  await action.throwOnError();

  const newFollowedAt = followed_at
    ? undefined
    : toSqlString(new Date(Date.now()));

  if (newFollowedAt) {
    toast('Following!');
  } else {
    toast('Removed', 'info');
  }

  entity.followed_at = newFollowedAt;

  return entity;
};

export const clearAllPastNotifications = async <T extends FollowableEntity>(
  type: 'post',
  entities?: T[]
): Promise<T[]> => {
  log('Clearing all past notifications');
  const user_id = supabase.auth.user()?.id;
  if (!user_id) {
    throw new NotLoggedInError();
  }

  const ids = entities?.map((e) => e.id);

  if (ids && ids.length > 0) {
    await supabase
      .from(`${type}_follow`)
      .delete()
      .in(`${type}_id`, ids)
      .eq('user_id', user_id)
      .throwOnError();
  }

  return (
    entities?.map((entity) => {
      entity.followed_at = undefined;
      return entity;
    }) || []
  );
};
