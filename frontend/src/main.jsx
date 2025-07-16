// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importe ReactDOM do client
import App from './App.jsx';
import './index.css';

// Garante que o root seja criado apenas uma vez
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);