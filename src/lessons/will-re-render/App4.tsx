import { useIsReRender } from '@/common/hooks/useIsReRender';
import React, { memo, useCallback, useRef } from 'react';

const Button = memo(
  ({ onClick, children }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    useIsReRender();

    return <button onClick={onClick}>{children}</button>;
  },
);

export const App4 = () => {
  const [count, setCount] = React.useState(0);

  const countRef = useRef(count);
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
