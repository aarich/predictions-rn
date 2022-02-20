import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import {
  useDeletePost,
  useDeletePrediction,
  useToggleFollow,
  useUpdatePost,
} from '../../api/mutations';
import { usePost, useUnsplashPhotoInfo } from '../../api/queries';
import { HeaderButton, View } from '../../components/base';
import ViewPostContainer from '../../containers/post/ViewPostContainer';
import {
  alert,
  captureMessage,
  hasPassed,
  Icons,
  IconsOutlined,
  isMockEntity,
  log,
  MyAlertButton,
  Prediction,
  prompt,
  REFERRAL_PARAMS,
  RootStackScreenProps,
  sendReport,
  toast,
} from '../../utils';
import { useCurrentUserId } from '../../utils/hooks';

type Props = RootStackScreenProps<'ViewPost'>;

const ViewPostScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const [closePostVisible, setClosePostVisible] = useState(false);
  const [deletablePrediction, setDeletablePrediction] = useState<Prediction>();

  const post = usePost(id, () => log('error')).data;

  const currentUserId = useCurrentUserId();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost(id);
  const toggleFollow = useToggleFollow();
  const deletePrediction = useDeletePrediction();

  const unsplashPhotoInfo = useUnsplashPhotoInfo(post?.media_url);

  useEffect(() => {
    if (!post) {
      return;
    }

    const { user_id, followed_at, subject, check_date } = post;
    const isMock = isMockEntity(post);
    const isOwner = currentUserId === user_id;

    const onToggleFollow = () => {
      if (isMock) {
        alert(
          'Following',
          'Follow posts to keep track of them in your saved tab. You will also get a notification when it comes time to check in.'
        );
        return;
      }

      toggleFollow.mutate(post);
    };

    const deletePostAlert = () => {
      alert(
        'Are you sure?',
        'All data, including comments and predictions, will be lost',
        [
          {
            text: 'Delete it',
            style: 'destructive',
            onPress: () => {
              navigation.pop();
              deletePost.mutate(post);
            },
          },
        ]
      );
    };

    const actionOptions: MyAlertButton[] = [];

    const unsplashUrl = unsplashPhotoInfo.data?.links.html;
    if (!unsplashPhotoInfo.loading && unsplashUrl) {
      actionOptions.push({
        text: `Header by ${unsplashPhotoInfo.data?.user.name} on Unsplash`,
        onPress: () => Linking.openURL(`${unsplashUrl}?${REFERRAL_PARAMS}`),
        icon: IconsOutlined.externalLink,
      });
    }

    if (isOwner) {
      const requestToFeature = () => {
        prompt(
          'Request to be Featured',
          'Thanks for your interest! Feel free to include a quick note saying why this should be featured.',
          { okButton: 'Submit', multiline: true }
        ).then(([message, cancelled]) => {
          if (!cancelled) {
            captureMessage('Request feature', {
              extra: { postId: id, message },
            });
            toast('Request sent!');
          }
        });
      };

      if (!post.is_featured) {
        actionOptions.push({
          text: 'Request to be featured',
          onPress: requestToFeature,
        });
      }

      if (!check_date || !hasPassed(post)) {
        actionOptions.push({
          text: 'Mark as completed',
          onPress: () => setClosePostVisible(true),
        });
      }

      actionOptions.push({
        text: 'Delete',
        style: 'destructive',
        onPress: deletePostAlert,
      });
    } else {
      actionOptions.push({
        text: 'Report',
        onPress: () => sendReport('Report post', { id: post.id }),
      });
    }

    if (deletablePrediction) {
      const deletePredictionAlert = () => {
        alert('Are you sure?', 'All data, including comments, will be lost.', [
          {
            text: 'Delete it',
            style: 'destructive',
            onPress: () => deletePrediction.mutate(deletablePrediction),
          },
        ]);
      };
      actionOptions.push({
        text: 'Delete selected prediction',
        style: 'destructive',
        onPress: deletePredictionAlert,
      });
    }

    const onPressActions = () => alert('Actions', undefined, actionOptions);

    navigation.setOptions({
      title: subject.length > 20 ? 'Post' : subject,
      headerRight: () => (
        <View row>
          <HeaderButton
            icon={(followed_at ? Icons : IconsOutlined).bookmark}
            onPress={onToggleFollow}
          />
          <HeaderButton icon={Icons.moreH} onPress={onPressActions} />
        </View>
      ),
    });
  }, [
    currentUserId,
    deletablePrediction,
    deletePost,
    deletePrediction,
    id,
    navigation,
    post,
    toggleFollow,
    unsplashPhotoInfo.data?.links.html,
    unsplashPhotoInfo.data?.user.name,
    unsplashPhotoInfo.loading,
    updatePost,
  ]);

  return (
    <ViewPostContainer
      id={id}
      closePostVisible={closePostVisible}
      setClosePostVisible={setClosePostVisible}
      setDeletablePrediction={setDeletablePrediction}
    />
  );
};

export default ViewPostScreen;
