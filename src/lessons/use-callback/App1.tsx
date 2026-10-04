import { useEffect, useState } from 'react';

type ChildProps = {
  callbackFunction: () => number;
};

const Child = ({ callbackFunction }: ChildProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(value + 1);
  }, [callbackFunction]);

  return <p>Child: {value}</p>;
};

export const App1 = () => {
  const [count, setCount] = useState(0);
  const [another, setAnother] = useState(0);

  const countCallback = () => {
    return count;
  };

  return (
    <div>
      <Child callbackFunction={countCallback} />
      <button onClick={() => setCount(count + 1)}>Change callback</button>

      <button onClick={() => setAnother(another + 1)}>
        Do not change callback
      </button>
    </div>
  );
};
