import { Activity, useState } from 'react';

type Tab = 'home' | 'counter';

const HomeTab = () => <p>Welcome! Open the Counter tab to count clicks.</p>;

const CounterTab = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
};

export const App2 = () => {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div>
      <div role='tablist'>
        <button
          role='tab'
          aria-selected={tab === 'home'}
          onClick={() => setTab('home')}>
          Home
        </button>
        <button
          role='tab'
          aria-selected={tab === 'counter'}
          onClick={() => setTab('counter')}>
          Counter
        </button>
      </div>
      <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={tab === 'counter' ? 'visible' : 'hidden'}>
        <CounterTab />
      </Activity>
    </div>
  );
};
