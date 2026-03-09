import { CheatingLogProvider, useCheatingLog } from './context/CheatingLogContext';

function App() {
  const { cheatingLog, updateCheatingLog, resetCheatingLog } = useCheatingLog();

  return <CheatingLogProvider>{/* Your existing app content */}</CheatingLogProvider>;
}

export default App;
