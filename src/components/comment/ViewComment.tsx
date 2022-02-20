import { AlertButton, StyleSheet } from 'react-native';
import { useDeleteCommentMutation } from '../../api/mutations';
import {
  alert,
  Comment,
  getParentInfo,
  Icons,
  sendReport,
  Spacings,
} from '../../utils';
import { useCurrentUserId } from '../../utils/hooks';
import { Button, Card, IconButton, Text, View } from '../base';
import PostedByWithTime from '../social/PostedByWithTime';

type Props = {
  comment: Comment;
  onPressLike: (up: boolean) => void;
};

const ViewComment = ({ comment, onPressLike }: Props) => {
  const { id, num_dislikes, num_likes, like_status, user_id } = comment;
  const pointCount = num_likes * 2 - num_dislikes;
  const liked = like_status === 'liked';
  const disliked = like_status === 'disliked';

  const isOwner = user_id === useCurrentUserId();

  const { parentId, parentType } = getParentInfo(comment);
  const deleteComment = useDeleteCommentMutation(parentId, parentType);

  const options: AlertButton[] = [];
  if (isOwner) {
    options.push({
      text: 'Delete',
      onPress: () => deleteComment.mutate(id),
      style: 'destructive',
    });
  } else {
    options.push({
      text: 'Report',
      onPress: () => sendReport('Report Comment', { comment_id: id }),
    });
  }

  const onPressOptions = () => alert('Options', undefined, options);
  return (
    <Card disabled style={styles.card}>
      <View row>
        <View style={styles.likeButtons} spread>
          <Button
            icon={{ name: Icons.arrowUp }}
            size="tiny"
            ghost
            onPress={() => onPressLike(true)}
            status={liked ? 'danger' : 'basic'}
          />
          {Math.abs(pointCount) > 10 ? (
            <Text center category="c1" appearance="hint">
              {pointCount}
            </Text>
          ) : null}
          <Button
            icon={{ name: Icons.arrowDown }}
            size="tiny"
            ghost
            onPress={() => onPressLike(false)}
            status={disliked ? 'warning' : 'basic'}
          />
        </View>
        <View style={styles.text}>
          <View row spread>
            <PostedByWithTime entity={comment} category="c1" />
            <IconButton
              name={Icons.moreH}
              size="small"
              status="basic"
              style={{ marginHorizontal: Spacings.s2 }}
              onPress={onPressOptions}
            />
          </View>
          <Text>{comment.comment}</Text>
        </View>
      </View>
    </Card>
  );
};

export default ViewComment;

const styles = StyleSheet.create({
  card: { marginHorizontal: Spacings.s2, paddingVertical: Spacings.s2 },
  likeButtons: { marginRight: Spacings.s2 },
  text: { flex: 1 },
});
