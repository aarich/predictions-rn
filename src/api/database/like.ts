import {
  LikeableEntity,
  LikeStatus,
  log,
  NotLoggedInError,
  supabase,
} from '../../utils';

export const toggleLike = async <T extends LikeableEntity>(
  didPressUp: boolean,
  type: 'post' | 'comment' | 'prediction',
  entity: T
): Promise<T> => {
  if (!supabase.auth.user()) {
    throw new NotLoggedInError();
  }

  const currentStatus = entity.like_status;
  const nextStatus = calculateNextStatus(currentStatus, didPressUp);

  log(`Updating like status on ${type} ${entity.id} to ${nextStatus}`);

  await supabase
    .rpc('toggle_like', {
      parent_type: type,
      id: entity.id,
      status: nextStatus,
    })
    .throwOnError();

  const { likesChange, dislikesChange } = calculateLikesChange(
    currentStatus,
    nextStatus
  );

  const updatedEntity: T = {
    ...entity,
    like_status: nextStatus,
    num_likes: entity.num_likes + likesChange,
    num_dislikes: entity.num_dislikes + dislikesChange,
  };

  return updatedEntity;
};

const calculateNextStatus = (
  currentStatus: LikeStatus,
  didPressUp: boolean
) => {
  let nextStatus: LikeStatus = 'none';
  if (didPressUp && currentStatus !== 'liked') {
    nextStatus = 'liked';
  } else if (!didPressUp && currentStatus !== 'disliked') {
    nextStatus = 'disliked';
  }

  return nextStatus;
};

const calculateLikesChange = (
  currentStatus: LikeStatus,
  nextStatus: LikeStatus
) => {
  let likesChange: number, dislikesChange: number;
  if (currentStatus === 'disliked') {
    dislikesChange = -1;
    likesChange = nextStatus === 'liked' ? 1 : 0;
  } else if (currentStatus === 'liked') {
    likesChange = -1;
    dislikesChange = nextStatus === 'disliked' ? 1 : 0;
  } else {
    likesChange = nextStatus === 'liked' ? 1 : 0;
    dislikesChange = nextStatus === 'disliked' ? 1 : 0;
  }

  return { likesChange, dislikesChange };
};
