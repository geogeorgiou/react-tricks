import { Suspense, use } from 'react';
import { fetchBreweries } from './fake-api';

const BreweryList = () => {
  const breweries = use(fetchBreweries());

  return (
    <ul>
      {breweries.map((brewery) => (
        <li key={brewery.id}>
          {brewery.name} ({brewery.city})
        </li>
      ))}
    </ul>
  );
};

export const App2 = () => {
  return (
    <Suspense fallback='Loading...'>
      <BreweryList />
    </Suspense>
  );
};
