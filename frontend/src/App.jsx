import { useEffect } from 'react';
import api from './services/api';

function App() {

  useEffect(() => {
    api.get('/')
      .then(res => console.log('API Response:', res.data)) //JSON Response from backend
      .catch(err => console.error('API Error:', err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <div className="glossy-black p-12 rounded-lg">
        <h1 className="text-6xl font-black uppercase tracking-tight text-chrome mb-4">
          Brat
        </h1>

        <p className="text-neon-green text-xl font-bold uppercase tracking-wide">
          Y2K Aesthetic Loaded ✨
        </p> 
      </div>
    </div>
  );
}

export default App;
