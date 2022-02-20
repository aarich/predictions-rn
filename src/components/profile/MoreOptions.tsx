import { Divider, Layout } from '@ui-kitten/components';
import { FlatList, StyleSheet } from 'react-native';
import {
  IconType,
  RootStackParamList,
  RootStackScreenInfo,
  Spacings,
} from '../../utils';
import { ListItem } from '../base';

type Props = {
  onGoToScreen: (name: keyof RootStackParamList) => void;
  items: (Omit<RootStackScreenInfo, 'screen'> | ActionInfo | null)[];
};

export type ActionInfo = {
  title: string;
  description?: string;
  onPress: VoidFunction;
  icon: IconType;
};

const MoreOptions = ({ items, onGoToScreen }: Props) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(_, index) => `${index}`}
      renderItem={({ item }) => {
        if (!item) {
          return <Layout level="2" style={styles.divider} />;
        } else {
          const title =
            'name' in item ? item.options?.title || item.name : item.title;
          const onPress =
            'name' in item ? () => onGoToScreen(item.name) : item.onPress;
          const description =
            'description' in item ? item.description : undefined;

          return (
            <>
              <ListItem
                onPress={onPress}
                icon={item.icon}
                title={title}
                description={description}
              />
              <Divider />
            </>
          );
        }
      }}
    />
  );
};

export default MoreOptions;

const styles = StyleSheet.create({ divider: { height: Spacings.s3 } });
