import React, { useCallback } from 'react';

const Button = ({
  onClick,
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button onClick={onClick}>{children}</button>;
};

export const App4 = () => {
  const [count, setCount] = React.useState(0);

  const countRef = React.useRef(count);
  countRef.current = count;

  const onShow = useCallback(() => {
    alert(countRef.current);
  }, []);

  return (
    <>
      <input
        type='number'
        value={count}
        onChange={(e) => setCount(+e.target.value)}
      />
      <Button onClick={onShow}>Show</Button>
    </>
  );
};
