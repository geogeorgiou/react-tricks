import { useState } from 'react';

export const App1 = () => {
  const [count, setCount] = useState(0);

  function onAdd() {
    setCount(count + 1);
    console.log(`Count: ${count}`);
  }

  return <button onClick={onAdd}>{count}</button>;
};
