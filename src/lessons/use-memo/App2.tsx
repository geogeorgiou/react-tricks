import { useMemo } from 'react';

const AdderComp = ({ numbers }: { numbers: number[] }) => {
  const total = useMemo(() => numbers.reduce((n, a) => n + a, 0), [numbers]);

  return <div>Total: {total}</div>;
};

export const App2 = () => {
  return <AdderComp numbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />;
};
