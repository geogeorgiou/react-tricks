import { useMemo } from 'react';

const SorterComp = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const fullName = useMemo(
    () => `${firstName} ${lastName}`,
    [firstName, lastName],
  );

  return <div>{fullName}</div>;
};

export const App3 = () => {
  return <SorterComp firstName={'John'} lastName={'Doe'} />;
};
