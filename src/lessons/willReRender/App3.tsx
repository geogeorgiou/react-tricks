import React, { useCallback } from 'react';

const Button = ({
  onClick,
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button onClick={onClick}>{children}</button>;
};

export const App3 = () => {
  const [count, setCount] = React.useState(0);

  const onShow = useCallback(() => {
    alert(count);
  }, [count]);

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
