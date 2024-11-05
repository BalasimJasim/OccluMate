import React from 'react';
import { AuthProvider } from './components/context/authContext';
import Routes from './Routes';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes />
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
