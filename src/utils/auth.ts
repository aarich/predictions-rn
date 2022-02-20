import {
  animals,
  colors,
  NumberDictionary,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { handleError, prompt, toast } from './interactions';
import { supabase } from './supabase';

const numbersDictionary = NumberDictionary.generate({ length: 5 });

export const handlePasswordReset = (accessToken: string) => {
  prompt('Enter a new password', undefined, {
    secureTextEntry: true,
    okButton: 'Reset',
  }).then(([password, cancelled]) => {
    !cancelled &&
      supabase.auth.api
        .updateUser(accessToken, { password })
        .then(({ error }) => {
          if (error) {
            handleError(error);
          } else {
            toast('Success');
          }
        });
  });
};

export const generateUsername = () => {
  const dictionaries = [colors, animals, numbersDictionary];
  return uniqueNamesGenerator({ dictionaries, length: 2, separator: ' ' });
};
