import { useState } from 'react';

export const App3 = () => {
  const [count, setCount] = useState(0);

  function onAdd() {
    setCount(count + 1);
    setCount((c) => {
      console.log(`Count: ${c}`);
      return c;
    });
  }

  return <button onClick={onAdd}>{count}</button>;
};
