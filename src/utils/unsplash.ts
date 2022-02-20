export const UNSPLASH_IMAGE_PREFIX = 'unsplash_';
export const REFERRAL_PARAMS = 'utm_source=Whattl&utm_medium=referral';

export type UnsplashApiError = { errors: string[] };
export type UnsplashDbValue = `${typeof UNSPLASH_IMAGE_PREFIX}${string}`;

export type UnsplashSearchApiSuccess = {
  total: number;
  total_pages: number;
  results: UnsplashPhotoApiSuccess[];
};

export type UnsplashPhotoApiSuccess = {
  id: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    username: string;
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
};

export const isUnsplashDbValue = (str?: string): str is UnsplashDbValue =>
  str?.startsWith(UNSPLASH_IMAGE_PREFIX) ?? false;

export const getIdFromDbValue = (
  dbValue: UnsplashDbValue
): string | undefined => {
  return dbValue.substring(UNSPLASH_IMAGE_PREFIX.length);
};
