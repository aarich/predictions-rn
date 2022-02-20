import { Input } from '@ui-kitten/components';
import { useCallback, useRef, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import {
  CreatePostDraft,
  CreatePredictionDraft,
  getResizedImage,
  Icons,
  isTag,
  OutcomeType,
  Spacings,
  TagType,
} from '../../utils';
import { useCurrentUserId } from '../../utils/hooks';
import {
  Button,
  ChipsInput,
  DatePicker,
  DropdownPicker,
  ExpandableSection,
  HeaderButton,
  LoadingWrapper,
  PickerOption,
  Text,
  TextField,
  TimePicker,
  View,
} from '../base';
import { ExpandableSectionRef } from '../base/ExpandableSection';
import { ChipsInputRef } from '../base/io/ChipsInput';
import FormCheckBox from '../base/io/FormCheckBox';
import CreatePrediction, {
  INITIAL_PREDICTION_DRAFT,
} from '../prediction/CreatePrediction';

type Props = {
  loading: boolean;

  onCancel: (isDirty: boolean) => void;
  onCreate: (
    post: Partial<CreatePostDraft>,
    prediction: CreatePredictionDraft | undefined
  ) => void;
};

const initialDraft: Partial<CreatePostDraft> = {
  subject: '',
  tags: [],
  outcome_type: OutcomeType.NONE,
  outcome_test: '',
  is_public: true,
};

const getLabelFromOutcomeType = (type: OutcomeType): string => {
  switch (type) {
    case OutcomeType.YESNO:
      return 'Yes/No';
    case OutcomeType.DATE:
      return 'Date';
    case OutcomeType.NUMERIC:
      return 'Number';
    case OutcomeType.NONE:
      return 'None';
  }
};

const OUTCOME_TYPE_OPTIONS: PickerOption<OutcomeType>[] = Object.values(
  OutcomeType
)
  .sort((s) => (s === OutcomeType.NONE ? -1 : 1))
  .map((type) => ({
    label: getLabelFromOutcomeType(type),
    value: type,
  }));

const CreatePost = ({ loading, onCancel, onCreate }: Props) => {
  const [draft, setDraftAction] = useState(initialDraft);
  const [isDirty, setIsDirty] = useState(false);
  const [predictionDraft, setPredictionDraft] = useState({
    ...INITIAL_PREDICTION_DRAFT,
    user_id: useCurrentUserId(),
    original: true,
  });

  const setDraftWrapper = useCallback((updates: Partial<CreatePostDraft>) => {
    setDraftAction((old) => ({ ...old, ...updates }));
    setIsDirty(true);
  }, []);

  const setDraft = useCallback(
    <T extends keyof CreatePostDraft>(key: T) =>
      (newValue: CreatePostDraft[T]) =>
        setDraftWrapper({ [key]: newValue }),
    [setDraftWrapper]
  );

  const addPhoto = () =>
    getResizedImage('Add a photo to your post', true).then((media_url) => {
      if (media_url) {
        setDraftWrapper({ media_url, media_type: 'image' });
      }
    });

  const clearPhoto = () =>
    setDraftWrapper({ media_type: undefined, media_url: undefined });

  const addPredRef = useRef<ExpandableSectionRef>(null);
  const [addPred, setAddPred] = useState(false);

  const tagsRef = useRef<ChipsInputRef>(null);
  const descRef = useRef<Input>(null);
  const urlRef = useRef<Input>(null);

  return (
    <LoadingWrapper loading={loading} flex>
      <View flex>
        <View row>
          <View flex>
            <Text h3>Post Something</Text>
          </View>
          <View center>
            <HeaderButton
              icon={Icons.close}
              onPress={() => onCancel(isDirty)}
            />
          </View>
        </View>

        <TextField
          label="Subject"
          value={draft.subject}
          onChangeText={setDraft('subject')}
          style={styles.item}
          returnKeyType="next"
          onSubmitEditing={() => tagsRef.current?.focus()}
          placeholder="Title your post"
        />
        <ChipsInput
          ref={tagsRef}
          label="Tags"
          values={draft?.tags}
          placeholder="Add tags"
          onValidateValue={isTag}
          onChangeValues={setDraft('tags')}
          allowedValues={Object.values(TagType)}
        />
        <DropdownPicker
          label="Outcome Type Restriction"
          description="What does the outcome look like?"
          options={OUTCOME_TYPE_OPTIONS}
          onValueChange={setDraft('outcome_type')}
          selectedValue={draft?.outcome_type ?? OUTCOME_TYPE_OPTIONS[0].value}
          style={styles.item}
        />
        <FormCheckBox
          checked={!!draft.check_date}
          onPress={() =>
            setDraftWrapper({
              check_date: draft.check_date ? undefined : new Date(),
            })
          }
          title="Include Check Date"
          tooltip="When should we check the outcome of this prediction?"
          style={styles.item}
        />
        {draft.check_date ? (
          <>
            <DatePicker
              label="Check Date"
              date={draft.check_date}
              onSelect={(date) => {
                const prev = draft.check_date;
                if (prev) {
                  // date picker does not maintain the time value
                  date.setHours(
                    prev.getHours(),
                    prev.getMinutes(),
                    prev.getSeconds(),
                    prev.getMilliseconds()
                  );
                }
                setDraftWrapper({ check_date: date });
              }}
              style={styles.item}
              min={new Date()}
            />
            <TimePicker
              label="Check Time"
              value={draft.check_date || new Date(Date.now())}
              onChangeValue={(date) => setDraftWrapper({ check_date: date })}
            />
          </>
        ) : null}
        <TextField
          label="Testing Criteria (optional)"
          placeholder="How will we know the outcome?"
          value={draft.outcome_test}
          onChangeText={setDraft('outcome_test')}
          style={styles.item}
          returnKeyType="next"
          onSubmitEditing={() => descRef.current?.focus()}
        />
        <TextField
          ref={descRef}
          label="Description (optional)"
          placeholder="Share a bit more about this event"
          value={draft.description}
          onChangeText={setDraft('description')}
          style={styles.item}
          returnKeyType="next"
          onSubmitEditing={() => urlRef.current?.focus()}
        />
        <TextField
          ref={urlRef}
          label="Related Site (optional)"
          placeholder="Specify a URL to a related webpage"
          value={draft.url}
          onChangeText={setDraft('url')}
          style={styles.item}
          returnKeyType="done"
          keyboardType="url"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <FormCheckBox
          title="This is public"
          tooltip="Making a post public means anyone can find, comment, and share. Only you can find and comment on private posts."
          checked={!!draft.is_public}
          onPress={() => setDraftWrapper({ is_public: !draft.is_public })}
          style={styles.item}
        />

        <ExpandableSection
          ref={addPredRef}
          expanded={addPred}
          sectionHeader={
            <View row style={styles.item}>
              <FormCheckBox
                title="Add an original prediction"
                tooltip="If this event is associated with an original prediction by you or somebody else, add it here."
                onPress={() => addPredRef.current?.press()}
                checked={addPred}
              />
            </View>
          }
          onPress={() => setAddPred((b) => !b)}
        >
          <CreatePrediction
            outcomeType={draft.outcome_type as OutcomeType}
            draft={predictionDraft}
            setDraftWrapper={(updates) =>
              setPredictionDraft((old) => ({ ...old, ...updates }))
            }
          />
        </ExpandableSection>
        <Button
          outline
          label={draft.media_url ? 'Clear Photo' : 'Add Photo'}
          onPress={draft.media_url ? clearPhoto : addPhoto}
          style={styles.item}
          status={draft.media_url ? 'basic' : 'primary'}
        />
        <Button
          label="Save"
          onPress={() => onCreate(draft, addPred ? predictionDraft : undefined)}
        />
      </View>
    </LoadingWrapper>
  );
};

export default CreatePost;

const styles = StyleSheet.create({
  item: { marginVertical: Spacings.s1 },
});
