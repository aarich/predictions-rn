import { Layout } from '@ui-kitten/components';
import { useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreatePostContainer from '../../containers/post/CreatePostContainer';
import { RootStackScreenProps, Spacings } from '../../utils';

type Props = RootStackScreenProps<'CreatePost'>;

const CreatePostScreen = ({ navigation }: Props) => {
  const safeInsets = useSafeAreaInsets();
  const style: StyleProp<ViewStyle> = {
    paddingTop: safeInsets.top,
    paddingBottom: safeInsets.bottom,
    flex: 1,
    paddingHorizontal: Spacings.s4,
  };

  const goToPost = useCallback(
    (id) => navigation.replace('ViewPost', { id }),
    [navigation]
  );

  const onPopNavigation = useCallback(() => navigation.pop(), [navigation]);

  return (
    <Layout style={style}>
      <CreatePostContainer
        onGoToPost={goToPost}
        onPopNavigation={onPopNavigation}
      />
    </Layout>
  );
};

export default CreatePostScreen;
