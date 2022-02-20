import { useCallback } from 'react';
import { useToggleLike } from '../../api/mutations';
import ViewComment from '../../components/comment/ViewComment';
import { alertLikeInfo, Comment, isMockEntity } from '../../utils';

type Props = {
  comment: Comment;
};

const CommentContainer = ({ comment }: Props) => {
  const toggleLike = useToggleLike('comment');

  const handleLike = useCallback(
    async (up: boolean) => {
      if (isMockEntity(comment)) {
        alertLikeInfo(up);
        return;
      }

      toggleLike.mutate({ didPressUp: up, entity: comment });
    },
    [comment, toggleLike]
  );

  return <ViewComment comment={comment} onPressLike={handleLike} />;
};

export default CommentContainer;
