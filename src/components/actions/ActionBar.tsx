import { EvaStatus } from '@ui-kitten/components/devsupport';
import { StyleSheet } from 'react-native';
import {
  formatNumber,
  Icons,
  IconsOutlined,
  IconType,
  LikeableEntity,
  Post,
  Spacings,
} from '../../utils';
import { StatefulIcon, TimeAgo, View } from '../base';

type Props<T extends LikeableEntity> = {
  onPressComment: () => void;
  onPressPredict?: () => void;
  onPressLike: (didPressup: boolean) => void;
  onPressShare: () => void;
  showTime: boolean;
  entity: T;
};

const isPost = (e: LikeableEntity): e is Post => 'num_predictions' in e;

const ActionBar = <T extends LikeableEntity = LikeableEntity>({
  onPressComment,
  onPressPredict,
  onPressLike,
  onPressShare,
  showTime,
  entity,
}: Props<T>) => {
  const { like_status, num_comments, num_dislikes, num_likes, created_at } =
    entity;
  const renderVote = (up: boolean) => {
    let icon: IconType;
    let status: EvaStatus | undefined = undefined;
    let count: number;

    if (up) {
      const liked = like_status === 'liked';
      icon = (liked ? Icons : IconsOutlined).arrowUp;

      if (liked) {
        status = 'danger';
      }
      count = num_likes;
    } else {
      const disliked = like_status === 'disliked';
      icon = (disliked ? Icons : IconsOutlined).arrowDown;

      if (disliked) {
        status = 'warning';
      }
      count = num_dislikes;
    }

    const showCount = num_dislikes + num_likes > 5;

    return (
      <StatefulIcon
        icon={icon}
        onPress={() => onPressLike(up)}
        status={status}
        subtitle={showCount ? formatNumber(count) : undefined}
      />
    );
  };

  const renderPredictions = () =>
    isPost(entity) ? (
      <StatefulIcon
        icon={IconsOutlined.bulb}
        subtitle={formatNumber(entity.num_predictions)}
        onPress={onPressPredict}
      />
    ) : null;

  const renderComments = () => (
    <StatefulIcon
      icon={IconsOutlined.messageCircle}
      subtitle={formatNumber(num_comments)}
      onPress={onPressComment}
    />
  );

  const renderTime = () =>
    showTime ? (
      <View center>
        <TimeAgo appearance="hint" s2 italic time={created_at} />
      </View>
    ) : null;

  const renderShare = () => (
    <StatefulIcon
      icon={IconsOutlined.share}
      onPress={onPressShare}
      subtitle="Share"
    />
  );

  return (
    <View style={styles.actionRow} row spread>
      <View row>
        {renderVote(true)}
        {renderVote(false)}
      </View>
      {renderPredictions()}
      {renderComments()}
      {renderShare()}
      {renderTime()}
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    marginHorizontal: Spacings.s3,
    marginVertical: Spacings.s2,
  },
});

export default ActionBar;
