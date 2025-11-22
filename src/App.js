import React, { useState, useEffect } from 'react';
import './App.css';
import OTPForm from './components/OTPForm';
import { checkAPIHealth } from './services/api';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkAPI = async () => {
      const isHealthy = await checkAPIHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    };
    checkAPI();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Master</h1>
        <div className={`api-status ${apiStatus}`}>
          {apiStatus === 'checking' && 'Checking API connection...'}
          {apiStatus === 'connected' && '✓ Backend API Connected'}
          {apiStatus === 'disconnected' && '✗ Backend API Disconnected - Please start the server'}
        </div>
      </header>
      <main className="App-main">
        <OTPForm />
      </main>
    </div>
  );
}

export default App;
