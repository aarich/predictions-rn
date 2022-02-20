import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';
import { useCreatePrediction } from '../../api/mutations';
import { CenteredModal } from '../../components/base';
import CreatePrediction, {
  INITIAL_PREDICTION_DRAFT,
} from '../../components/prediction/CreatePrediction';
import {
  alert,
  CreatePredictionDraft,
  handleError,
  Post,
  validatePrediction,
} from '../../utils';

type Props = {
  post: Post;
  visible: boolean;
  final?: boolean;
  onClose: VoidFunction;
  onCreatedPrediction: (id: number) => void;
};

const CreatePredictionModalContainer = ({
  post,
  visible,
  final = false,
  onClose,
  onCreatedPrediction,
}: Props) => {
  const [draft, setDraft] = useState({
    ...INITIAL_PREDICTION_DRAFT,
    post_id: post.id,
    final,
  });
  const [isDirty, setIsDirty] = useState(false);

  const createPrediction = useCreatePrediction();

  const setDraftWrapper = useCallback(
    (updates: Partial<CreatePredictionDraft>) => {
      setDraft((old) => ({ ...old, ...updates }));
      setIsDirty(true);
    },
    []
  );

  const onCancel = () => {
    Keyboard.dismiss();
    if (isDirty) {
      alert(
        'You have unsaved changes',
        undefined,
        [{ text: 'Leave', style: 'destructive', onPress: onClose }],
        'Stay here'
      );
    } else {
      onClose();
    }
  };

  const onCreate = () => {
    try {
      validatePrediction(draft);
    } catch (error) {
      handleError(error);
      return;
    }

    createPrediction
      .mutateAsync(draft)
      .then((pred) => {
        onClose();
        pred && onCreatedPrediction(pred.id);
      })
      .catch(handleError);
  };

  return (
    <CenteredModal avoidKeyboard visible={visible} onRequestClose={onClose}>
      <CreatePrediction
        onCancel={onCancel}
        onCreate={onCreate}
        outcomeType={post.outcome_type}
        draft={draft}
        final={final}
        setDraftWrapper={setDraftWrapper}
      />
    </CenteredModal>
  );
};
export default CreatePredictionModalContainer;
