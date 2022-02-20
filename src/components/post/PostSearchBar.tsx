import { Layout } from '@ui-kitten/components';
import { useEffect, useReducer, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import {
  Icons,
  IconsOutlined,
  PostSearchInfo,
  Spacings,
  TagType,
} from '../../utils';
import {
  Button,
  Card,
  CenteredModal,
  DropdownPicker,
  PickerOption,
  SearchBar,
  View,
} from '../base';
import FormCheckBox from '../base/io/FormCheckBox';

type Props = {
  loading: boolean;
  onSubmit: (searchInfo: PostSearchInfo) => void;
};

const PostSearchBar = ({ loading, onSubmit }: Props) => {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(TagType.SCIENCE);
  const [filterByValue, toggleFilterByValue] = useReducer((b) => !b, false);
  const [showFilters, setShowFilters] = useState(false);
  const [submitTrigger, triggerSubmit] = useReducer((b) => !b, false);

  const tagOptions: PickerOption<TagType>[] = Object.values(TagType).map(
    (value) => ({ label: value, value })
  );

  useEffect(() => {
    onSubmit({ query, tag: filterByValue ? tag : undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  return (
    <Layout level="2" style={styles.container}>
      <CenteredModal
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
        title="Filter Options"
      >
        <FormCheckBox
          checked={filterByValue}
          onPress={toggleFilterByValue}
          title="Filter by a topic"
          style={styles.checkbox}
        />
        {filterByValue ? (
          <DropdownPicker
            label="Select Tag"
            selectedValue={tag}
            options={tagOptions}
            onValueChange={setTag}
            style={styles.dropdown}
          />
        ) : null}
        <Button
          label="Update Search"
          size="small"
          onPress={() => {
            setShowFilters(false);
            triggerSubmit();
          }}
        />
      </CenteredModal>
      <View row>
        <View center flex>
          <SearchBar
            value={query}
            loading={loading}
            onChangeText={setQuery}
            onTouchCancel={() => setQuery('')}
            style={styles.search}
            onSubmitEditing={triggerSubmit}
            status="basic"
            size="small"
          />
        </View>

        {filterByValue ? (
          <View center style={styles.tag}>
            <Button
              size="tiny"
              label={tag}
              status="basic"
              outline
              icon={{ name: Icons.close }}
              onPress={() => {
                toggleFilterByValue();
                triggerSubmit();
              }}
            />
          </View>
        ) : null}

        <View center>
          <Card style={{ marginHorizontal: Spacings.s1 }}>
            <Button
              icon={{ name: (filterByValue ? Icons : IconsOutlined).filter }}
              size="small"
              status="basic"
              ghost
              onPress={() => {
                setShowFilters(true);
                Keyboard.dismiss();
              }}
            />
          </Card>
        </View>
      </View>
    </Layout>
  );
};

export default PostSearchBar;

const styles = StyleSheet.create({
  container: { paddingVertical: Spacings.s1, paddingHorizontal: Spacings.s2 },
  search: { flexGrow: 1 },
  checkbox: { marginVertical: Spacings.s2, minWidth: 200 },
  dropdown: { marginBottom: Spacings.s2 },
  tag: { marginHorizontal: Spacings.s1 },
});
