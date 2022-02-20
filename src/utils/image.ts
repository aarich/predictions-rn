import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';
import {
  getCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  ImageInfo,
  ImagePickerOptions,
  ImagePickerResult,
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { Linking, Platform } from 'react-native';
import { MyConstants } from './constants';
import { alert, getUnsplashPhoto, handleError } from './interactions';
import { supabase } from './supabase';
import { UNSPLASH_IMAGE_PREFIX } from './unsplash';

export type CombinedImageInfo = {
  uri: ImageInfo['uri'];
  width: ImageInfo['width'];
  height: ImageInfo['height'];
  base64?: ImageInfo['base64'];
};

/** This is a hack due to the error here: https://github.com/supabase/supabase/issues/1257 */
export const uploadImage = async (
  localFilePath: string,
  base64: string,
  bucket: string,
  filepath: string
) => {
  const fetchResult = await fetch(localFilePath);
  const blob = await fetchResult.blob();
  const buffer = decode(base64);

  return supabase.storage
    .from(bucket)
    .upload(filepath, buffer, { contentType: blob.type });
};

const MAX_IMAGE_DIM = 800;

export const resizeImage = async (
  image: ImageInfo
): Promise<CombinedImageInfo> => {
  const { uri: imageURI, width: currentWidth, height: currentHeight } = image;
  let resize = null;
  if (currentWidth > currentHeight) {
    if (currentWidth > MAX_IMAGE_DIM) {
      resize = { width: MAX_IMAGE_DIM };
    }
  } else {
    if (currentHeight > MAX_IMAGE_DIM) {
      resize = { height: MAX_IMAGE_DIM };
    }
  }

  return resize
    ? manipulateAsync(imageURI, [{ resize }], { base64: true })
    : image;
};

export const getResizedImage = async (
  message?: string,
  allowUnsplash?: boolean
): Promise<CombinedImageInfo | string | void> => {
  let mediaEnabled = false;
  let cameraEnabled = false;

  if (Platform.OS !== 'web') {
    let { status } = await getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await requestMediaLibraryPermissionsAsync());
    }
    mediaEnabled = status === 'granted';

    status = (await getCameraPermissionsAsync()).status;
    if (status !== 'granted') {
      ({ status } = await requestCameraPermissionsAsync());
    }
    cameraEnabled = status === 'granted';
  }

  const settingsRequiredAlert = Platform.select({
    web: () =>
      alert('', 'This feature is not supported on the web.', [
        {
          text: 'Get App',
          onPress: () => Linking.openURL(`${MyConstants.baseUrl}/app`),
        },
      ]),
    default: () =>
      alert(
        'Photo access required',
        'You must grant permission to access photos to use this feature. Please enable this in settings before continuing.',
        [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
      ),
  });

  if (!mediaEnabled && !cameraEnabled && !allowUnsplash) {
    settingsRequiredAlert();
    return;
  }

  const getImage = async (
    getter: (options: ImagePickerOptions) => Promise<ImagePickerResult>
  ) => {
    const result = await getter({
      aspect: [1, 1],
      allowsEditing: true,
      allowsMultipleSelection: false,
      base64: true,
    });

    return result.cancelled ? undefined : resizeImage(result);
  };

  return new Promise<CombinedImageInfo | string | void>((resolve) => {
    const options = [
      {
        text: 'Take a Picture',
        onPress: cameraEnabled
          ? () => getImage(launchCameraAsync).then(resolve)
          : () => {
              settingsRequiredAlert();
              resolve();
            },
      },
      {
        text: 'Choose from Library',
        onPress: mediaEnabled
          ? () => getImage(launchImageLibraryAsync).then(resolve)
          : () => {
              settingsRequiredAlert();
              resolve();
            },
      },
    ];
    if (allowUnsplash) {
      options.push({
        text: 'Search Unsplash',
        onPress: () =>
          getUnsplashPhoto().then((id) =>
            resolve(id ? `${UNSPLASH_IMAGE_PREFIX}${id}` : undefined)
          ),
      });
    }

    alert('Select Image', message, options);
  });
};

const hashString = (str?: string) => {
  if (!str) {
    return 0;
  }
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getCachedUriFromUrl = (
  bucket: string,
  filepath: string | undefined,
  publicUrl: string | undefined
) =>
  `${FileSystem.cacheDirectory}${bucket}-${encodeURIComponent(
    filepath?.replace(/\//g, '_') || ''
  )}_${hashString(publicUrl)}`;

export const deleteCachedImage = (
  isPublic: boolean,
  bucket: string,
  filepath: string | undefined
) => {
  if (!filepath || !isPublic) {
    return Promise.resolve();
  }

  const publicUrl = supabase.storage
    .from(bucket)
    .getPublicUrl(filepath).publicURL;
  if (!publicUrl) {
    return Promise.resolve();
  }

  const cachedURI = getCachedUriFromUrl(bucket, filepath, publicUrl);
  return FileSystem.getInfoAsync(cachedURI, { size: false })
    .then(({ exists }) =>
      exists ? FileSystem.deleteAsync(cachedURI) : undefined
    )
    .catch(handleError);
};
