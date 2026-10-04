import { useMemo } from 'react';

const ThirdParty = ({ url }: { url: string }) => {
  //keeping reference to the options object
  const options = useMemo(() => {
    return {
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }, [url]);

  console.log(options);

  //TODO
  return null;
};

export const App4 = () => {
  return <ThirdParty url={'/someUrl'} />;
};
