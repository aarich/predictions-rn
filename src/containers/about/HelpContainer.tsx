import TextWall from '../../components/about/TextWall';
import { IconButton, Text } from '../../components/base';
import { h3, h6, p } from '../../components/base/io/Text';
import { alert, IconsOutlined, MyConstants } from '../../utils';

const appName = MyConstants.manifest?.name;
const elements = [
  h3(`What is ${appName}?`),
  p(
    `${appName} is designed to keep us honest, discuss predictions about the future, and follow up on those predictions.`
  ),
  h3('How does it work?'),
  p(
    'Everything starts with a post. The post relates to a future event, for example a sports game, election, or just a month of the year.',
    `Suppose a politician says "I will create X jobs by May of ${new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 365
    ).getFullYear()}." Who checks on that prediction? That prediction can be logged in ${appName} and discussed. When it comes time, we can check on the actual outcome.`
  ),

  h6('How do I add a prediction?'),
  p(
    'From any post, hit the      ',
    <Text>
      <IconButton
        name={IconsOutlined.bulb}
        status="basic"
        onPress={() => alert('', 'Not this one...')}
      />
    </Text>,
    'to add a prediction. The prediction can be anything: Something you made up, something you saw in the news, anything you like.'
  ),
  h6('What happens when I follow a post?'),
  p(
    "Following a post means it'll show up in your saved posts lists. You'll also get a notification when it comes time to check on the prediction."
  ),
  h6('What can other people see?'),
  p(
    'Most posts are public, so anyone can find and discuss them. You can create posts just for you, as well. ' +
      'To create a private post, deselect the "public" checkbox. An example could be fitness goals or things only you want to track.'
  ),
];

const HelpContainer = () => {
  return <TextWall elements={elements} />;
};

export default HelpContainer;
