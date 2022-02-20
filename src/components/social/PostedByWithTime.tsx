import { useNavigation } from '@react-navigation/native';
import { TextProps } from '@ui-kitten/components';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
  alert,
  CreatedByUserInfo,
  Icons,
  isMockEntity,
  navigateToUser,
  Spacings,
} from '../../utils';
import { useAvatarPhoto } from '../../utils/hooks';
import { IconButton, Text, TimeAgo, View } from '../base';
import Avatar from '../profile/Avatar';

type Props = {
  entity: CreatedByUserInfo;
  showAvatar?: boolean;
  category?: TextProps['category'];
  style?: StyleProp<ViewStyle>;
  additionalText?: (string | undefined)[];
};

const PostedByWithTime = ({
  entity: { user_id, username, avatar_url, created_at, verified_user },
  showAvatar,
  category,
  style,
  additionalText,
}: Props) => {
  const avatarPhoto = useAvatarPhoto(showAvatar ? avatar_url : undefined);
  const navigation = useNavigation<Parameters<typeof navigateToUser>[1]>();
  const onPressUser = isMockEntity({ id: user_id })
    ? () => alert('', 'View profiles to see content posted by the user')
    : () => navigateToUser(user_id, navigation);

  const SEP = ' · ';

  const verifiedSize = category === 'c1' ? 'tiny' : 'small';
  return (
    <Pressable onPress={onPressUser}>
      <View row style={style}>
        {showAvatar ? (
          <Avatar
            source={{ uri: avatarPhoto }}
            shape="round"
            size="tiny"
            style={styles.avatar}
          />
        ) : null}
        <View center>
          <Text hint category={category}>
            <>
              {username}
              {verified_user ? (
                <>
                  {' '}
                  <IconButton
                    disabled
                    name={Icons.verified}
                    status="basic"
                    size={verifiedSize}
                  />{' '}
                </>
              ) : null}
              {SEP}
              <TimeAgo category={category} hint time={created_at} />
              {additionalText?.filter((str) => str).map((str) => SEP + str)}
            </>
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default PostedByWithTime;

const styles = StyleSheet.create({
  avatar: { paddingBottom: Spacings.s2, marginRight: Spacings.s3 },
});
