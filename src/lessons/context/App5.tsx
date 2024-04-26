import { createContext, use, useReducer } from 'react';

type Action = { type: 'increment' } | { type: 'decrement' };
type Dispatch = (action: Action) => void;
type State = { count: number };

const CountStateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const countReducer = (state: State, action: Action) => {
  if (action.type === 'increment') {
    return { count: state.count + 1 };
  }

  return { count: state.count - 1 };
};

const CountProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(countReducer, { count: 0 });
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch };
  return (
    <CountStateContext.Provider value={value}>
      {children}
    </CountStateContext.Provider>
  );
};

const useCount = () => {
  const context = use(CountStateContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
};

const Parent = () => {
  const { dispatch } = useCount();

  console.log('Parent Rendered');

  return (
    <>
      Parent Comp{' '}
      <button onClick={() => dispatch({ type: 'increment' })}>
        Increase Child
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        Decrease Child
      </button>
      <Child />
    </>
  );
};

const Child = () => {
  const {
    state: { count },
  } = useCount();

  return <div>Child Comp count {count}</div>;
};

export const App5 = () => {
  return (
    <CountProvider>
      <Parent />
    </CountProvider>
  );
};
