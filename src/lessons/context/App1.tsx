import { createContext, useContext, useState } from 'react';

type ContextType = {
  clickedTimes: number;
  handleClickIncrease: VoidFunction;
};

// Create a context with a default value
const Context = createContext<ContextType>({
  clickedTimes: 0,
  handleClickIncrease: () => {
    console.warn('tried to execute outside of ContextProvider');
  },
});

//create a custom hook for convenience
const useCustomContext = () => useContext(Context);

//a wrapper component that provides the context
const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [clickedTimes, setClickedTimes] = useState(0);

  const handleClickIncrease = () => {
    setClickedTimes((prev) => prev + 1);
  };

  return (
    <Context.Provider value={{ clickedTimes, handleClickIncrease }}>
      {children}
    </Context.Provider>
  );
};

//Important Questions:
//1. what happens to Child component if we add ContextProvider to Parent ?
//2. what happens to Child component if we add ContextProvider to Child and trigger updates from Child?
//3. what happens with value passed from Provider if we pass a new object every time?

const Parent = () => {
  const { handleClickIncrease, clickedTimes } = useCustomContext();

  return (
    <>
      Parent Comp{' '}
      <button onClick={handleClickIncrease}>
        Increase Child {clickedTimes}
      </button>
      <Child />
    </>
  );
};

const Child = () => {
  const { clickedTimes } = useCustomContext();

  return <div>Child Comp Clicked {clickedTimes}</div>;
};

export const App1 = () => {
  return (
    <ContextProvider>
      <Parent />
    </ContextProvider>
  );
};
