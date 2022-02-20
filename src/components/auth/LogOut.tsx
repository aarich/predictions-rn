import { StyleSheet } from 'react-native';
import { Spacings } from '../../utils';
import { Button, Text, View } from '../base';

type Props = { onLogOut: VoidFunction };

const LogOut = ({ onLogOut }: Props) => {
  return (
    <View flex center>
      <Text h3 center>
        Are you sure?
      </Text>
      <View style={styles.button}>
        <Button onPress={onLogOut} label="Log me out" />
      </View>
    </View>
  );
};

export default LogOut;

const styles = StyleSheet.create({
  button: {
    marginTop: Spacings.s5,
    margin: Spacings.s10,
  },
});
