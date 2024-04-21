import { createContext, useContext, useState } from 'react';

type ContextType = {
  clickedTimes: number;
  handleClickIncrease: VoidFunction;
};

const Context = createContext<ContextType | undefined>(undefined);

//create a custom hook for convenience
const useCustomContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useCustomContext must be used within a ContextProvider');
  }
  return context;
};

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
  const { handleClickIncrease } = useCustomContext();

  console.log('Parent Rendered');

  return (
    <>
      Parent Comp <button onClick={handleClickIncrease}>Increase Child</button>
      <Child />
    </>
  );
};

const Child = () => {
  const { clickedTimes } = useCustomContext();

  return <div>Child Comp Clicked {clickedTimes}</div>;
};

export const App4 = () => {
  return (
    <ContextProvider>
      <Parent />
    </ContextProvider>
  );
};
