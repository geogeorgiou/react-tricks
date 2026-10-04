import { createContext, use, useState } from 'react';

const ThemeContext = createContext('light');

const Banner = ({ show }: { show: boolean }) => {
  if (!show) {
    return null;
  }

  // Called after an early return. Would useContext be allowed here?
  const theme = use(ThemeContext);
  console.log(`Banner read theme: ${theme}`);

  return <p>Current theme: {theme}</p>;
};

export const App1 = () => {
  const [show, setShow] = useState(false);

  return (
    <ThemeContext value='dark'>
      <button onClick={() => setShow((s) => !s)}>
        {show ? 'Hide' : 'Show'} banner
      </button>
      <Banner show={show} />
    </ThemeContext>
  );
};
