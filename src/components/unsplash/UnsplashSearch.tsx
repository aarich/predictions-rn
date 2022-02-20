import { Layout, TextElement } from '@ui-kitten/components';
import { ReactText, useCallback, useReducer, useState } from 'react';
import { Modal, Platform, StyleSheet } from 'react-native';
import {
  IconsOutlined,
  keyed,
  REFERRAL_PARAMS,
  Spacings,
  UnsplashPhotoApiSuccess,
} from '../../utils';
import { Button, SearchBar, Text, View } from '../base';
import { a } from '../base/Anchor';
import Screen from '../base/Screen';
import SelectablePhotoGrid from './SelectablePhotoGrid';

type Props = {
  onPhotoSelected: (index: number) => void;
  onCancel: () => void;
  isOpen: boolean;
  onPerformSearch: () => void;
  onQueryNextPage: () => void;
  photos: UnsplashPhotoApiSuccess[];
  setSearchTerm: (searchTerm: string) => void;
  searchTerm: string;
  isLoading: boolean;
  atEnd: boolean;
};

const renderPhotoInfoMessage = (
  hasShownOnce: boolean,
  photo?: UnsplashPhotoApiSuccess
) => {
  let content: (ReactText | TextElement)[] = [''];
  if (photo) {
    content = [
      a(photo.links.html + '?' + REFERRAL_PARAMS, 'Photo'),
      <Text key="by" hint>
        {' by '}
      </Text>,
      a(
        `https://unsplash.com/@${photo.user.username}?${REFERRAL_PARAMS}`,
        photo.user.name
      ),
    ];
  } else if (!hasShownOnce) {
    content = ['Tap to select a photo'];
  }

  return (
    <Text italic numberOfLines={2}>
      {keyed(content)}
    </Text>
  );
};

const UnsplashSearch = ({
  onPhotoSelected,
  onCancel,
  isOpen,
  onPerformSearch,
  onQueryNextPage,
  photos,
  setSearchTerm,
  searchTerm,
  isLoading,
  atEnd,
}: Props) => {
  const [hasShownOnce, setHasShown] = useReducer(() => true, false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>();
  const [modalWidth, setModalWidth] = useState(0);

  const setSelectedPhotoWrapper = useCallback((value) => {
    setSelectedPhoto(value);
    setHasShown();
  }, []);

  const onCancelInner = useCallback(() => {
    setSelectedPhoto(undefined);
    setSearchTerm('');
    onCancel();
  }, [onCancel, setSearchTerm]);

  const selectedPhotoInfo =
    selectedPhoto == null ? undefined : photos[selectedPhoto];

  return (
    <Modal
      visible={isOpen}
      onDismiss={onCancelInner}
      onRequestClose={onCancelInner}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <Screen>
        <Layout style={styles.layout}>
          <View flex style={styles.container}>
            <View
              flex
              onLayout={(event) =>
                setModalWidth(event.nativeEvent.layout.width)
              }
            >
              <View row spread>
                <View>
                  <View flex center>
                    <Text h2 style={styles.search}>
                      Search Unsplash
                    </Text>
                  </View>
                </View>
                <Button
                  ghost
                  status="control"
                  onPress={onCancelInner}
                  icon={{ name: IconsOutlined.close }}
                />
              </View>
              <Text style={styles.find}>
                Find high quality photos from{' '}
                {a('https://unsplash.com?' + REFERRAL_PARAMS, 'Unsplash')}
              </Text>
              <View style={styles.row}>
                <SearchBar
                  onChangeText={setSearchTerm}
                  loading={isLoading}
                  value={searchTerm}
                  onBlur={onPerformSearch}
                />
              </View>
              <SelectablePhotoGrid
                onPhotoSelect={setSelectedPhotoWrapper}
                photos={photos.map((photo) => ({
                  url: Platform.select({
                    web: photo.urls.regular,
                    default: photo.urls.thumb,
                  }),
                }))}
                selectedPhoto={selectedPhoto}
                width={modalWidth}
                onQueryNextPage={onQueryNextPage}
                atEnd={atEnd}
              />

              <View row spread style={styles.info}>
                {photos.length > 0 ? (
                  <View flex>
                    <View flex center>
                      {renderPhotoInfoMessage(hasShownOnce, selectedPhotoInfo)}
                    </View>
                  </View>
                ) : (
                  <View />
                )}
                <Button
                  label="Use Photo"
                  onPress={() =>
                    typeof selectedPhoto !== 'undefined' &&
                    onPhotoSelected(selectedPhoto)
                  }
                  disabled={typeof selectedPhoto === 'undefined'}
                  style={styles.usePhoto}
                />
              </View>
            </View>
          </View>
        </Layout>
      </Screen>
    </Modal>
  );
};

export default UnsplashSearch;

const styles = StyleSheet.create({
  layout: { flex: 1 },
  container: { margin: Spacings.s2 },
  find: { marginTop: 10, marginHorizontal: 5 },
  row: { marginBottom: Spacings.s2 },
  search: { marginLeft: Spacings.s2 },
  info: { marginBottom: Spacings.s5, marginTop: Spacings.s1 },
  usePhoto: { marginHorizontal: Spacings.s5 },
});
