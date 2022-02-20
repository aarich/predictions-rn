import { useCallback } from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { useToggleLike } from '../../api/mutations';
import PredictionWheelCard from '../../components/prediction/PredictionWheelCard';
import { alertLikeInfo, isMockEntity, Post, Prediction } from '../../utils';
import { useBackgroundColor } from '../../utils/hooks';

type Props = {
  post: Post;
  prediction: Prediction;
  selected: boolean;
  onSelect: VoidFunction;
};

const PredictionWheelCardContainer = ({
  post,
  prediction,
  selected,
  onSelect,
}: Props) => {
  const backgroundColor = useBackgroundColor(selected ? 3 : 1);
  const screenWidth = useSafeAreaFrame().width;
  const minWidth = 70;
  const maxWidth = Math.floor(screenWidth * 0.9);
  const toggleLike = useToggleLike('prediction');

  const handleLike = useCallback(
    async (up: boolean) => {
      if (isMockEntity(prediction)) {
        alertLikeInfo(up);
        return;
      }

      toggleLike.mutate({ didPressUp: up, entity: prediction });
    },
    [prediction, toggleLike]
  );

  return (
    <PredictionWheelCard
      onPressLike={handleLike}
      onSelect={onSelect}
      selected={selected}
      prediction={prediction}
      post={post}
      style={{ backgroundColor, minWidth, maxWidth }}
    />
  );
};

export default PredictionWheelCardContainer;
