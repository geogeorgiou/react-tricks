import { useState } from 'react';

export const App2 = () => {
  const [count, setCount] = useState(0);

  function onAdd() {
    setCount(count + 1);
  }

  console.log('count', count);

  return <button onClick={onAdd}>{count}</button>;
};
