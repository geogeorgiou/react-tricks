import { useEffect, useState } from 'react';
import { fakeFetchJson } from './fake-api';

type UseFetchArgs = {
  options: {
    url: string;
    onSuccess?: VoidFunction;
  };
};

const useFetch = ({ options }: UseFetchArgs) => {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    fakeFetchJson(options.url).then((data) => {
      setData(data);
      options.onSuccess?.();
    });
  }, [options.url, options.onSuccess]);

  return data;
};

export const App3 = () => {
  const data = useFetch({
    options: {
      url: '/todos/1',
      onSuccess: () => console.log('Data fetched successfully!'),
    },
  });

  return <div>{JSON.stringify(data)}</div>;
};
