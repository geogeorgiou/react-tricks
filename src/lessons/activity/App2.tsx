import { Activity, useState } from 'react';

type View = 'home' | 'counter';

const HomeView = () => <p>Welcome! Open the Counter view to count clicks.</p>;

const CounterView = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
};

export const App2 = () => {
  const [view, setView] = useState<View>('home');

  return (
    <div>
      <nav>
        <button onClick={() => setView('home')}>Home</button>
        <button onClick={() => setView('counter')}>Counter</button>
      </nav>
      <Activity mode={view === 'home' ? 'visible' : 'hidden'}>
        <HomeView />
      </Activity>
      <Activity mode={view === 'counter' ? 'visible' : 'hidden'}>
        <CounterView />
      </Activity>
    </div>
  );
};
