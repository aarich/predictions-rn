import moment from 'moment';
import { OutputTableData } from '../../components/base/OutputTable';
import PostInfoHeader from '../../components/post/PostInfoHeader';
import { formatTimeAgo, hasPassed, IconsOutlined, Post } from '../../utils';

type Props = {
  post: Post;
  onPressComment: () => void;
  onPressPredict: () => void;
};

const formatDate = (check_date?: string) => {
  let relativeDate: string | undefined;
  let actualDate: string | undefined;
  if (check_date) {
    relativeDate = formatTimeAgo(check_date, 'round');
    actualDate = moment(check_date).format('llll');
  }

  return { relativeDate, actualDate };
};

const PostInfoHeaderContainer = ({
  post,
  onPressComment,
  onPressPredict,
}: Props) => {
  const { url, check_date, tags, outcome_test } = post;

  const isPassed = hasPassed(post);
  const { relativeDate, actualDate } = formatDate(check_date);

  const data: OutputTableData[] = [
    {
      label: isPassed ? 'Closed' : 'Check-in',
      value: relativeDate,
      icon: IconsOutlined.clock,
      tooltip: `Completed ${actualDate}`,
    },
    { label: 'Tags', value: tags?.join(', ') || undefined },
    { label: 'Validation', value: outcome_test || undefined },
  ];

  if (url) {
    data.push({ label: 'Link', value: url, link: true });
  }

  return (
    <PostInfoHeader
      post={post}
      data={data}
      onPressComment={onPressComment}
      onPressPredict={onPressPredict}
    />
  );
};

export default PostInfoHeaderContainer;
