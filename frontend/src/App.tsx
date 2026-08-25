import { PlayerProvider } from './context/PlayerContext';
import { RadioLayout } from './components/RadioLayout';

function App() {
  return (
    <PlayerProvider>
      <RadioLayout />
    </PlayerProvider>
  );
}

export default App;