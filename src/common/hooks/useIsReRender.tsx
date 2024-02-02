import { useEffect } from 'react';

export function useIsReRender() {
  useEffect(() => {
    console.log('Re-rendered');
  });
}
