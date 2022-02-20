import { Input } from '@ui-kitten/components';
import { useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { useNewCommentMutation } from '../../api/mutations/commentMutations';
import {
  CommentParentType,
  handleUserError,
  MAX_COMMENT_LENGTH,
  Post,
  Prediction,
  Spacings,
} from '../../utils';
import { Button, Text, View } from '../base';

type Props = {
  parent: Post | Prediction;
  parentType: CommentParentType;
  onFocus: VoidFunction;
  onBlur: VoidFunction;
};

const AddCommentInput = ({ parent, parentType, onFocus, onBlur }: Props) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const newComment = useNewCommentMutation(parent);

  const onCreate = () => {
    if (comment) {
      if (comment.length > MAX_COMMENT_LENGTH) {
        handleUserError(
          `Ok, Shakespeare. This comment is bit long. Remove at least ${
            comment.length - MAX_COMMENT_LENGTH
          } characters`
        );
        return;
      }
      setLoading(true);
      Keyboard.dismiss();
      newComment.mutate(
        { comment, parentId: parent.id, parentType },
        { onSettled: () => setLoading(false) }
      );
    }
  };
  let message: string;
  if (parentType === 'post') {
    message = 'Comment will be added to the original post';
  } else if (parentType === 'prediction') {
    message = 'Comment will be added to the highlighted prediction';
  } else {
    message = 'You are replying to a comment';
  }

  const sendButtonLabel = loading ? 'Sending' : 'Send';
  return (
    <View style={styles.container}>
      <View row>
        <Input
          placeholder="Add a comment..."
          style={[styles.input]}
          size="small"
          value={comment}
          onChangeText={setComment}
          multiline
          clearButtonMode="always"
          onTouchCancel={() => setComment('')}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {comment ? (
          <View center style={styles.button}>
            <Button
              label={sendButtonLabel}
              size="small"
              onPress={onCreate}
              disabled={loading}
            />
          </View>
        ) : null}
      </View>
      {comment ? (
        <Text hint category="c1" italic>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

export default AddCommentInput;

const styles = StyleSheet.create({
  container: { margin: Spacings.s2 },
  input: {
    flex: 3,
    marginRight: Spacings.s2,
  },
  button: { flex: 1 },
});
