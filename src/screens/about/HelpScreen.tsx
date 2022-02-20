import { useEffect } from 'react';
import { HeaderButton } from '../../components/base';
import HelpContainer from '../../containers/about/HelpContainer';
import { IconsOutlined, RootTabScreenProps } from '../../utils';
import { useCurrentUserId } from '../../utils/hooks';

type Props = RootTabScreenProps<'AboutTab'>;

export default ({ navigation }: Props) => {
  const userId = useCurrentUserId();
  useEffect(() => {
    const noAuthHeaderRight = () => (
      <HeaderButton
        icon={IconsOutlined.questionMarkCircle}
        onPress={() => navigation.push('About')}
      />
    );
    navigation.setOptions({
      headerRight: userId ? undefined : noAuthHeaderRight,
    });
  }, [navigation, userId]);
  return <HelpContainer />;
};
