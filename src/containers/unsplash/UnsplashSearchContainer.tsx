import { useCallback, useState } from 'react';
import { trackDownload } from '../../api/database/unsplash';
import { useUnsplashSearch } from '../../api/queries';
import UnsplashSearch from '../../components/unsplash/UnsplashSearch';
import { useDebounce } from '../../utils/hooks';

type Props = {
  onPhotoSelected: (id: string) => void;
  onCancel: () => void;
  isOpen: boolean;
};

const UnsplashSearchContainer = ({
  onPhotoSelected,
  onCancel,
  isOpen,
}: Props) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 1300);
  const {
    atEnd,
    data: loadedPhotos,
    loading,
    onLoadMore,
    onRefresh,
  } = useUnsplashSearch(debouncedQuery);

  const onClose = useCallback(() => {
    setQuery('');
    onCancel();
  }, [onCancel]);

  const onPhotoIndexSelected = useCallback(
    (index: number) => {
      onPhotoSelected(loadedPhotos[index].id);
      trackDownload(loadedPhotos[index].links.download_location);
    },
    [loadedPhotos, onPhotoSelected]
  );

  return (
    <UnsplashSearch
      onCancel={onClose}
      onPerformSearch={onRefresh}
      onQueryNextPage={onLoadMore}
      onPhotoSelected={onPhotoIndexSelected}
      photos={loadedPhotos}
      searchTerm={query}
      setSearchTerm={setQuery}
      isOpen={isOpen}
      isLoading={loading}
      atEnd={atEnd}
    />
  );
};

export default UnsplashSearchContainer;
