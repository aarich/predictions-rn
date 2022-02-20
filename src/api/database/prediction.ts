import {
  CreatePredictionDraft,
  log,
  NotLoggedInError,
  Prediction,
  supabase,
  UserError,
} from '../../utils';
import { PAGE_SIZE } from '../commonApi';

export const createPrediction = async (
  prediction: CreatePredictionDraft
): Promise<Prediction> => {
  if (!prediction.user_id) {
    prediction.user_id = supabase.auth.user()?.id;
    if (!prediction.user_id) {
      throw new NotLoggedInError();
    }
  }

  const { data } = await supabase
    .from<Prediction>('prediction')
    .insert(prediction)
    .throwOnError();

  if (!data) {
    throw new Error('No data was created!');
  }

  data[0].like_status = 'none';

  return data[0];
};

export const deletePrediction = async (prediction: Prediction) => {
  if (prediction.original) {
    throw new UserError("You can't delete the original prediction");
  } else if (prediction.final) {
    throw new UserError("You can't delete the final outcome");
  }

  await supabase
    .from('prediction')
    .delete()
    .eq('id', prediction.id)
    .throwOnError();
};

export const getPredictions = async (
  _post_id: number,
  page_offset: number
): Promise<Prediction[]> => {
  log(`Querying predictions for post ${_post_id}. page: ${page_offset}`);

  const { data } = await supabase
    .rpc<Prediction>(`get_predictions`, {
      _post_id,
      page_offset,
      page_size: PAGE_SIZE,
    })
    .eq('original', false)
    .eq('final', false)
    .throwOnError();

  return data || [];
};

export const getSpecialPredictions = async (
  _post_id: number
): Promise<Prediction[]> => {
  log(`Querying special predictions for post ${_post_id}.`);

  const { data } = await supabase
    .rpc<Prediction>(`get_predictions`, {
      _post_id,
      page_offset: 0,
      page_size: 1000000,
    })
    .or('original.eq.true,final.eq.true')
    .throwOnError();

  return data || [];
};
