import { useIsReRender } from '@/common/hooks/useIsReRender';
import React from 'react';

const Button = ({
  onClick,
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  useIsReRender();

  return <button onClick={onClick}>{children}</button>;
};

export const App1 = () => {
  const [count, setCount] = React.useState(0);

  const onShow = () => {
    alert(count);
  };

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
