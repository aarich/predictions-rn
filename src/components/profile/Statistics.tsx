import { StyleSheet } from 'react-native';
import { Profile, Spacings } from '../../utils';
import { Layout, OutputTable } from '../base';
import { OutputTableData } from '../base/OutputTable';

type Props = {
  profile: Profile;
};
const Statistics = ({ profile }: Props) => {
  const {
    num_post_likes,
    num_pred_likes,
    num_comm_likes,
    num_pred_comments,
    num_post_comments,
    num_post_predictions,
  } = profile;

  const data: OutputTableData[] = [
    {
      label: 'Number of predictions on your posts',
      value: num_post_predictions,
    },
    { label: 'Number of comments on your posts', value: num_post_comments },
    {
      label: 'Number of comments on your predictions',
      value: num_pred_comments,
    },
    {
      label: 'Up votes received',
      value: num_post_likes + num_pred_likes + num_comm_likes,
    },
  ];

  return (
    <Layout flex l2 style={styles.container}>
      <OutputTable data={data} />
    </Layout>
  );
};

export default Statistics;

const styles = StyleSheet.create({ container: { padding: Spacings.s5 } });
