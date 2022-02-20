import { Platform, View } from 'react-native';
import { screened } from '../components/base/Screen';
import ResetCacheScreen from '../containers/about/ResetCacheScreen';
import AboutScreen from '../screens/about/AboutScreen';
import AppScreen from '../screens/about/AppScreen';
import FeedbackScreen from '../screens/about/FeedbackScreen';
import HelpScreen from '../screens/about/HelpScreen';
import TutorialScreen from '../screens/about/TutorialScreen';
import TwitterTimelineScreen from '../screens/about/TwitterTimelineScreen';
import LogInScreen from '../screens/auth/LogInScreen';
import LogOutScreen from '../screens/auth/LogOutScreen';
import FollowingScreen from '../screens/following/FollowingScreen';
import NotificationsScreen from '../screens/following/NotificationsScreen';
import GuestHomeScreen from '../screens/home/GuestHomeScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import ViewPostScreen from '../screens/post/ViewPostScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MoreOptionsScreen from '../screens/profile/MoreOptionsScreen';
import StatisticsScreen from '../screens/profile/StatisticsScreen';
import ViewProfileScreen from '../screens/profile/ViewProfileScreen';
import {
  BottomTabScreenInfo,
  Icons,
  IconsOutlined,
  MyConstants,
  RootStackScreenInfo,
} from '../utils';

const asScreens = <S extends BottomTabScreenInfo | RootStackScreenInfo>(
  screens: S[]
): S[] =>
  screens.map(
    ({ screen, ...props }) =>
      ({
        screen: props.name === 'Root' ? screen : screened(screen),
        ...props,
      } as S)
  );

export const authNotRequiredTabs = asScreens<BottomTabScreenInfo>([
  {
    name: 'GuestTab',
    screen: GuestHomeScreen,
    icon: Icons.trendingUp,
    options: { title: 'Trending' },
  },
  {
    name: 'LogInTab',
    screen: LogInScreen,
    icon: Icons.person,
    options: { title: 'Sign In', headerShown: false },
  },
  {
    name: 'AboutTab',
    screen: HelpScreen,
    icon: Icons.info,
    options: { title: `About ${MyConstants.manifest?.name}` },
  },
]);

if (Platform.OS !== 'web') {
  authNotRequiredTabs.push({
    name: 'TwitterTab',
    screen: TwitterTimelineScreen,
    icon: Icons.twitter,
    options: { title: 'Updates' },
  });
}

export const authRequiredTabs = asScreens<BottomTabScreenInfo>([
  {
    name: 'HomeTab',
    screen: HomeScreen,
    icon: Icons.compass,
    options: { headerShown: false, title: MyConstants.manifest?.name },
  },
  {
    name: 'FollowingTab',
    screen: FollowingScreen,
    icon: Icons.bookmark,
    options: { title: 'Following' },
  },
  {
    name: 'CreatePostTab',
    screen: () => <View />,
    icon: IconsOutlined.plusCircle,
  },
  {
    name: 'NotificationsTab',
    screen: NotificationsScreen,
    icon: Icons.bell,
    options: { title: 'Notifications' },
  },
  {
    name: 'MoreTab',
    screen: MoreOptionsScreen,
    icon: Icons.menu,
    options: { title: 'More' },
  },
]);

export const stackScreens = asScreens<RootStackScreenInfo>([
  {
    name: 'EditProfile',
    screen: EditProfileScreen,
    options: { title: 'Profile' },
  },
  {
    name: 'ViewProfile',
    screen: ViewProfileScreen,
    options: { title: 'Profile' },
  },
  {
    name: 'LogOut',
    screen: LogOutScreen,
    options: { title: 'Log Out', headerLargeTitle: true },
  },
  { name: 'About', screen: AboutScreen },
  { name: 'Help', screen: HelpScreen },
  { name: 'Twitter', screen: TwitterTimelineScreen },
  { name: 'Feedback', screen: FeedbackScreen },
  {
    name: 'ResetCache',
    screen: ResetCacheScreen,
    options: { title: 'Reset Cache' },
  },
  {
    name: 'CreatePost',
    screen: CreatePostScreen,
    options: {
      title: 'Create Post',
      headerShown: false,
      animation: 'slide_from_bottom',
    },
  },
  { name: 'ViewPost', screen: ViewPostScreen, options: { title: 'View Post' } },
  {
    name: 'Tutorial',
    screen: TutorialScreen,
    options: { title: 'California Drought' },
  },
  { name: 'Statistics', screen: StatisticsScreen },
  {
    name: 'App',
    screen: AppScreen,
    options: { title: MyConstants.manifest?.name, headerShown: false },
  },
]);
