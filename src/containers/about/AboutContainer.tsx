import { Fragment } from 'react';
import TextWall from '../../components/about/TextWall';
import { a } from '../../components/base/Anchor';
import { h4, p } from '../../components/base/io/Text';
import { MyConstants } from '../../utils';

const PRIVACY_URL = 'mrarich.com/privacy';

const elements = [
  h4('Community Guidelines'),
  p(
    'This app involves user-generated content. By using the app you agree to only generate family-friendly content. You may report any inappropriate content for review.'
  ),
  p('These are your terms of use.'),
  h4('Privacy Policy'),
  p(
    'You can find the full privacy policy for this app ',
    a(PRIVACY_URL, 'here'),
    '.'
  ),
  p(
    '\nIn brief, no information is stored unless you explicitly provide it. No app information is shared except where required by law.'
  ),
  h4('Acknowledgements'),
  p(
    'Thanks to the following open source software and free services for making this project possible.'
  ),
  [
    { name: 'App Mockup', url: 'app-mockup.com' },
    { name: 'Expo', url: 'expo.dev' },
    { name: 'GitHub', url: 'github.com' },
    { name: 'React Native', url: 'reactnative.dev' },
    { name: 'React Query', url: 'react-query.tanstack.com' },
    { name: 'Supabase', url: 'supabase.com' },
    { name: 'UI Kitten', url: 'akveo.github.io/react-native-ui-kitten' },
    { name: 'Unsplash', url: 'unsplash.com' },
  ].map((link) => (
    <Fragment key={link.name}>{p(a(link.url, link.name))}</Fragment>
  )),
  h4("Who's building this?"),
  p(
    'You can find out more about the developer ',
    a('mrarich.com/about', 'here'),
    '.'
  ),
  p(),
  p(
    `${MyConstants.manifest?.name} is "open source," meaning that most of the code is entirely public! Check it out `,
    a('github.com/aarich/predictions-rn', 'on GitHub'),
    ' and, if you like, make an improvement. We are also built on top of great open source software like the ones listed above.'
  ),
  p(),
  p(
    `Version ${MyConstants.version} © ${new Date(
      Date.now()
    ).getFullYear()} Alex Rich`
  ),
];

const AboutContainer = () => {
  return <TextWall elements={elements} />;
};

export default AboutContainer;
