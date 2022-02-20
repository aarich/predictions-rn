import { useCallback } from 'react';
import { useToggleLike } from '../../api/mutations';
import ActionBar from '../../components/actions/ActionBar';
import { alert, alertLikeInfo, isMockEntity, Post, share } from '../../utils';

type Props = {
  post: Post;
  showTime?: boolean;
} & (
  | {
      onPressActionDefault: () => void;
    }
  | {
      onPressComment: () => void;
      onPressPredict: () => void;
    }
);

const PostActionBarContainer = ({ post, showTime = true, ...props }: Props) => {
  const toggleLike = useToggleLike('post');
  const onPressLike = useCallback(
    (up: boolean) => {
      if (isMockEntity(post)) {
        alertLikeInfo(up);
        return;
      }
      toggleLike.mutate({ didPressUp: up, entity: post });
    },
    [post, toggleLike]
  );

  let onPredict: VoidFunction;
  let onComment: VoidFunction;
  if ('onPressActionDefault' in props) {
    onComment = props.onPressActionDefault;
    onPredict = props.onPressActionDefault;
  } else {
    onComment = props.onPressComment;
    onPredict = props.onPressPredict;
  }

  const onPressShare = () => {
    if (isMockEntity(post)) {
      alert(
        'Sharing is Caring',
        "Don't keep things to yourself! Share interesting content with friends."
      );
    } else {
      share('post', post.id, post.subject);
    }
  };

  return (
    <ActionBar
      onPressShare={onPressShare}
      onPressPredict={onPredict}
      onPressComment={onComment}
      onPressLike={onPressLike}
      showTime={showTime}
      entity={post}
    />
  );
};

export default PostActionBarContainer;
