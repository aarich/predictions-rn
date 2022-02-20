import { getPathFromState, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { log } from '../utils/log';
import { RootStackParamList, RootTabParamList } from '../utils/types';

const LinkingConfiguration: LinkingOptions<
  RootStackParamList & RootTabParamList
> = {
  getPathFromState(state, config) {
    let path = getPathFromState(state, config);
    const index = path.indexOf('?');
    if (index >= 0) {
      path = path.substring(0, index);
    }
    return path;
  },
  prefixes: [Linking.createURL('/'), Linking.createURL('')],
  config: {
    initialRouteName: 'Root',
    screens: {
      Root: {
        path: '/',
        screens: {
          HomeTab: '/home',
        },
      },
      ViewPost: {
        path: '/post/:id',
        parse: {
          id: (id) => {
            try {
              const parsed = parseInt(id);
              if (isNaN(parsed)) {
                log(id + ' is invalid (from parsed route');
                return 0;
              }
              return parsed;
            } catch {
              return 0;
            }
          },
        },
      },
      ViewProfile: '/user/:id',
      EditProfile: '/editprofile',
      MoreTab: '/more',
      GuestTab: '/browse',
      NotificationsTab: '/notifications',
      CreatePost: '/create',
      FollowingTab: '/following',
      Help: '/help',
      About: '/aboutapp',
      AboutTab: '/about',
      Feedback: '/feedback',
      ResetCache: '/resetcache',
      LogOut: '/logout',
      LogInTab: '/login',
      Statistics: '/stats',
      Tutorial: '/tutorial',
      App: '/app',
    },
  },
};

export default LinkingConfiguration;
