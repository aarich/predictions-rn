import { Input } from '@ui-kitten/components';
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Spacings } from '../../utils';
import { Button, LoadingWrapper, Text, View } from '../base';

type SignInFn = (info: { email: string; password: string }) => void;

type Props = {
  loading: boolean;
  onSignInWithEmail: SignInFn;
  onSignUpWithEmail: SignInFn;
  onForgotPassword: (email: string) => void;
};

const LogIn = ({
  loading,
  onSignInWithEmail,
  onSignUpWithEmail,
  onForgotPassword,
}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const passwordRef = useRef<Input>(null);

  return (
    <LoadingWrapper flex loading={loading}>
      <View flex center style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', default: 'height' })}
        >
          <View>
            <Text h3 center>
              Welcome
            </Text>
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Email"
              onChangeText={setEmail}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Input
              ref={passwordRef}
              label="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize="none"
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType="done"
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              label="Sign In"
              onPress={() => onSignInWithEmail({ email, password })}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              label="Sign Up"
              onPress={() => onSignUpWithEmail({ email, password })}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              label="Forgot Password"
              ghost
              status="basic"
              onPress={() => onForgotPassword(email)}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </LoadingWrapper>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacings.s3 },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
