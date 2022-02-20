import moment from 'moment';
import { ComponentProps, useRef } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
  alert,
  getUrlDisplay,
  Icons,
  OutcomeType,
  Post,
  Prediction,
  SourceType,
  Spacings,
} from '../../utils';
import { Card, ExpandableSection, IconButton, Text, View } from '../base';
import { a } from '../base/Anchor';
import { ExpandableSectionRef } from '../base/ExpandableSection';
import PostedByWithTime from '../social/PostedByWithTime';

type Props = {
  post: Post;
  prediction: Prediction;
  selected: boolean;
  onSelect: VoidFunction;
  onPressLike: (isUp: boolean) => void;

  style: StyleProp<ViewStyle>;
};

const getPostedByMessage = (source: SourceType, author?: string): string =>
  author
    ? `- ${author} (${source})`
    : {
        [SourceType.ARTICLE]: 'From an article',
        [SourceType.MOVIE]: 'From a movie',
        [SourceType.NEWS]: 'From the news',
        [SourceType.POLITICS]: 'From politics',
        [SourceType.SCIENCE]: 'From science',
        [SourceType.TV_SHOW]: 'From a TV series',
        [SourceType.RELIGION]: 'From religion',
        [SourceType.PERSONAL]: '',
        [SourceType.OTHER]: '',
      }[source];

const getIconButtonProps = ({
  original,
  username,
  final,
}: Prediction): ComponentProps<typeof IconButton> | undefined => {
  if (original) {
    return {
      name: Icons.award,
      onPress: () =>
        alert(
          'Original prediction',
          `${username} included it when the post was created`
        ),
    };
  } else if (final) {
    return {
      name: Icons.checkmarkCircle,
      onPress: () =>
        alert(
          'Final Outcome',
          `${username} indicated this was the actual outcome`
        ),
    };
  }
};

const PredictionWheelCard = ({
  post,
  prediction,
  selected,
  onSelect,
  onPressLike,

  style,
}: Props) => {
  const { source_type, author, url } = prediction;

  const expandableRef = useRef<ExpandableSectionRef>(null);

  const sourceMessage = getPostedByMessage(source_type, author);

  const { num_comments, comment, like_status } = prediction;
  let commentMessage: string | undefined;
  if (num_comments) {
    commentMessage = `${num_comments} comment${num_comments > 1 ? 's' : ''}`;
  }

  let { value } = prediction;
  switch (post.outcome_type) {
    case OutcomeType.DATE:
      value = moment(value).format('LL');
      break;
    case OutcomeType.YESNO:
      if (source_type !== SourceType.PERSONAL) {
        value += ' (' + source_type + ')';
      }
      break;
  }

  const iconButtonProps = getIconButtonProps(prediction);

  const header = (
    <View row>
      {iconButtonProps ? (
        <View center>
          <IconButton
            size="small"
            style={styles.originalButton}
            status="control"
            {...iconButtonProps}
          />
        </View>
      ) : null}
      <Text s1 selectable={false}>
        {value}
      </Text>
    </View>
  );

  return (
    <Card
      padded
      status={selected ? 'primary' : 'info'}
      style={style}
      onPress={expandableRef.current?.press}
    >
      <ExpandableSection
        ref={expandableRef}
        sectionHeader={selected ? undefined : header}
        expanded={selected}
        onPress={onSelect}
      >
        <View row spread>
          <View style={styles.leftContent}>
            {header}
            {sourceMessage ? <Text category="p2">{sourceMessage}</Text> : null}
            {comment ? <Text category="s2">{comment}</Text> : null}
            {url
              ? a(url, getUrlDisplay(url), { showIcon: true, category: 'p2' })
              : null}
            <View row style={styles.attribution}>
              <PostedByWithTime
                entity={prediction}
                category="c1"
                additionalText={[commentMessage]}
              />
            </View>
          </View>

          <View spread>
            <IconButton
              name={Icons.arrowUp}
              status={like_status === 'liked' ? 'danger' : 'basic'}
              onPress={() => onPressLike(true)}
              style={styles.upVote}
            />
            <IconButton
              name={Icons.arrowDown}
              status={like_status === 'disliked' ? 'warning' : 'basic'}
              onPress={() => onPressLike(false)}
              style={styles.downVote}
            />
          </View>
        </View>
      </ExpandableSection>
    </Card>
  );
};

export default PredictionWheelCard;

const styles = StyleSheet.create({
  attribution: { flexWrap: 'wrap' },
  leftContent: { flexShrink: 1 },
  originalButton: { paddingRight: Spacings.s2 },
  upVote: { marginLeft: Spacings.s2, paddingVertical: Spacings.s1 },
  downVote: { marginLeft: Spacings.s2, paddingVertical: Spacings.s1 },
});
