import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { v4 as uuidV4 } from 'uuid';
import { useCreatePost, useCreatePrediction } from '../../api/mutations';
import CreatePost from '../../components/post/CreatePost';
import {
  alert,
  CreatePostDraft,
  CreatePredictionDraft,
  handleError,
  uploadImage,
  validatePost,
  validatePrediction,
} from '../../utils';
import { useCurrentUserId } from '../../utils/hooks';

type Props = {
  onGoToPost: (id: number) => void;
  onPopNavigation: VoidFunction;
};

const CreatePostContainer = ({ onGoToPost, onPopNavigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const user_id = useCurrentUserId();
  const createPost = useCreatePost();
  const createPrediction = useCreatePrediction();

  const create = useCallback(
    async (
      post: Partial<CreatePostDraft>,
      prediction: CreatePredictionDraft | undefined
    ) => {
      // if media_url is set, need to upload first
      setLoading(true);

      const postWithUserId = { ...post, user_id };
      try {
        if (validatePost(postWithUserId)) {
          if (prediction) {
            // we will hopefully have post id by later
            validatePrediction({ ...prediction, post_id: 100 });
          }

          if (
            typeof post.media_url === 'object' &&
            post.media_type === 'image'
          ) {
            const { uri, base64 } = post.media_url;

            if (!base64) {
              throw new Error('Missing base64 image data');
            }

            const fileExt = uri.split('.').pop();
            const fileName = `${uuidV4()}.${fileExt}`;
            const filePath = `${user_id}/${fileName}`;
            const { error } = await uploadImage(uri, base64, 'post', filePath);
            if (error) {
              throw error;
            }
            postWithUserId.media_url = filePath;
          }
          const result = await createPost.mutateAsync(postWithUserId);

          if (prediction && result) {
            prediction.post_id = result.id;
            await createPrediction.mutateAsync(prediction);
          }

          setLoading(false);
          if (result) {
            onGoToPost(result.id);
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        handleError(e);
        setLoading(false);
      }
    },
    [createPost, createPrediction, onGoToPost, user_id]
  );

  const onCancel = useCallback(
    (isDirty: boolean) => {
      if (isDirty) {
        alert(
          'Unsaved Changes',
          'You may have unsaved changes.',
          [{ text: 'Discard changes', onPress: onPopNavigation }],
          'Stay here'
        );
      } else {
        onPopNavigation();
      }
    },
    [onPopNavigation]
  );
  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={loading ? styles.flex : undefined}
    >
      <CreatePost loading={loading} onCancel={onCancel} onCreate={create} />
    </KeyboardAwareScrollView>
  );
};

export default CreatePostContainer;

const styles = StyleSheet.create({ flex: { flex: 1 } });
