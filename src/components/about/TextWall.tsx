import { Layout } from '@ui-kitten/components';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { keyed } from '../../utils';

type Props = {
  elements: ReactNode[];
};

const TextWall = ({ elements }: Props) => {
  const paddingBottom = useSafeAreaInsets().bottom;
  return (
    <Layout level="2" style={[styles.flex, { paddingBottom }]}>
      <ScrollView>{keyed([...elements])}</ScrollView>
    </Layout>
  );
};

export default TextWall;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
