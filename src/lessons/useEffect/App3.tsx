import { useEffect, useState } from 'react';

type UseFetchArgs = {
  options: {
    url: string;
    onSuccess?: VoidFunction;
  };
};

const useFetch = ({ options }: UseFetchArgs) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(options.url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        options.onSuccess?.();
      });
  }, [options.url, options.onSuccess]);

  return data;
};

export const App3 = () => {
  const data = useFetch({
    options: {
      url: 'someUrl',
      onSuccess: () => console.log('Data fetched successfully!'),
    },
  });

  return <div>{JSON.stringify(data)}</div>;
};
