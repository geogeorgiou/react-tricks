import { Suspense, use } from 'react';

type Brewery = {
  id: number;
  name: string;
  address_1: string;
};

const breweryPromise = () => fetch('https://api.openbrewerydb.org/breweries');

const getBreweriesData = async (): Promise<Brewery[]> => {
  const delay = new Promise((resolve) => setTimeout(resolve, 300));

  //adds some custom delay
  const [response] = await Promise.all([breweryPromise(), delay]);

  const data = await response.json();
  return data;
};

export const App1 = () => {
  return (
    <Suspense fallback='Loading...'>
      <AppContent />
    </Suspense>
  );
};

const AppContent = () => {
  const data = use(getBreweriesData());
  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>
          {item.name} {item.address_1}
        </li>
      ))}
    </ul>
  );
};
