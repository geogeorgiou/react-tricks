import { createContext, use, useState } from 'react';

type ContextType = {
  clickedTimes: number;
  handleClickIncrease: VoidFunction;
  doNothing: VoidFunction;
};

const Context = createContext<ContextType | undefined>(undefined);

//create a custom hook for convenience
const useCustomContext = () => {
  const context = use(Context);
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

  const doNothing = () => {
    console.log('do nothing');
  };

  return (
    <Context.Provider value={{ clickedTimes, handleClickIncrease, doNothing }}>
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
      Parent Comp <button onClick={handleClickIncrease}>increase</button>
      <Child />
    </>
  );
};

const Child = () => {
  console.log('Child Rendered');

  const { doNothing } = useCustomContext();

  return (
    <div>
      Child Comp Clicked <button onClick={doNothing}>Trigger Update</button>
    </div>
  );
};

export const App4 = () => {
  return (
    <ContextProvider>
      <Parent />
    </ContextProvider>
  );
};
