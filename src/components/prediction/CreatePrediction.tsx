import { Input } from '@ui-kitten/components';
import { useCallback, useRef } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import {
  CreatePredictionDraft,
  Icons,
  MyConstants,
  OutcomeType,
  SourceType,
  Spacings,
} from '../../utils';
import {
  Button,
  DropdownPicker,
  HeaderButton,
  PickerOption,
  Text,
  TextField,
  View,
} from '../base';
import PredictionInput from './PredictionInput';

export const INITIAL_PREDICTION_DRAFT: CreatePredictionDraft = {
  ...(MyConstants.isScreenshotting
    ? {
        value: '25000101T000000-0400',
        comment: "If we're still alive by then",
        source_type: SourceType.MOVIE,
        url: 'https://www.imdb.com/title/tt0114898/',
        author: 'Waterworld (1995)',
      }
    : { value: '', comment: '', source_type: SourceType.PERSONAL }),
  original: false,
  final: false,
  user_id: '',
  post_id: 0,
};

type Props = {
  onCreate?: () => void;
  onCancel?: () => void;
  outcomeType: OutcomeType;
  draft: CreatePredictionDraft;
  final?: boolean;
  setDraftWrapper: (updates: Partial<CreatePredictionDraft>) => void;
};

const getLabelFromSourceType = (type: SourceType): string =>
  ({
    [SourceType.NEWS]: 'Someone in the news made it',
    [SourceType.MOVIE]: 'I saw it in a movie',
    [SourceType.ARTICLE]: 'I read it in an article',
    [SourceType.PERSONAL]: 'This is my prediction',
    [SourceType.POLITICS]: 'A politician made it',
    [SourceType.SCIENCE]: 'A scientist made it',
    [SourceType.RELIGION]: 'A religion predicts it',
    [SourceType.TV_SHOW]: 'I saw it in a TV Series',
    [SourceType.OTHER]: 'Something else',
  }[type]);

const getAttributionPlaceholderFromSourceType = (type: SourceType): string => {
  switch (type) {
    case SourceType.ARTICLE:
      return 'e.g. Who wrote the article?';
    case SourceType.MOVIE:
      return 'e.g. Name of movie/character/writer';
    case SourceType.OTHER:
      return 'Where did this prediction come from?';
    default:
      return 'Who made this prediction?';
  }
};

const SOURCE_TYPE_OPTIONS: PickerOption<SourceType>[] = Object.values(
  SourceType
)
  .sort((s1) => (s1 === SourceType.PERSONAL ? -1 : 1))
  .map((type) => ({
    label: getLabelFromSourceType(type),
    value: type,
  }));

const CreatePrediction = ({
  onCancel,
  onCreate,
  outcomeType,
  draft,
  final = false,
  setDraftWrapper,
}: Props) => {
  const setDraft = useCallback(
    <T extends keyof CreatePredictionDraft>(key: T) =>
      (newValue: CreatePredictionDraft[T]) =>
        setDraftWrapper({ [key]: newValue }),
    [setDraftWrapper]
  );

  const attributionRef = useRef<Input>(null);
  const commentRef = useRef<Input>(null);
  const urlRef = useRef<Input>(null);
  const showAttribution = draft.source_type !== SourceType.PERSONAL;

  const title = final ? 'Final Outcome' : 'Create Prediction';
  return (
    <Pressable style={styles.scroll} onPress={() => Keyboard.dismiss()}>
      {onCancel ? (
        <View row>
          <View flex>
            <Text category="h6">{title}</Text>
          </View>
          <View center>
            <HeaderButton icon={Icons.close} onPress={onCancel} />
          </View>
        </View>
      ) : null}
      <PredictionInput
        final
        value={draft.value}
        onChangeValue={setDraft('value')}
        style={styles.item}
        outcomeType={outcomeType}
        onNext={() =>
          showAttribution
            ? attributionRef.current?.focus()
            : commentRef.current?.focus()
        }
      />
      {final ? null : (
        <DropdownPicker
          label="Source"
          description="Where did this prediction come from?"
          options={SOURCE_TYPE_OPTIONS}
          onValueChange={setDraft('source_type')}
          selectedValue={draft.source_type}
          style={styles.item}
        />
      )}
      {showAttribution ? (
        <TextField
          ref={attributionRef}
          label="Attribution (optional)"
          placeholder={getAttributionPlaceholderFromSourceType(
            draft.source_type
          )}
          value={draft.author}
          onChangeText={setDraft('author')}
          style={styles.item}
          returnKeyType="next"
          onSubmitEditing={() => commentRef.current?.focus()}
        />
      ) : null}
      <TextField
        ref={commentRef}
        label="Comment (optional)"
        placeholder="Share a bit more if you like"
        value={draft.comment}
        onChangeText={setDraft('comment')}
        style={styles.item}
        returnKeyType="next"
        onSubmitEditing={() => urlRef.current?.focus()}
      />
      <TextField
        ref={urlRef}
        label="Related Site (optional)"
        placeholder="Specify a URL to a relevant webpage"
        value={draft.url}
        onChangeText={setDraft('url')}
        style={styles.item}
        returnKeyType="go"
        onSubmitEditing={onCreate}
      />
      {onCreate ? (
        <Button label="Save" onPress={onCreate} style={styles.item} />
      ) : null}
    </Pressable>
  );
};

export default CreatePrediction;

const styles = StyleSheet.create({
  item: { marginVertical: Spacings.s1 },
  scroll: { minWidth: '85%' },
});
