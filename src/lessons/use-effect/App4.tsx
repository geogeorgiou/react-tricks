import { useEffect, useRef, useState } from 'react';
import { fakeFetchJson } from './fake-api';

type UseFetchArgs = {
  options: {
    url: string;
    onSuccess?: VoidFunction;
  };
};

const useFetch = ({ options }: UseFetchArgs) => {
  const [data, setData] = useState<unknown>(null);

  //can I do the same with useCallback?
  //what are the tradeoffs?
  const successRef = useRef(options.onSuccess);
  successRef.current = options.onSuccess;

  useEffect(() => {
    fakeFetchJson(options.url).then((data) => {
      setData(data);
      successRef.current?.();
    });
  }, [options.url]);

  return data;
};

export const App4 = () => {
  const data = useFetch({
    options: {
      url: '/todos/1',
      onSuccess: () => console.log('Data fetched successfully!'),
    },
  });

  return <div>{JSON.stringify(data)}</div>;
};
