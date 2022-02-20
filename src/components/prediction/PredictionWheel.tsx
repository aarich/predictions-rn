import { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import PredictionWheelCardContainer from '../../containers/prediction/PredictionWheelCardContainer';
import { log, Post, Prediction } from '../../utils';
import { ActivityIndicator } from '../base';

type Props = {
  post: Post;
  predictions?: Prediction[];
  refreshing: boolean;
  selectedPredictionId: number | undefined;
  atEnd: boolean;
  onSelectPrediction: (id: number) => void;
  onEndReached: VoidFunction;
};

const PredictionWheel = ({
  post,
  predictions,
  selectedPredictionId,
  refreshing,
  atEnd,
  onSelectPrediction,
  onEndReached,
}: Props) => {
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (selectedPredictionId && predictions) {
      const index = predictions.findIndex((p) => p.id === selectedPredictionId);
      if (index >= 0) {
        listRef.current?.scrollToIndex({ index });
      }
    }
  }, [predictions, selectedPredictionId]);
  return (
    <FlatList
      onEndReached={atEnd ? undefined : onEndReached}
      onScrollToIndexFailed={(info) =>
        log('scroll to index failed: PredictionWheel', { info })
      }
      ref={listRef}
      data={predictions}
      keyExtractor={(item) => `${item.id}`}
      renderItem={({ item }) => (
        <PredictionWheelCardContainer
          post={post}
          prediction={item}
          selected={selectedPredictionId === item.id}
          onSelect={() => onSelectPrediction(item.id)}
        />
      )}
      ListFooterComponent={refreshing ? <ActivityIndicator /> : undefined}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default PredictionWheel;
