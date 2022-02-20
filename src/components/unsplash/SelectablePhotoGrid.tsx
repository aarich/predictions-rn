import { useCallback, useMemo } from 'react';
import { NativeScrollEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useStatusColor } from '../../utils/hooks/useColor';
import { GridView, Text, View } from '../base';
import { Props as GridListItemProps } from '../base/GridListItem';

type PhotoInfo = {
  url: string;
};

type Props = {
  photos: PhotoInfo[];
  onQueryNextPage: () => void;
  onPhotoSelect: (index?: number) => void;
  selectedPhoto?: number;
  width: number;
  atEnd: boolean;
};

const isCloseToBottom = ({
  layoutMeasurement,
  contentOffset,
  contentSize,
}: NativeScrollEvent) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

const SelectablePhotoGrid = ({
  photos,
  onQueryNextPage,
  onPhotoSelect,
  selectedPhoto,
  atEnd,
  width,
}: Props) => {
  const onPhotoPress = useCallback(
    (i) => onPhotoSelect(i === selectedPhoto ? undefined : i),
    [onPhotoSelect, selectedPhoto]
  );

  const itemHeight = useMemo(() => 0.7 * (width / 2), [width]);

  const borderColor = useStatusColor('primary');

  const items = useMemo(() => {
    const selectedPhotoStyle = {
      borderColor,
      borderWidth: 4,
    };
    return photos.map(
      (photoInfo, index): GridListItemProps => ({
        imageProps: {
          source: { uri: photoInfo.url },
          resizeMode: 'cover',
        },
        onPress: () => onPhotoPress(index),
        renderOverlay:
          selectedPhoto === index
            ? () => <View style={selectedPhotoStyle} flex></View>
            : undefined,
        itemSize: { height: itemHeight },
      })
    );
  }, [borderColor, itemHeight, onPhotoPress, photos, selectedPhoto]);

  const noPhotosMessage = useMemo(
    () =>
      items.length > 0 ? 'Try a different search term' : 'No photos found',
    [items.length]
  );

  return (
    <ScrollView
      scrollEventThrottle={50}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent) && !atEnd) {
          onQueryNextPage();
        }
      }}
    >
      <GridView items={items} numColumns={2} viewWidth={width} />
      {atEnd ? <Text italic>{noPhotosMessage}</Text> : null}
    </ScrollView>
  );
};

export default SelectablePhotoGrid;
