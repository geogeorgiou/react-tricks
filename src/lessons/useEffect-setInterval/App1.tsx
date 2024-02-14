import { useEffect, useState } from 'react';

export const App1 = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => setCount(count + 1), 1000);
  }, []);

  return <div>{count}</div>;
};
