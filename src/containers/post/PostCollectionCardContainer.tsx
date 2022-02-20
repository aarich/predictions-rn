import PostCollectionCard from '../../components/post/PostCollectionCard';
import { Post } from '../../utils';

type Props = { post: Post; onNavigateToPost: (id: number) => void };

const PostCollectionCardContainer = ({ post, onNavigateToPost }: Props) => {
  return (
    <PostCollectionCard post={post} onPress={() => onNavigateToPost(post.id)} />
  );
};

export default PostCollectionCardContainer;
