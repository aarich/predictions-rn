import React, { ComponentPropsWithoutRef, useState } from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  alert,
  calculatePoints,
  formatNumber,
  formatTimeAgo,
  IconsOutlined,
  Profile,
  Spacings,
} from '../../utils';
import { useNavTitle } from '../../utils/hooks';
import { Button, Icon, Layout, OutputTable, Text, View } from '../base';
import { OutputTableData } from '../base/OutputTable';
import PostCollection from '../post/PostCollection';
import Avatar from './Avatar';

type Props = {
  profile: Profile;
  avatarSource: ImageSourcePropType;
} & Omit<
  ComponentPropsWithoutRef<typeof PostCollection>,
  'ListHeaderComponent'
>;

const ViewProfile = ({
  profile,
  avatarSource,
  ...postCollectionProps
}: Props): React.ReactElement => {
  const { verified, username, bio, website, created_at } = profile;

  const data: OutputTableData[] = [];
  if (website) {
    data.push({ label: 'Website', value: website, link: true });
  }
  data.push({
    label: 'Joined',
    value: formatTimeAgo(created_at, 'round-minute'),
  });

  data.push({
    label: 'Points',
    value: `${formatNumber(calculatePoints(profile))}`,
    tooltip: 'Uses our secret formula',
  });

  const [headerHeight, setHeaderHeight] = useState(1000);
  const [navTitle, setNavTitle] = useState<string>();

  useNavTitle(navTitle ?? ' ');
  const paddingBottom = useSafeAreaInsets().bottom;

  return (
    <Layout flex l2 style={{ paddingBottom }}>
      <PostCollection
        {...postCollectionProps}
        emptystateProps={{
          title: 'Nothing here yet',
          description: "This user hasn't posted anything yet",
        }}
        onScrollEndDrag={({ nativeEvent: { targetContentOffset } }) => {
          setNavTitle(
            (targetContentOffset?.y ?? 0) > headerHeight ? username : undefined
          );
        }}
        ListHeaderComponentStyle={styles.header}
        ListHeaderComponent={
          <>
            <View style={styles.photoSection}>
              <Avatar
                style={styles.photo}
                source={avatarSource}
                EditButton={
                  verified ? (
                    <Button
                      style={styles.avatarButton}
                      size="small"
                      status="basic"
                      accessoryLeft={(props) => (
                        <Icon name={IconsOutlined.verified} {...props} />
                      )}
                      onPress={() => alert('', 'This user has been verified')}
                    />
                  ) : undefined
                }
              />
            </View>
            <Text
              center
              category={username.length > 15 ? 'h5' : 'h3'}
              onLayout={({
                nativeEvent: {
                  layout: { y, height },
                },
              }) => setHeaderHeight(y + height)}
            >
              {username}
            </Text>
            <Text style={styles.description} category="s2">
              {bio}
            </Text>

            <OutputTable style={styles.table} data={data} />

            <Text category="s1" style={styles.postsHeader}>
              Recent Posts
            </Text>
          </>
        }
      />
    </Layout>
  );
};

export default ViewProfile;

const styles = StyleSheet.create({
  header: { marginHorizontal: Spacings.s2 },
  postsHeader: { paddingTop: Spacings.s4, marginHorizontal: Spacings.s3 },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatarButton: { aspectRatio: 1.0, height: 32, width: 32, borderRadius: 16 },
  photo: { aspectRatio: 1.0, height: 150, width: 150 },
  description: { paddingVertical: Spacings.s4, paddingHorizontal: 16 },
  table: { paddingHorizontal: 16, paddingBottom: 16 },
});
