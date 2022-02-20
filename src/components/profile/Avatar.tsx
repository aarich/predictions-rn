import {
  Avatar as UIKAvatar,
  AvatarProps,
  ButtonElement,
} from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { EditButton?: ButtonElement } & AvatarProps;

const Avatar = ({ EditButton, style, ...avatarProps }: Props) => {
  const renderEditButtonElement = () => {
    if (!EditButton) {
      return null;
    }

    return React.cloneElement(EditButton, {
      style: [EditButton.props.style, styles.editButton],
    });
  };

  return (
    <View>
      <UIKAvatar style={[style, styles.avatar]} {...avatarProps} />
      {renderEditButtonElement()}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 0,
  },
});
