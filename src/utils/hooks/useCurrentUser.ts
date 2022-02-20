import { useEffect, useState } from 'react';
import { useProfile } from '../../redux/selectors';
import { supabase } from '../supabase';
import { Profile } from '../typesDB';

export const useCurrentUserId = (): string | undefined => {
  const [id, setId] = useState<string>();

  useEffect(() => {
    const { data: unsubscribe } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setId(session?.user?.id);
      }
    );
    setId(supabase.auth.user()?.id);

    return () => unsubscribe?.unsubscribe();
  }, []);

  return id;
};

export const useCurrentUser = (): Profile | undefined =>
  useProfile(useCurrentUserId());
