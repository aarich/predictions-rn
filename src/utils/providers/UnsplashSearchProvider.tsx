import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import UnsplashSearchContainer from '../../containers/unsplash/UnsplashSearchContainer';
import { unsplashFnRef } from '../interactions';

type UnsplashContextType = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
};

const defaultContext: UnsplashContextType = {
  visible: false,
  setVisible: () => null,
};

const UnsplashSearchContext =
  createContext<UnsplashContextType>(defaultContext);

type CallbackType = (id?: string) => void;

const UnsplashSearchProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<CallbackType>(
    () => null
  );

  useEffect(() => {
    if (!visible) {
      unsplashFnRef.current = () => {
        setVisible(true);
        return new Promise<string | undefined>((resolve) => {
          setResolvePromise(() => (id?: string) => {
            setVisible(false);
            resolve(id);
          });
        });
      };
    }
  }, [visible]);

  return (
    <UnsplashSearchContext.Provider value={{ visible, setVisible }}>
      <UnsplashSearchContainer
        isOpen={visible}
        onCancel={resolvePromise}
        onPhotoSelected={resolvePromise}
      />
      {children}
    </UnsplashSearchContext.Provider>
  );
};

export default UnsplashSearchProvider;
