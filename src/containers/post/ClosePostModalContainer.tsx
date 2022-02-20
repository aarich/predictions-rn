import { useCallback } from 'react';
import { useUpdatePost } from '../../api/mutations';
import { Post } from '../../utils';
import CreatePredictionModalContainer from '../prediction/CreatePredictionModalContainer';

type Props = {
  post: Post;
  visible: boolean;
  onClose: VoidFunction;
  onSaved: (predictionId: number) => void;
};

const ClosePostModalContainer = ({
  post,
  visible,
  onClose,
  onSaved,
}: Props) => {
  const updatePost = useUpdatePost(post.id);

  const onCreatedPrediction = useCallback(
    (predId: number) => {
      updatePost.mutate({ check_date: new Date() });
      onSaved(predId);
    },
    [onSaved, updatePost]
  );

  return (
    <CreatePredictionModalContainer
      post={post}
      onClose={onClose}
      onCreatedPrediction={onCreatedPrediction}
      visible={visible}
      final
    />
  );
};
export default ClosePostModalContainer;
