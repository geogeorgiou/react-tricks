import { useState } from 'react';

export const App4 = () => {
  const [count, setCount] = useState(0);

  function onAdd() {
    setCount(count + 1);
    setCount((c) => {
      c = c + 1;
      c = c + 1;
      c = c + 1;
      return c;
    });
  }

  console.log(`Count: ${count}`);

  return <button onClick={onAdd}>{count}</button>;
};
