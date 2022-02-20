import { useEffect, useRef, useState } from 'react';
import ViewPost from '../../components/post/ViewPost';
import {
  alert,
  Comment,
  getMockComments,
  getMockPost,
  getMockPredictionId,
  getMockPredictions,
  log,
  MyConstants,
} from '../../utils';
import CreatePredictionModalContainer from '../prediction/CreatePredictionModalContainer';

const TutorialContainer = () => {
  // For screenshots
  const [predictionVisible, setPredictionVisible] = useState(false);

  const hasSelectedPrediction = useRef(false);
  const [selectedPredictionIdx, setSelectedPredictionIdx] = useState<number>();
  const [comments, setComments] = useState<Comment[]>();
  const onPressComment = () =>
    alert(
      'Comments',
      'You can add comments to either a top level post or individual predictions'
    );
  const onPressPredict = () => {
    if (MyConstants.isScreenshotting) {
      setPredictionVisible(true);
    } else {
      alert(
        'Predictions',
        "You can add predictions to any post. The prediction can be yours or you can share a prediction you've seen somewhere."
      );
    }
  };

  useEffect(() => {
    setComments(getMockComments(selectedPredictionIdx));
    if (
      typeof selectedPredictionIdx === 'number' &&
      !hasSelectedPrediction.current
    ) {
      alert(
        'You selected a prediction',
        'Notice the comments have changed! You can comment on the top level post or individual predictions. Find the thread you want by selecting the prediction'
      );
      hasSelectedPrediction.current = true;
      log('true');
    }
  }, [selectedPredictionIdx]);

  useEffect(() => {
    alert(
      'Tutorial',
      "Here's a fake post. You can try any of the buttons to see what it does on a real post."
    );
  }, []);

  return (
    <>
      <CreatePredictionModalContainer
        onClose={() => setPredictionVisible(false)}
        onCreatedPrediction={() => setPredictionVisible(false)}
        post={getMockPost()}
        visible={predictionVisible}
      />
      <ViewPost
        post={getMockPost()}
        comments={comments}
        predictions={getMockPredictions()}
        selectedPredictionId={getMockPredictionId(selectedPredictionIdx)}
        onSelectPrediction={(newId) =>
          setSelectedPredictionIdx((oldIdx) => {
            const newIdx = getMockPredictions().findIndex(
              (p) => p.id === newId
            );
            return oldIdx === newIdx ? undefined : newIdx;
          })
        }
        onPressComment={onPressComment}
        onPressPredict={onPressPredict}
        atEndOfComments={true}
        atEndOfPredictions={true}
        commentsRefreshing={false}
        predictionsRefreshing={false}
        onLoadMoreComments={() => null}
        onLoadMorePredictions={() => null}
        onRefreshComments={() => null}
      />
    </>
  );
};

export default TutorialContainer;
