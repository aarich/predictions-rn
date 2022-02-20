import { Profile } from '../../utils';
import { useAppSelector } from '../store';

export const useProfile = (id: string | undefined): Profile | undefined => {
  const profiles = useAppSelector((state) => state.profiles);
  if (id) {
    return profiles[id];
  }
};
