import { MyConstants } from '../../utils/constants';
import { log } from '../../utils/log';
import {
  getIdFromDbValue,
  UnsplashApiError,
  UnsplashDbValue,
  UnsplashPhotoApiSuccess,
  UnsplashSearchApiSuccess,
} from '../../utils/unsplash';
import { PAGE_SIZE } from '../commonApi';

const domain = 'https://api.unsplash.com/';
const headers = { 'Accept-Version': 'v1' };

export const trackDownload = (downloadUrl: string) => {
  const url = `${downloadUrl}&client_id=${MyConstants.unsplashAccessKey}`;
  log('tracking download of unsplash image', { url });

  return fetch(url, { headers });
};

export const getUnsplashPhotoInfo = (
  dbValue?: UnsplashDbValue
): Promise<UnsplashPhotoApiSuccess | void> => {
  if (!dbValue) {
    return Promise.resolve();
  }

  const id = getIdFromDbValue(dbValue);
  const url = `${domain}photos/${id}?client_id=${MyConstants.unsplashAccessKey}`;

  log('Fetching unsplash image info from id', { id, url });

  return fetch(url, { headers })
    .then(
      (resp) =>
        resp.json() as unknown as UnsplashPhotoApiSuccess | UnsplashApiError
    )
    .then((resp) => {
      if ('errors' in resp) {
        log('there was an error', resp);
        throw resp.errors[0];
      } else {
        return resp;
      }
    });
};

export const queryUnsplash = async (
  page: number,
  query: string
): Promise<UnsplashPhotoApiSuccess[]> => {
  if (!query) {
    return [];
  }
  log('querying unsplash search', { page, query });
  const baseUrl = domain + 'search/photos';
  const params = new URLSearchParams();
  params.append('client_id', MyConstants.unsplashAccessKey);
  params.append('query', query);
  params.append('page', `${page}`);
  params.append('per_page', `${PAGE_SIZE}`);
  params.append('orientation', 'landscape');

  const url = `${baseUrl}?${params.toString()}`;

  const rawResp = await fetch(url, { headers });
  const resp = (await rawResp.json()) as
    | UnsplashSearchApiSuccess
    | UnsplashApiError;

  if ('errors' in resp) {
    throw resp.errors[0];
  } else {
    return resp.results;
  }
};
