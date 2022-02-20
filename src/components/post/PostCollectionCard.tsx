import { Image, StyleSheet } from 'react-native';
import PostActionBarContainer from '../../containers/post/PostActionBarContainer';
import { Post, Spacings } from '../../utils';
import { usePostMediaImage } from '../../utils/hooks';
import { Badge, Card, Text, View } from '../base';

type Props = {
  onPress: () => void;
  post: Post;
};

const PostCollectionCard = ({ post, onPress }: Props) => {
  const image = usePostMediaImage(post);

  return (
    <View row style={styles.container}>
      <Card onPress={onPress} flex style={styles.card}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : null}

        {post.is_featured ? (
          <View row right style={styles.featured}>
            <Badge label="Featured" />
          </View>
        ) : null}

        <View style={styles.content}>
          <Text category="h4" center style={styles.title}>
            {post.subject}
          </Text>
        </View>

        <PostActionBarContainer post={post} onPressActionDefault={onPress} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  featured: { marginRight: Spacings.s2, marginTop: Spacings.s2 },
  card: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: { paddingHorizontal: 16, paddingVertical: 14 },
  container: { margin: 10 },
  image: { width: '100%', aspectRatio: 16 / 6 },
  title: { paddingHorizontal: 20 },
});

export default PostCollectionCard;
