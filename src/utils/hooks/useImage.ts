import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { isUnsplashDbValue } from '..';
import { useUnsplashPhotoInfo } from '../../api/queries';
import { getCachedUriFromUrl } from '../image';
import { handleError } from '../interactions';
import { log } from '../log';
import { supabase } from '../supabase';
import { Post } from '../typesDB';

const DEBUG = false;

export const usePublicUrl = (
  isPublic: boolean,
  bucket: string,
  filepath?: string
) => {
  const [url, setUrl] = useState<string>();
  const unsplashPhotoInfo = useUnsplashPhotoInfo(filepath);
  useEffect(() => {
    setUrl(undefined);

    if (filepath?.startsWith('https://')) {
      // It's a static url (e.g. for tutorial)
      setUrl(filepath);
    } else if (isUnsplashDbValue(filepath)) {
      setUrl(unsplashPhotoInfo.data?.urls.regular);
    } else if (filepath && isPublic) {
      const { publicURL, error, data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filepath);
      if (error) {
        handleError(error);
      } else if (publicURL) {
        setUrl(publicURL);
        DEBUG &&
          log(
            `public url for bucket/filepath ${bucket}/${filepath} is: ${publicURL}`
          );
      } else {
        log("Didn't find public URL.", { data });
      }
    }
  }, [bucket, filepath, isPublic, unsplashPhotoInfo.data?.urls.regular]);

  return url;
};

export const useCachedImageFromPublicUrl = (
  publicUrl: string | undefined,
  bucket: string,
  filepath?: string
) => {
  const [localUri, setLocalUri] = useState<string>();

  useEffect(() => {
    if (publicUrl) {
      if (Platform.OS === 'web') {
        setLocalUri(publicUrl);
      } else {
        const cachedURI = getCachedUriFromUrl(bucket, filepath, publicUrl);
        FileSystem.getInfoAsync(cachedURI, { size: false })
          .then(({ exists }) => {
            if (exists) {
              setLocalUri(cachedURI);
              DEBUG &&
                log(
                  `Found already cached URI for bucket/filepath ${bucket}/${filepath}: ${cachedURI}`
                );
            } else {
              log('Downloading not-cached image asset to ' + cachedURI);
              FileSystem.downloadAsync(publicUrl, cachedURI)
                .then(({ uri }) => setLocalUri(uri))
                .catch(handleError);
            }
          })
          .catch(handleError);
      }
    } else {
      setLocalUri(undefined);
    }
  }, [bucket, filepath, publicUrl]);

  return localUri;
};

export const useImage = (
  isPublic: boolean,
  bucket: string,
  filepath?: string
): string | undefined => {
  const [src, setSrc] = useState<string>();
  const publicUrl = usePublicUrl(isPublic, bucket, filepath);
  const cachedUrl = useCachedImageFromPublicUrl(publicUrl, bucket, filepath);

  useEffect(() => {
    if (isPublic) {
      // wait for cached url
      setSrc(cachedUrl);
    } else if (filepath) {
      supabase.storage
        .from(bucket)
        .download(filepath)
        .then(({ error, data }) => {
          if (error) {
            throw error;
          } else if (!data) {
            throw new Error('Image not found');
          }
          setSrc(URL.createObjectURL(data));
        })
        .catch(handleError);
    } else {
      setSrc(undefined);
    }
  }, [bucket, cachedUrl, filepath, isPublic]);

  return src;
};

export const usePostMediaImage = (post: Post) =>
  useImage(
    true,
    'post',
    post.media_type === 'image' ? post.media_url : undefined
  );

export const useAvatarPhoto = (avatarUrl?: string) =>
  useImage(true, 'avatars', avatarUrl);
