import { Suspense, use, useState } from 'react';
import { fetchBreweries, type Brewery } from './fake-api';

const BreweryList = ({
  breweriesPromise,
}: {
  breweriesPromise: Promise<Brewery[]>;
}) => {
  const breweries = use(breweriesPromise);

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

export const App3 = () => {
  // Created once, above the Suspense boundary
  const [breweriesPromise] = useState(fetchBreweries);

  return (
    <Suspense fallback='Loading...'>
      <BreweryList breweriesPromise={breweriesPromise} />
    </Suspense>
  );
};
