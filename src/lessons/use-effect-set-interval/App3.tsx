import { useEffect, useState } from 'react';

export const App3 = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCount((prev) => prev + 1), 1000);

    return () => clearInterval(t);
  }, []);

  return <div>{count}</div>;
};
