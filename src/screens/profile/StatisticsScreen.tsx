import { useEffect } from 'react';
import { LoadingWrapper } from '../../components/base';
import Statistics from '../../components/profile/Statistics';
import { getProfile } from '../../redux/actions/thunk';
import { useAppDispatch } from '../../redux/store';
import { handleError, supabase } from '../../utils';
import { useCurrentUser } from '../../utils/hooks';

const StatisticsScreen = () => {
  const profile = useCurrentUser();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const userId = supabase.auth.user()?.id;
    if (!profile && userId) {
      dispatch(getProfile(userId)).catch(handleError);
    }
  });

  return profile ? (
    <Statistics profile={profile} />
  ) : (
    <LoadingWrapper flex loading />
  );
};

export default StatisticsScreen;
