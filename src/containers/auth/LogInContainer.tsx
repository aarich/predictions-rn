import { useState } from 'react';
import LogIn from '../../components/auth/LogIn';
import { setNewUserUsername } from '../../redux/actions/thunk';
import { useAppDispatch } from '../../redux/store';
import {
  handleError,
  handleUserError,
  log,
  prompt,
  supabase,
  toast,
} from '../../utils';

const LogInContainer = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const signInWithEmail = (
    info: { email: string; password: string },
    createNew: boolean
  ) => {
    if (!info.email || !info.password) {
      handleUserError('Email and password are required');
      return;
    }
    setLoading(true);
    const loginPromise = createNew
      ? supabase.auth.signUp(info)
      : supabase.auth.signIn(info);

    loginPromise
      .then(({ error, user }) => {
        if (error) {
          if (error.status === 400) {
            handleUserError(error.message);
          } else {
            handleError(error);
          }
        } else if (createNew && user) {
          dispatch(setNewUserUsername(user.id));
        } else {
          log('Logged in existing user');
        }
      })
      .catch(handleError)
      .finally(() => setLoading(false));
  };

  const onForgotPassword = (email?: string) => {
    prompt(
      'Reset Password',
      'No problem, it happens. If the email entered below is valid you will receive instructions to reset your password soon.',
      { initialValue: email, placeholder: 'Email', okButton: 'Send' }
    ).then(([value, cancelled]) => {
      if (!cancelled) {
        setLoading(true);
        supabase.auth.api
          .resetPasswordForEmail(value)
          .then(({ error }) => {
            if (error) {
              handleError(error);
            } else {
              toast('Email will be delivered soon', 'success');
            }
          })
          .finally(() => setLoading(false));
      }
    });
  };

  return (
    <LogIn
      loading={loading}
      onSignInWithEmail={(info) => signInWithEmail(info, false)}
      onSignUpWithEmail={(info) => signInWithEmail(info, true)}
      onForgotPassword={onForgotPassword}
    />
  );
};

export default LogInContainer;
