import { Layout } from '@ui-kitten/components';
import { ComponentProps, useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import {
  ActionInfo,
  default as MoreOptions,
  default as ProfileOptions,
} from '../../components/profile/MoreOptions';
import { IconsOutlined, isNotificationsEnabled } from '../../utils';

type Props = {
  onGoToScreen: ComponentProps<typeof MoreOptions>['onGoToScreen'];
  items: ComponentProps<typeof ProfileOptions>['items'];
};

const MoreOptionsContainer = ({ onGoToScreen, ...props }: Props) => {
  const [items, setItems] = useState(props.items);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      isNotificationsEnabled().then((allowed) => {
        if (!allowed) {
          const goToSettings: ActionInfo = {
            title: 'Enable Notifications',
            description: 'View in Settings',
            onPress: () => Linking.openSettings(),
            icon: IconsOutlined.bell,
          };
          const newOptions = props.items.slice();
          newOptions.splice(
            props.items.findIndex((s) => s?.icon === IconsOutlined.settings),
            0,
            goToSettings
          );
          setItems(newOptions);
        }
      });
    }
  }, [props.items]);
  return (
    <Layout level="2" style={styles.flex}>
      <MoreOptions items={items} onGoToScreen={onGoToScreen} />
      {/* <PotentialAd location={AD_UNIT.PROFILE} /> */}
    </Layout>
  );
};

export default MoreOptionsContainer;

const styles = StyleSheet.create({ flex: { flex: 1 } });
