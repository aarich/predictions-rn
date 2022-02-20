import { User } from '@supabase/supabase-js';
import { Input, Layout } from '@ui-kitten/components';
import React from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  formatTimeAgo,
  Icons,
  IconsOutlined,
  MutableProfile,
  Spacings,
} from '../../utils';
import { Button, Icon, LoadingWrapper, View } from '../base';
import Avatar from './Avatar';
import ProfileSetting from './ProfileSetting';

type Props = {
  loading: boolean;
  user: User | null;
  isDirty: boolean;
  draft: MutableProfile;
  onSave: (updates?: Partial<MutableProfile>) => void;
  setDraft: (draft: Partial<MutableProfile>) => void;
  onSelectAvatar: VoidFunction;
  avatarSource: ImageSourcePropType;
};

const EditProfile = ({
  loading,
  user,
  isDirty,
  onSave,
  draft,
  setDraft,
  onSelectAvatar,
  avatarSource,
}: Props): React.ReactElement => {
  return (
    <LoadingWrapper loading={loading || !user} flex>
      <Layout style={styles.container}>
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.photoSection}>
            <Avatar
              style={styles.photo}
              source={avatarSource}
              EditButton={
                <Button
                  style={styles.photoButton}
                  size="small"
                  status="basic"
                  accessoryLeft={(props) => (
                    <Icon name={IconsOutlined.camera} {...props} />
                  )}
                  onPress={onSelectAvatar}
                />
              }
            />
            <View style={styles.nameSection}>
              <Input
                label="Display Name"
                value={draft.username || ''}
                onChangeText={(username) => setDraft({ username })}
                style={styles.setting}
              />
              <ProfileSetting
                style={styles.setting}
                value={
                  user
                    ? formatTimeAgo(user.created_at, 'round-minute')
                    : undefined
                }
                label="Joined"
                disabled
              />
            </View>
          </View>
          <Input
            style={styles.description}
            value={draft.bio || ''}
            onChangeText={(bio) => setDraft({ bio })}
            multiline
            placeholder="Say something about yourself"
          />
          <ProfileSetting
            style={[styles.setting, styles.emailSetting]}
            label="Email"
            value={user?.email}
            disabled
            icon={Icons.eyeOff}
            tooltip="Email is not visible to other users"
          />
          <ProfileSetting
            style={styles.setting}
            label="Website"
            value={draft.website || ''}
            onValueChange={(website) => setDraft({ website })}
            keyboardType="url"
            placeholder="Enter a URL"
          />
          <Button
            style={styles.doneButton}
            onPress={() => onSave(draft)}
            label="Save"
            disabled={!isDirty}
          />
        </KeyboardAwareScrollView>
      </Layout>
    </LoadingWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  photo: {
    aspectRatio: 1.0,
    height: 76,
    width: 76,
  },
  photoButton: {
    aspectRatio: 1.0,
    height: 32,
    width: 32,
    borderRadius: 16,
  },
  nameSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  description: {
    paddingTop: Spacings.s4,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  doneButton: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  setting: {
    padding: 16,
  },
  emailSetting: {
    marginTop: 24,
  },
});
