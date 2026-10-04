import { useMemo } from 'react';

const SorterComp = ({ data }: { data: string[] }) => {
  const sortedName = useMemo(() => [...data].sort(), [data]);

  return (
    <div>
      {sortedName.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};

export const App1 = () => {
  return <SorterComp data={['John', 'Doe', 'Jane', 'Smith']} />;
};
