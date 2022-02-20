import { Divider, Input } from '@ui-kitten/components';
import { KeyboardTypeOptions, StyleSheet, ViewProps } from 'react-native';
import { getUrlDisplay, IconType, Spacings } from '../../utils';
import { Text, View } from '../base';
import { a } from '../base/Anchor';
import Label from '../base/io/Label';

type Props = {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  link?: boolean;
  placeholder?: string;
  icon?: IconType;
  tooltip?: string;
} & ViewProps;

const ProfileSetting = ({
  style,
  label,
  value,
  onValueChange,
  disabled = false,
  link = false,
  keyboardType,
  placeholder,
  icon,
  tooltip,
  ...layoutProps
}: Props) => {
  const renderValue = () => {
    if (disabled) {
      if (link && value) {
        return a(value, getUrlDisplay(value), { showIcon: true });
      }
      return <Text>{value}</Text>;
    }

    return (
      <Input
        placeholder={placeholder}
        value={value || ''}
        onChangeText={onValueChange}
        disabled={disabled}
        style={styles.input}
        keyboardType={keyboardType}
      />
    );
  };
  return (
    <>
      <View {...layoutProps} style={[styles.container, style]}>
        {label ? (
          <Label category="s1" label={label} icon={icon} tooltip={tooltip} />
        ) : null}
        {renderValue()}
      </View>
      <Divider />
    </>
  );
};

export default ProfileSetting;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: { flex: 1, marginLeft: Spacings.s4, maxWidth: '70%' },
});
