import viteLogo from '/vite.svg';
import './App.css';
import { App1 } from './lessons/consoleLog/App1';

function App() {
  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
      </div>
      <App1 />
    </>
  );
}

export default App;
