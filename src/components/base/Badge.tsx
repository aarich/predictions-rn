import { EvaStatus } from '@ui-kitten/components/devsupport';
import { StyleSheet } from 'react-native';
import { Button } from './io';

type Props = {
  label: string;
  status?: EvaStatus;
};

const Badge = ({ label, status = 'primary' }: Props) => {
  return (
    <Button label={label} status={status} style={styles.button} size="tiny" />
  );
};

export default Badge;

const styles = StyleSheet.create({
  button: { marginLeft: 5, borderRadius: 20 },
});
