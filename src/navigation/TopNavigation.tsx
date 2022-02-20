import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import {
  Divider,
  TopNavigation as UIKTopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import { RenderProp } from '@ui-kitten/components/devsupport';
import { openURL } from 'expo-linking';
import { Fragment, ReactNode } from 'react';
import { Dimensions, Platform } from 'react-native';
import { HeaderButton, Icon, Text, View } from '../components/base';
import { Icons, IconsOutlined, isValidParam, log, MyConstants } from '../utils';

export default <T extends NativeStackHeaderProps | BottomTabHeaderProps>(
    topInsets: number,
    isLoggedIn: boolean,
    onGoToLogin: VoidFunction
  ) =>
  ({ options, navigation, route, ...others }: T) => {
    if (options.headerShown === false) {
      return undefined;
    }

    // Use a hidden back action to give the header the correct height
    let BackAction: RenderProp = () => (
      <TopNavigationAction
        icon={(props) => (
          <Icon {...props} fill="transparent" name={Icons.arrowBack} />
        )}
      />
    );

    let canGoBack = false;
    const back = 'back';
    if ('pop' in navigation && isValidParam(back, others) && others[back]) {
      const goBack = () => navigation.pop();
      canGoBack = true;

      BackAction = () => (
        <TopNavigationAction
          icon={(props) => <Icon {...props} name={Icons.arrowBack} />}
          onPress={goBack}
        />
      );
    }

    const { title, headerRight } = options || {};

    const renderRightActions = () => {
      const headerActions: ReactNode[] = [];

      if (!isLoggedIn) {
        headerActions.push(
          <HeaderButton key="login" icon={Icons.person} onPress={onGoToLogin} />
        );
      }

      if (Platform.OS === 'web' && Dimensions.get('screen').width <= 760) {
        const url = `${MyConstants.manifest?.scheme}://${route.path}`;

        headerActions.push(
          <HeaderButton
            key="openInApp"
            icon={IconsOutlined.externalLink}
            onPress={() => {
              log('Attempting to open url in app: ' + url);
              openURL(url);
            }}
          />
        );
      }

      if (headerRight) {
        headerActions.push(
          <Fragment key="action">{headerRight({ canGoBack })}</Fragment>
        );
      }

      return <View row>{headerActions}</View>;
    };

    return (
      <>
        <UIKTopNavigation
          style={{ paddingTop: topInsets }}
          title={(props) => (
            <Text {...props} style={[props?.style, { marginTop: topInsets }]}>
              {title || route.name}
            </Text>
          )}
          alignment="center"
          accessoryLeft={BackAction}
          accessoryRight={renderRightActions}
        />
        <Divider />
      </>
    );
  };
