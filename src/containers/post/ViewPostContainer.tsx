import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNewCommentMutation } from '../../api/mutations/commentMutations';
import { useComments, usePost, usePredictions } from '../../api/queries';
import { ActivityIndicator, View } from '../../components/base';
import ViewPost from '../../components/post/ViewPost';
import {
  alert,
  handleError,
  hasPassed,
  MAX_COMMENT_LENGTH,
  NotLoggedInError,
  Prediction,
  prompt,
} from '../../utils';
import { useCurrentUserId, useStackNavigation } from '../../utils/hooks';
import CreatePredictionModalContainer from '../prediction/CreatePredictionModalContainer';
import ClosePostModalContainer from './ClosePostModalContainer';

type Props = {
  id: number;
  closePostVisible: boolean;
  setClosePostVisible: Dispatch<SetStateAction<boolean>>;
  setDeletablePrediction: Dispatch<SetStateAction<Prediction | undefined>>;
};

const ViewPostContainer = ({
  id,
  closePostVisible,
  setClosePostVisible,
  setDeletablePrediction,
}: Props) => {
  const navigation = useStackNavigation();
  const { data: post, refetch: refreshPost } = usePost(id, () =>
    navigation.popToTop()
  );
  const createComment = useNewCommentMutation(post);

  const [createPredictionVisible, setCreatePredictionVisible] = useState(false);
  const [selectedPredictionId, setSelectedPredictionId] = useState<number>();
  const commentsParentType = selectedPredictionId ? 'prediction' : 'post';
  const commentsParentId = selectedPredictionId ?? id;

  const {
    data: comments,
    atEnd: atEndOfComments,
    onRefresh: onRefreshComments,
    loading: commentsRefreshing,
    onLoadMore: onLoadMoreComments,
  } = useComments(commentsParentType, commentsParentId);

  const {
    data: predictions,
    atEnd: atEndOfPredictions,
    onRefresh: onRefreshPredictions,
    loading: predictionsRefreshing,
    onLoadMore: onLoadMorePredictions,
  } = usePredictions(id);

  const userId = useCurrentUserId();

  const onPressPredict = useCallback(() => {
    try {
      if (!userId) {
        throw new NotLoggedInError();
      }
      if (!post) {
        throw new Error('Oops, this feature is not available at the moment.');
      }

      if (hasPassed(post)) {
        alert(
          'Predictions have closed',
          "This post is completed, so it's not accepting any more predictions. You are welcome to comment, though!"
        );
      } else {
        setCreatePredictionVisible(true);
      }
    } catch (error) {
      handleError(error);
    }
  }, [post, userId]);

  const onPressComment = useCallback(() => {
    prompt('Add a comment', `Respond to "${post?.subject}"`, {
      multiline: true,
      okButton: 'Comment',
      maxLength: MAX_COMMENT_LENGTH,
    }).then(([comment, cancelled]) => {
      if (!cancelled && comment) {
        createComment.mutate({ parentId: id, parentType: 'post', comment });
      }
    });
  }, [createComment, id, post?.subject]);

  useEffect(() => {
    if (selectedPredictionId) {
      const selectedPrediction = predictions.find(
        (p) => p.id === selectedPredictionId
      );
      if (selectedPrediction?.user_id === userId) {
        setDeletablePrediction(selectedPrediction);
      }
    } else {
      setDeletablePrediction(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPredictionId, setDeletablePrediction, userId]);

  if (!post) {
    return (
      <View flex center>
        <View row center>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  const onCreatePrediction = (predId: number) => {
    setTimeout(() => {
      setSelectedPredictionId(predId);
    }, 100);
  };

  return (
    <>
      <CreatePredictionModalContainer
        post={post}
        visible={createPredictionVisible}
        onClose={() => setCreatePredictionVisible(false)}
        onCreatedPrediction={onCreatePrediction}
      />
      <ClosePostModalContainer
        post={post}
        visible={closePostVisible}
        onClose={() => setClosePostVisible(false)}
        onSaved={onCreatePrediction}
      />
      <ViewPost
        post={post}
        comments={comments}
        predictions={predictions}
        atEndOfComments={atEndOfComments}
        atEndOfPredictions={atEndOfPredictions}
        commentsRefreshing={commentsRefreshing}
        predictionsRefreshing={predictionsRefreshing}
        onRefreshComments={() => {
          refreshPost();
          onRefreshComments();
          onRefreshPredictions();
        }}
        onLoadMoreComments={onLoadMoreComments}
        onLoadMorePredictions={onLoadMorePredictions}
        onPressComment={onPressComment}
        onPressPredict={onPressPredict}
        onSelectPrediction={(predId) =>
          setSelectedPredictionId((old) =>
            old === predId ? undefined : predId
          )
        }
        selectedPredictionId={selectedPredictionId}
      />
    </>
  );
};

export default ViewPostContainer;
