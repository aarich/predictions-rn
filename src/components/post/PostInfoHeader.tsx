import { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import PostActionBarContainer from '../../containers/post/PostActionBarContainer';
import { Post, Spacings } from '../../utils';
import { usePostMediaImage } from '../../utils/hooks';
import { Card, OutputTable, Text, View } from '../base';
import { OutputTableData } from '../base/OutputTable';
import PostedByWithTime from '../social/PostedByWithTime';

type Props = {
  post: Post;
  onPressComment: () => void;
  onPressPredict: () => void;
  data: OutputTableData[];
};

const PostInfoHeader = ({
  post,
  data,
  onPressComment,
  onPressPredict,
}: Props) => {
  const image = usePostMediaImage(post);
  const { subject, description } = post;

  return (
    <View row style={styles.container}>
      <Card flex style={styles.card} disabled>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : null}

        <View style={styles.content}>
          <PostedByWithTime entity={post} showAvatar style={styles.postedBy} />

          <Text category="h6">{subject}</Text>
          {description ? <Text>{post.description}</Text> : null}
          <OutputTable data={data} />
        </View>

        <PostActionBarContainer
          post={post}
          showTime={false}
          onPressComment={onPressComment}
          onPressPredict={onPressPredict}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: { paddingHorizontal: 16, paddingVertical: 14 },
  container: { margin: 10 },
  image: { width: '100%', aspectRatio: 16 / 6 },
  postedBy: { marginBottom: Spacings.s2 },
});

export default memo(PostInfoHeader);
