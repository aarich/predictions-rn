import { Layout } from '@ui-kitten/components';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleProp,
  StyleSheet,
  ViewStyle,
  VirtualizedList,
  VirtualizedListProps,
} from 'react-native';
import CommentContainer from '../../containers/comment/CommentContainer';
import PostInfoHeaderContainer from '../../containers/post/PostInfoHeaderContainer';
import { Comment, log, Post, Prediction, Spacings } from '../../utils';
import { ActivityIndicator, Text, View } from '../base';
import AddCommentInput from '../comment/AddCommentInput';
import PredictionWheel from '../prediction/PredictionWheel';

type ItemT = Comment | string | Post;

type Props = {
  post: Post;
  comments?: Comment[];
  predictions?: Prediction[];
  selectedPredictionId: number | undefined;
  atEndOfComments: boolean;
  atEndOfPredictions: boolean;
  commentsRefreshing: boolean;
  predictionsRefreshing: boolean;
  onPressComment: () => void;
  onPressPredict: () => void;
  onSelectPrediction: (id: number) => void;
  onRefreshComments: VoidFunction;
  onLoadMoreComments: VoidFunction;
  onLoadMorePredictions: VoidFunction;
} & Omit<
  VirtualizedListProps<ItemT>,
  | 'renderItem'
  | 'contentContainerStyle'
  | 'showsVerticalScrollIndicator'
  | 'onRefresh'
  | 'refreshing'
  | 'onEndReached'
  | 'onScrollToIndexFailed'
  | 'data'
  | 'getItemCount'
  | 'getItem'
  | 'keyExtractor'
  | 'stickyHeaderIndices'
>;

const NO_COMMENTS = 'No Comments';
const LOADING_COMMENTS = 'Loading comments';
const offset = 2; // one for post detail, one for prediction wheeel

const ViewPost = ({
  post,
  comments,
  predictions,
  selectedPredictionId,
  atEndOfComments,
  atEndOfPredictions,
  commentsRefreshing,
  predictionsRefreshing,
  onPressComment,
  onPressPredict,
  onSelectPrediction,
  onRefreshComments,
  onLoadMoreComments,
  onLoadMorePredictions,
  ...listProps
}: Props) => {
  const listRef = useRef<VirtualizedList<ItemT>>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  useEffect(() => {
    if (selectedPredictionId && !hasScrolled) {
      listRef.current?.scrollToIndex({ index: 1 });
      setHasScrolled(true);
    }
  }, [hasScrolled, selectedPredictionId]);

  const [contentContainerStyle, setContentContainerStyle] =
    useState<StyleProp<ViewStyle>>();

  const onCommentFocus = useCallback(() => {
    if ((comments?.length ?? 0) < 10) {
      setContentContainerStyle(styles.editComment);
    }
  }, [comments?.length]);

  const commentParent = selectedPredictionId
    ? predictions?.find((p) => p.id === selectedPredictionId)
    : post;

  const renderItem: ListRenderItem<ItemT> = ({ item, index }) => {
    if (index === 0) {
      return (
        <PostInfoHeaderContainer
          post={post}
          onPressComment={onPressComment}
          onPressPredict={onPressPredict}
        />
      );
    } else if (index === 1) {
      return (
        <>
          <PredictionWheel
            post={post}
            refreshing={predictionsRefreshing}
            atEnd={atEndOfPredictions}
            onEndReached={onLoadMorePredictions}
            predictions={predictions}
            onSelectPrediction={onSelectPrediction}
            selectedPredictionId={selectedPredictionId}
          />
          {comments && commentParent ? (
            <AddCommentInput
              parent={commentParent}
              parentType={selectedPredictionId ? 'prediction' : 'post'}
              onFocus={onCommentFocus}
              onBlur={() => setContentContainerStyle(undefined)}
            />
          ) : null}
        </>
      );
    } else {
      if (item === LOADING_COMMENTS) {
        return (
          <View row center style={styles.activity}>
            <ActivityIndicator size="tiny" status="basic" />
            <Text hint category="c1" style={styles.emptyStateText}>
              Loading comments
            </Text>
          </View>
        );
      } else if (item === NO_COMMENTS) {
        return (
          <Text
            hint
            category="c1"
            style={[styles.emptyStateText, styles.activity]}
            center
          >
            No comments on this {selectedPredictionId ? 'prediction' : 'post'}.
            Add one!
          </Text>
        );
      }

      const comment = item as Comment;
      return <CommentContainer comment={comment} />;
    }
  };

  return (
    <Layout level="2" style={styles.layout}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.layout}
      >
        <VirtualizedList
          {...listProps}
          ref={listRef}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefreshComments}
          refreshing={commentsRefreshing}
          onEndReached={atEndOfComments ? undefined : onLoadMoreComments}
          onScrollToIndexFailed={(info) =>
            log('scroll to index failed', { info })
          }
          data={comments || [null /* To load the spinner */]}
          renderItem={renderItem}
          getItemCount={(data) => Math.max(3, data.length + offset)}
          getItem={(_, index): ItemT => {
            if (index === 0) {
              return post;
            } else if (index === 1) {
              return 'predictions';
            } else if (!comments) {
              return LOADING_COMMENTS;
            } else {
              return comments.length === 0
                ? NO_COMMENTS
                : comments[index - offset];
            }
          }}
          keyExtractor={(item, index) =>
            // @ts-ignore
            index > offset ? `c${item.id}` : `p${index}`
          }
          stickyHeaderIndices={[1]}
        />
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default ViewPost;

const styles = StyleSheet.create({
  layout: { flex: 1 },
  activity: { margin: Spacings.s2 },
  emptyStateText: { marginHorizontal: Spacings.s4 },
  editComment: { height: Dimensions.get('screen').height * 1.5 },
});
