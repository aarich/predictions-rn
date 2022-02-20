import { openURL } from 'expo-linking';
import { ComponentProps, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { HeaderButton } from '../../components/base';
import MoreOptionsContainer from '../../containers/profile/MoreOptionsContainer';
import {
  alert,
  handleError,
  IconsOutlined,
  MyConstants,
  RootTabScreenProps,
} from '../../utils';
import { openTwitter } from '../about/TwitterTimelineScreen';

type Props = RootTabScreenProps<'MoreTab'>;

const divider = null;

const items: ComponentProps<typeof MoreOptionsContainer>['items'] = [
  {
    name: 'EditProfile',
    icon: IconsOutlined.person,
    options: { title: 'Profile' },
  },
  { name: 'Statistics', icon: IconsOutlined.barChart },
  divider,
  { name: 'Tutorial', icon: IconsOutlined.playCircle },
  {
    name: 'Help',
    options: { title: `What is ${MyConstants.manifest?.name}?` },
    icon: IconsOutlined.questionMarkCircle,
  },
  { name: 'About', icon: IconsOutlined.info },
  { name: 'Feedback', icon: IconsOutlined.messageCircle },
  divider,
  Platform.select({
    web: {
      title: 'Updates',
      icon: IconsOutlined.twitter,
      onPress: openTwitter,
    },
    default: {
      name: 'Twitter',
      options: { title: 'Updates' },
      icon: IconsOutlined.twitter,
    },
  }),
  {
    name: 'ResetCache',
    options: { title: 'Reset Cache' },
    icon: IconsOutlined.settings,
  },
  divider,
  { name: 'LogOut', options: { title: 'Log Out' }, icon: IconsOutlined.logOut },
];

const MoreOptionsScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const stores = [
      { url: MyConstants.playStoreUrl, app: 'Play' },
      { url: MyConstants.appStoreUrl, app: 'App' },
    ];

    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon={IconsOutlined.share}
          onPress={() =>
            alert(
              `Share ${MyConstants.manifest?.name}`,
              undefined,
              stores.map(({ app, url }) => ({
                text: `Open ${app} Store`,
                onPress: () => openURL(url).catch(handleError),
              }))
            )
          }
        />
      ),
    });
  }, [navigation]);

  const onGoToScreen = useCallback(
    (name) => navigation.push(name),
    [navigation]
  );

  return <MoreOptionsContainer items={items} onGoToScreen={onGoToScreen} />;
};

export default MoreOptionsScreen;
